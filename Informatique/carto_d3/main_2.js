// géométrie de la fenêtre
const width = window.innerWidth; //largeur fenêtre
const height = window.innerHeight; // heuteur fenêtre
const center = [width/2, height/2]; // centre de la fenêtre
const svg = d3.select('svg')            // svg prend toute la fenêtre
                .attr("width", width)
                .attr("height", height);

// groupes graphiques des éléments à afficher
const path_monde = svg.append('path').attr("id", "monde"); //monde
const path_graticule = svg.append("path").attr("id", "graticule"); // graticule
const gAirports = svg.append('g').attr('id',"gAirports"); // groupe aéroports
const gNomAirports = svg.append('g').attr('id',"gNomAirports"); // groupe noms des aéroports
const gWpt = svg.append('g').attr('id',"gWpt"); // groupe balises
const gSecteurs = svg.append('g').attr('id',"gSecteurs"); // groupe secteurs
const gNomSecteurs = svg.append('g').attr('id',"gNomSecteurs"); // groupe noms des secteurs
const gPistes = svg.append('g').attr('id',"gPistes"); // groupe pour les pistes

// initialisation de la projection
const projection = d3.geoOrthographic()
            .translate([width / 2, height / 2]) //centre de la projection est le centre de la fenêtre
            .rotate([-.3841,-45.1724,0]) // on se place face à la France
            .clipAngle(90) // rende invisible la face cachée de la projection

const geoPath = d3.geoPath().projection(projection);
let initialScale = 3000; // échelle pour voir la France
projection.scale(initialScale);

// variables pour interactivité
let moving = false; //drag en cours

var secVisibles = document.querySelector('input[value="secVus"]');
let sectoring = secVisibles.checked;
let boxSectoring=false; // boîte menu secteurs
let champNiveau= document.getElementById("chp_niveau"); // champ niveau pour les secteurs
let niveau= champNiveau.value; // valeur de niveau pour les secteurs
let bouton_ok = document.getElementById("btn_ok"); // validation niveau secteurs
let tabSecteurs=[]; //secteurs affichés
let affichageTousSecteurs=true;

var adVisibles = document.querySelector('input[value="adVus"]');
var nomAdVisibles = document.querySelector('input[value="nomAdVus"]');
let boxAirporting=false; // boîte menu secteurs
let airporting = adVisibles.checked;
let nomAirporting = nomAdVisibles.checked;

var wptVisibles = document.querySelector('input[value="wptVus"]');
let wpting=wptVisibles.checked;
let boxWpting=false; // boîte menu balises

let graticuling=false; // voir les graticules

// const nuancier17=["#d32f2f","#c2185b","#7b1fa2","#512da8","#303f9f","#1976d2","#0288d1","#0097a7",
                    // "#00796b","#388e3c","#689f38","#afb42b","#fbc02d","#ffa000","#f57c00","#e64a19","#5d4037"];
const maxPlotsPiste=3;
const iniRay=5;
// Tableau d'objets pistes initialement vide
const pistes=[];
// fonction permettant de retourner le dernier plot pour une piste ou -1 si la piste n existe pas
function getId(id){
	var r=-1;
        for (let i=0;i<pistes.length;i++)
	 {
         if (pistes[i].id==id) r=pistes[i].r;
         }
        return r;
       }
// Transforme une position en une position plus ancienne
function pastPlot(id)
      {
        console.log("Past plot id=%i",id);
        var index=-1;
        for (let i=0;i<pistes.length;i++)
         {
         if ((pistes[i].id==id))
		       {
              console.log("Reduction rayon %i -> %i",pistes[i].r,pistes[i].r-1);
              pistes[i].r--;
              if (pistes[i].r==iniRay-maxPlotsPiste) index=i;
        	 }
         }
         if (index!=-1){
           var elementsSupprimes = pistes.splice(index,1);
           console.log("Suppression %i",index);
         }

       }
// Ajout d un plot
function addPlot(id,lon,lat,vx,vy) {
      //  console.log("Function addPlot id=%s lon=%s lat=%s ",id,lon,lat);
    var r=getId(id);
   	if (r!=-1)
	    {
         if (r!=iniRay) {
           console.log("Ajout plot rayon %i",(r-1));
           pistes.push({'id' : id,'lon': lon,'lat' : lat, 'r': (r+1),'vx' : vx, 'vy' :vy     });
         }
         else
	  	     {
             console.log("Mouvement piste");
		         pastPlot(id);
             console.log("Ajout plot rayon %i",iniRay);
             pistes.push({'id' : id,'lon': lon,'lat' : lat, 'r': iniRay,'vx' : vx, 'vy' :vy   });
          }
      }
    else
	   {
         console.log("Creation Piste id=%s lon=%s lat=%s ",id,lon,lat);
         //var gPiste = gPistes.append('g').attr('id',id);
         console.log("Ajout plot rayon %i",iniRay);
         pistes.push({'id' : id,'lon': lon,'lat' : lat, 'r': iniRay-maxPlotsPiste+1,'vx' : vx, 'vy' :vy   });
      }
        //console.log(pistes);
    }

//addPlot(1,0,45,100,100);
//addPlot(1,0.05,45,100,100);
//addPlot(1,0.1,45,100,100);
//addPlot(1,0.15,45,100,100);
//addPlot(1,0.2,45,100,100);
//addPlot(1,0.25,45,100,100);
//console.log(pistes);
//addPlot(2,0,45,200,100);
//addPlot(2,0,45.5,200,100);
//addPlot(2,0,46,200,100);
//addPlot(2,0,46.5,200,100);

// liste des fichiers sources
const files = [ "maps/countries-110m.json", // data[0]
                "maps/countries-50m.json",
                "maps/Sectors.geojson",
                "maps/SIA.json"]; // data[3]
// on importe tous les fichiers
const promises = [];
files.forEach(function(url) {
    promises.push(d3.json(url))
});
// quand tous les fichiers sources sont chargés, on commence
Promise.all(promises).then(function(data) {

    const countries110m = topojson.feature(data[0], data[0].objects.countries);
    const countries50m = topojson.feature(data[1], data[1].objects.countries);
    const secteurs = data[2];
    const sia=data[3];

    // liste de secteurs
    var selectElem = document.getElementById('listeSecteursOn');
    let list_selected = selectElem.selectedOptions;
    // Quand un ou des secteurs sont selectionnés
    selectElem.addEventListener('change', function() {
        render();
    })

    // touches pour afficher ou non les menus
    let box_s=d3.select("#box_secteurs");
    let box_a=d3.select("#box_airports");
    let box_w=d3.select("#box_wpts");

    function CB_KeyUp(event) {
        switch (event.keyCode) {
            case 83: // Touche "S"
                boxSecteurOuPas();
                break;
            case 65: // Touche "A"
                boxAirportsOuPas();
                break;
            case 87: // Touche "W"
                boxWptOuPas();
                break;
        }
    }
    // gestion raccourcis clavier
    document.addEventListener("keyup", function (event) { CB_KeyUp(event) });


    ////////////////////////////////////////////////////////////////////
    //         RENDER                                                 //
    ////////////////////////////////////////////////////////////////////
    const render = () => {

        // dessin des latitudes et longitudes
        path_graticule.attr('d',"");
        if (graticuling){
            drawGraticule();
            d3.select("#menu_graticules").style("box-shadow",'3px 3px 3px #1a237e');
        }else{
            d3.select("#menu_graticules").style("box-shadow",'0px 0px 0px #1a237e');
        }

        // dessine la carte grossière quand on bouge le globe
        path_monde.attr('d', geoPath(moving ? countries110m : countries50m));

        // dessin aérodromes
        gAirports.selectAll("circle").remove();
        gNomAirports.selectAll("text").remove();
        if (airporting) {
            drawAirports(projection.scale()/(initialScale));
            d3.select("#menu_aeroports").style("box-shadow",'3px 3px 3px #7b1fa2');
            if (nomAirporting) {
                drawNomAirports(projection.scale()/(initialScale));
            }
        } else{
            if (nomAirporting) {
                drawNomAirports(projection.scale()/(initialScale));
                d3.select("#menu_aeroports").style("box-shadow",'3px 3px 3px #7b1fa2');
            } else{
                d3.select("#menu_aeroports").style("box-shadow",'0px 0px 0px #7b1fa2');
            }
        }

        // dessin balises
        gWpt.selectAll("path").remove();
        if (wpting) {
            drawWpt(projection.scale()/(initialScale));
            d3.select("#menu_wpts").style("box-shadow",'3px 3px 3px #0288d1');

        } else{
            d3.select("#menu_wpts").style("box-shadow",'0px 0px 0px #0288d1');
        }

        // affichage des secteurs selon options
        tabSecteurs=[];
        gSecteurs.selectAll("path").remove();
        gNomSecteurs.selectAll("text").remove();
        if (sectoring) {
            d3.select("#menu_secteurs").style("box-shadow",'3px 3px 3px #b71c1c');
            if(affichageTousSecteurs){
                // affichage de tous les secteurs
                drawSecteurs(niveau,projection.scale()/(0.3*(initialScale)));
                // liste des secteurs dans IHM
                listeSecteurs([]); // reinit liste secteurs pour eviter un reload de la page
                listeSecteurs(tabSecteurs.sort());
                selectElem.focus();
            } else {
                // affichage secteurs sélectionnés
                drawSecteursSelected(niveau,projection.scale()/(0.3*(initialScale)),list_selected);
            }
        } else {
            d3.select("#menu_secteurs").style("box-shadow",'0px 0px 0px #b71c1c');
        }
	gPistes.selectAll("circle").remove();
	drawPistes();

    }; // fin render
    ////////////////////////////////////////////////////////////////////////////////

    render();

    // NIVEAU
    // validation du changement de niveau
    bouton_ok.addEventListener('click', updateBtn);
    document.querySelector('#chp_niveau').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            updateBtn();
        }
    });
    function updateBtn() {
        // on actualise la valeur du niveau
        niveau = champNiveau.value;
        // on affiche tous les secteurs
        affichageTousSecteurs=true;
        render();
    }

    // DRAG et ZOOM
    let rotate0, coords0;
    const coords = () => projection.rotate(rotate0)
                                    .invert([d3.event.x, d3.event.y]);
    svg .call(d3.drag()
                    .on('start', () => {
                        rotate0 = projection.rotate();
                        coords0 = coords();
                        moving = true;
                    })
                    .on('drag', () => {
                        const coords1 = coords();
                        projection.rotate([
                        rotate0[0] + coords1[0] - coords0[0],
                        rotate0[1] + coords1[1] - coords0[1],
                        ]);
                        render();
                    })
                    .on('end', () => {
                        moving = false;
                        render();
                    })
        )
        .call(d3.zoom()
                .on('zoom', () => {
                    let f=initialScale * d3.event.transform.k;
                    projection.scale(f);
                    throttled (render(),20);
                    // render();
                })
        );

    function throttled (fn, delay) {
        let lastCall = 0;
        return () => {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            fn();
        };
    }

///////////////////////////////////
//        GRATICULES             //
///////////////////////////////////

    function drawGraticule() {
        const graticule = d3.geoGraticule()
            .step([10, 10]);
        path_graticule
            .datum(graticule)
            .attr("d", geoPath);
    }
    // graticule, ou pas
    function graticuleOuPas(){
        graticuling=!graticuling;
        render();
    }
    d3.select('#menu_graticules').on('click', graticuleOuPas);


///////////////////////////////////////////////
//           AERODROMES                      //
///////////////////////////////////////////////

    function nomAirportOuPas(){

        if(nomAdVisibles.checked){
            nomAirporting=true;
        } else {
            nomAirporting=false;
            }
        render();
    }
    d3.select('#btn_nomAirports').on('click', nomAirportOuPas);

    function airportOuPas(){

        if(adVisibles.checked){
            airporting=true;
        } else {
            airporting=false;
            }
        render();
    }
    d3.select('#btn_airports').on('click', airportOuPas);

    var deltaAirportsX,deltaAirportsY;
    function boxAirportsOuPas(){
        boxAirporting=!boxAirporting;
        if (boxAirporting){
            // var box=d3.select("#box_secteurs");
            // box secteurs ON
            box_a.style("display",'block')
                    .call(d3.drag()
                        .on('start', () => {
                            let left=Number(box_a.style("left").replace(/px$/, ''));
                            let right=Number(box_a.style("top").replace(/px$/, ''));
                            deltaAirportsX=left-d3.event.x;
                            deltaAirportsY=right-d3.event.y;
                        })
                        .on('drag', throttled (() => {
                            box_a.style("top",(d3.event.y+deltaAirportsY));
                            box_a.style("left",(d3.event.x+deltaAirportsX));
                        },20))
                        .on('end', () => {
                        })
                    );
        }else {
            box_a.style("display",'none');
        }
        // render();
    }
    d3.select('#menu_aeroports').on('click', boxAirportsOuPas);

        // dessin aéroports
        function drawAirports(r) {

            const siaAirports=gAirports.selectAll('circle')
                    .data(sia.SiaExport.Situation.AdS.Ad);
            siaAirports
                .enter()
                // .filter (function(d, i){
                //     let code = d["AdStatut"];
                //     if (code=="CAP") return d; else return
                // })
                .append('circle')
                    .merge(siaAirports)
                    .attr('id',"airportsFrance")
                    .attr('cx', d => projection([d.ArpLong, d.ArpLat])[0])
                    .attr('cy', d => projection([d.ArpLong, d.ArpLat])[1])
                    .attr('visibility', function (d,i) {
                        let visible = geoPath(
                        {type: 'Point', coordinates: [d.ArpLong,d.ArpLat]});
                        //   console.log(visible);
                        return visible ? 'visible' : 'hidden';

                    })
                    .attr('r', function (d,i) {
                        if (r<=16){
                            return r/2;
                        } else {
                            return 8;}
                    });
                    console.log(siaAirports);
        }

        function drawNomAirports(r) {
            const siaNomAirports=gNomAirports.selectAll('text')
                    .data(sia.SiaExport.Situation.AdS.Ad);
            siaNomAirports
                .enter()
                .append("text")
                .attr('id',"nomAirportsFrance")
                    .attr('x', d => projection([d.ArpLong, d.ArpLat])[0])
                    .attr('y', d => projection([d.ArpLong, d.ArpLat])[1])
                    .text(d => d.AdNomCarto)
                    .attr('visibility', function (d,i) {
                        //si le point est à l'arrière de la projection visible est undefined et donc non visible (hidden)
                            let visible = geoPath({type: 'Point', coordinates: [d.ArpLong,d.ArpLat]});
                            return visible ? 'visible' : 'hidden';
                        })
                    .style("font-size",function (d,i) {
                            if (r<=14){
                                return r;
                            } else {
                                return 14;}
                        });
        }
///////////////////////////////////////////////
//           PISTES                          //
///////////////////////////////////////////////
function drawPistes() {
            gPistes.selectAll('circle')
                .data(pistes)
                .enter()
                .append('circle')
                    .attr('id',"piste")
                    .attr('cx', function(d) { return projection([d['lon'], d['lat']])[0] })
                    .attr('cy', function(d) { return projection([d['lon'], d['lat']])[1] })
                    .attr('visibility', function (d,i) {
                        let visible = geoPath(
                        {type: 'Point', coordinates: [d['lon'], d['lat']]});
                        //   console.log(visible);
                        return visible ? 'visible' : 'hidden';
                    })
                    .attr('r', function (d) { return d['r']});

        }
// Partie dynamique
var socket = io();

socket.on('track',function(msg){
      var res1 = msg+'';
      var res=res1.split(' ');
      var id=Number(res[1].split('=')[1]);
      var lon=Number(res[2].split('=')[1]);
      var lat=Number(res[3].split('=')[1]);
      var vx=Number(res[4].split('=')[1]);
      var vy=Number(res[5].split('=')[1]);
      addPlot(id,lon,lat,vx,vy);
      render();
     })



///////////////////////////////////////////////
//           BALISES                         //
///////////////////////////////////////////////
    function WptOuPas(){

        if(wptVisibles.checked){
            wpting=true;
        } else {
            wpting=false;
            }
        render();
    }
    d3.select('#btn_wpt').on('click', WptOuPas);

    var deltaWptX,deltaWptY;
    function boxWptOuPas(){
        boxWpting=!boxWpting;
        if (boxWpting){

            box_w.style("display",'block')
                    .call(d3.drag()
                        .on('start', () => {
                            let left=Number(box_w.style("left").replace(/px$/, ''));
                            let right=Number(box_w.style("top").replace(/px$/, ''));
                            deltaWptX=left-d3.event.x;
                            deltaWptY=right-d3.event.y;
                        })
                        .on('drag', throttled (() => {
                            box_w.style("top",(d3.event.y+deltaWptY));
                            box_w.style("left",(d3.event.x+deltaWptX));
                        },20))
                        .on('end', () => {
                        })
                    );
        }else {
            box_w.style("display",'none');
        }
        // render();
    }
    d3.select('#menu_wpts').on('click', boxWptOuPas);

        // dessin balisess
        function drawWpt(r) {
            console.log("draw balises");
            let siaWpt=gWpt.selectAll("path")
                    .data(sia.SiaExport.Situation.NavFixS.NavFix);
            // console.log(siaWpt);
            siaWpt
                .enter()
                .filter (function(d, i){
                    let codeIdent = d["NavType"];
                    if (codeIdent=="WPT") return d; else return
                })
                .append('path')
                    .merge(siaWpt)
                    .attr('id',"WPTsFrance")
                    .attr("d", d3.symbol()
                                    .type(d3.symbolTriangle)
                                    .size(function(d){
                                        if (r<=50){
                                            return r/4;
                                        } else {
                                            return 50;}
                                        }))
                    .attr("transform", function(d) { return "translate("
                                        + projection([d.Longitude, d.Latitude])[0]
                                        + ","
                                        + projection([d.Longitude, d.Latitude])[1]
                                        + ")"; })
                    .attr('visibility', function (d,i) {
                        let visible = geoPath(
                        {type: 'Point', coordinates: [d.Longitude,d.Latitude]});
                        //   console.log(visible);
                        return visible ? 'visible' : 'hidden';

                    })
                    // .attr('r', function (d,i) {
                    //     if (r<=12){
                    //         return r/4;
                    //     } else {
                    //         return 12;}
                    // })
                    ;
            console.log(siaWpt);

        }

///////////////////////////////////
//           SECTEURS            //
///////////////////////////////////

    function secteurOuPas(){

        // console.log(secVisibles.checked);
        if(secVisibles.checked){
            sectoring=true;
        } else {
            sectoring=false;
        }
        render();
    }
    d3.select('#btn_secteurs').on('click', secteurOuPas);

    var deltaSecteursX,deltaSecteursY;
    function boxSecteurOuPas(){
        boxSectoring=!boxSectoring;
        if (boxSectoring){
            // var box=d3.select("#box_secteurs");
            // box secteurs ON
            box_s.style("display",'block')
                    .call(d3.drag()
                        .on('start', () => {
                            d3.select("#chp_niveau").call(d3.drag()
                                                        .on('start',()=>{
                                                            // console.log("drag niveau");
                                                        }));
                            let left=Number(box_s.style("left").replace(/px$/, ''));
                            let right=Number(box_s.style("top").replace(/px$/, ''));
                            deltaSecteursX=left-d3.event.x;
                            deltaSecteursY=right-d3.event.y;
                        })
                        .on('drag', throttled (() => {
                            box_s.style("top",(d3.event.y+deltaSecteursY));
                            box_s.style("left",(d3.event.x+deltaSecteursX));
                        },20))
                        .on('end', () => {
                        })
                    );
        }else {
            box_s.style("display",'none');
        }
        // render();
    }
    d3.select('#menu_secteurs').on('click', boxSecteurOuPas);

// dessine les secteurs du niveau
function drawSecteurs(level, fontSize) {

    affichageTousSecteurs=false;

    const noms = gNomSecteurs.selectAll('text')
                    .data(secteurs.features);

    noms.enter()
        .filter (function(d, i){
            let floor = parseInt(d["properties"]["floor"]);
            let ceiling = parseInt(d["properties"]["ceiling"]);
            if ((floor<=level)&&(level<=ceiling)) return d; else return
        })
        .append("text")
        .merge(noms)
        .attr('id',"secTxt")
        .attr('x', d => (projection(geometric.polygonCentroid(d['geometry']['coordinates'][0]))[0])-fontSize)
        .attr('y', d => (projection(geometric.polygonCentroid(d['geometry']['coordinates'][0]))[1])/*+fontSize*/)
        .style('font-size', fontSize)
        .text(function (d){
            tabSecteurs.push(d["properties"]["sectorName"]);
            return d["properties"]["sectorName"]
        });

    const sectors = gSecteurs.selectAll('path')
            .data(secteurs.features);
    sectors
        .enter()
        .filter (function(d, i){
            let floor = parseInt(d["properties"]["floor"]);
            let ceiling = parseInt(d["properties"]["ceiling"]);
            if ((floor<=level)&&(level<=ceiling)) return d; else return
            })
        .append('path')
        .merge(sectors)
        .attr('d', geoPath)
        .attr('id',"secFrance")
        .style('fill', (function(d, i){
            return d3.schemeCategory10[Math.floor(i%10)]})
        )
}

function listeSecteurs(tS){

    // taille du menu en fonction du nombre d'éléments contenus
    // d3.select('select').attr('size', tS.length);

    // ajout de lignes (option en html) dans le menu
    var liste=d3.select('select').selectAll('option')
        .data(tS); // tableau des noms de secteurs au niveau choisi

    liste.exit().remove();

    liste.enter()
        .append('option') // ajout d'un "option" à ceux existants
        .attr('value', function (d) { return d; }) // sa valeur est le nom de secteur
        .attr('selected', "true") // sélectionné
        .text(function (d) { return d; }) // texte à afficher: son nom
        .merge(liste) // on ajoute le nouveau à la liste des précédents
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click",handleMouseOut);
}

function handleMouseOver(nom, ind) {  // survol du menu

    const sectors = gSecteurs.selectAll('path')
            .data(secteurs.features);
    sectors
        .enter()
        .filter (function(d, i){
            if (d["properties"]["sectorName"]===nom) return d; else return
            })
        .append('path')
        .merge(sectors)
        .attr('d', geoPath)
        .attr('id',"secSurvol");
}

function handleMouseOut(nom, ind) {  // non survol
const sectors = gSecteurs.selectAll('path')
        .data(secteurs.features);
sectors
    .enter()
    .filter (function(d, i){
        if (d["properties"]["sectorName"]===nom) return d; else return
        })
    .remove()

render();
}

// dessine les secteurs sélectionnés dans le menu
function drawSecteursSelected(level, fontSize, listed){

// création tableau avec les noms des secteurs sélectionnés
let tableau =[];
for (let i=0; i<listed.length; i++) {
    tableau.push(listed[i].value);
}

const noms = gNomSecteurs.selectAll('text')
                    .data(secteurs.features);

noms.enter()
    .filter (function(d, i){
        let floor = parseInt(d["properties"]["floor"]);
        let ceiling = parseInt(d["properties"]["ceiling"]);
        let name= d["properties"]["sectorName"];
        if ((floor<=level)&&(level<=ceiling)&&(tableau.includes(name))) return d; else return
        // ajout du test sur le nom des secteurs sélectionnés dans le menu
    })
    .append("text")
    .merge(noms)
    .attr('id',"secTxt")
    .attr('x', d => (projection(geometric.polygonCentroid(d['geometry']['coordinates'][0]))[0])-fontSize)
    .attr('y', d => (projection(geometric.polygonCentroid(d['geometry']['coordinates'][0]))[1])+fontSize)
    .style('font-size', fontSize)
    .text(function (d){
        tabSecteurs.push(d["properties"]["sectorName"]);
        return d["properties"]["sectorName"]
    });

const sectors = gSecteurs.selectAll('path')
        .data(secteurs.features);
sectors
    .enter()
    .filter (function(d, i){
        let floor = parseInt(d["properties"]["floor"]);
        let ceiling = parseInt(d["properties"]["ceiling"]);
        let name= d["properties"]["sectorName"];
        if ((floor<=level)&&(level<=ceiling)&&(tableau.includes(name))) return d; else return
        // ajout du test sur le nom des secteurs sélectionnés dans le menu

        })
    .append('path')
    .merge(sectors)
    .attr('d', geoPath)
    .attr('id',"secFrance")
    .style('fill', (function(d, i){
        return d3.schemeCategory10[Math.floor(i%10)]})
    )
}

});
