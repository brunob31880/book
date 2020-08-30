const MARGIN = 5;
//Variables
const width=700;
const height=700;
let graticuling=true; // voir les graticules
let sectoring=false;
const maxPlotsPiste=3;
const iniRay=5;
const minLodScale=1500;
// Tableau d'identifiants de pistes
var pistesIds=[]
// Tableau d'objets pistes initialement vide (tableau associatif clef=id value=tableau de plots)
var pistes={};
var render = function() {};
var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
r0, // Projection rotation as Euler angles at start.
q0; // Projection rotation as versor at start.
var map = {};
var secteurs;
map.svg =d3.select('svg');

map.canvas =d3.select('canvas');

const gSecteurs = map.svg.append('g').attr('id',"gSectors"); // groupe pour les Secteurs
const gPistes = map.svg.append('g').attr('id',"gPistes"); // groupe pour les pistes

//https://bl.ocks.org/vasturiano/825ea5fe26c1dd9172efc3dc849e6fe3
//http://bl.ocks.org/sxv/4485778
//https://engineering.mongodb.com/post/d3-round-two-how-to-blend-html5-canvas-with-svg-to-speed-up-rendering

const ctx = map.canvas.node().getContext('2d');
//map.nodes = map.svg.nodes.concat( map.canvas.nodes );
//var root = map.nodes[0];
//root.r = 0;
//root.fixed = true;

var cautra = "+proj=stere +k=0.000539957 +lat_0=47 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs";
var projCautra=proj4(cautra);
var coords=proj4(projCautra,[0,47]);
console.log(coords);


actualScale=(Math.min(700, 700)) / 2 - MARGIN;
const projection = d3.geoOrthographic()
.scale(actualScale)
.translate([700 / 2, 700 / 2]);

const path = d3.geoPath()
.context(ctx)
.projection(projection);

const pathSVG = d3.geoPath().projection(projection);

const graticule = d3.geoGraticule()
.step([10, 10]);

// fonction permettant de retourner le rayon du dernier plot pour une piste ou -1 si la piste n existe pas
function getId(id){
  var r=-1;
  if (pistes[id]==undefined) {
    console.log("Piste idPiste=%i inexistante",id);
    return r;
  }
  else {
    var pisteId=pistes[id];
    for (let i=0;i<pisteId.length;i++)
    {
      if (pisteId[i].id==id) r=pisteId[i].r;
    }
    return r;
  }
}
// Transforme une position en une position plus ancienne
function pastPlot(id)
{
  if (pistes[id]==undefined) {
    console.log("Piste idPiste=%i inexistante",id);
    return ;
  }
  else {
    console.log("Past plot idPiste=%i",id);
    var pisteId=pistes[id];
    var index=-1;
    for (let i=0;i<pisteId.length;i++)
    {
      if ((pisteId[i].id==id))
      {
        console.log("Reduction rayon %i -> %i",pisteId[i].r,pisteId[i].r-1);
        pisteId[i].r--;
        if (pisteId[i].r==iniRay-maxPlotsPiste) index=i;
      }
    }
    if (index!=-1){
      var elementsSupprimes = pisteId.splice(index,1);
      console.log("Suppression %i",index);
    }
  }
}
// Ajout d un plot
function addPlot(id,callsign,lon,lat,vx,vy) {
  //  console.log("Function addPlot id=%s lon=%s lat=%s ",id,lon,lat);
  var r=getId(id);
  if (r!=-1)
  {
    if (r!=iniRay) {
      console.log("Ajout plot rayon %i",(r-1));
      pistes[id].push({'id' : id,'callsign' : callsign,'lon': lon,'lat' : lat, 'r': (r+1),'vx' : vx, 'vy' :vy     });
    }
    else
    {
      console.log("Mouvement piste");
      pastPlot(id);
      console.log("Ajout plot rayon %i",iniRay);
      pistes[id].push({'id' : id,'callsign' : callsign,'lon': lon,'lat' : lat, 'r': iniRay,'vx' : vx, 'vy' :vy   });
    }
  }
  else
  {
    console.log("Creation Piste idPiste=%s lon=%s lat=%s ",id,lon,lat);
    pistesIds.push(id);
    var gPiste=gPistes.append('g').attr('id',id).attr('transform', map.svg.transform);;
    pistes[id]=[];
    console.log("Ajout plot rayon %i",iniRay);
    pistes[id].push( {'id' : id,'callsign' : callsign,'lon': lon,'lat' : lat, 'r': iniRay-maxPlotsPiste+1,'vx' : vx, 'vy' :vy   });
  }
  //console.log(pistes);
}
function testPistes(){
  for (let i=1;i<=300;i++){
    addPlot(i,"AFR"+i,i/300,45,200,200);
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

}
//testPistes();

//Gestion menu
// graticule, ou pas
function graticuleOuPas(){
    graticuling=!graticuling;
    if (graticuling){
        d3.select("#menu_graticules").style("box-shadow",'3px 3px 3px #1a237e');
    }else{
        d3.select("#menu_graticules").style("box-shadow",'0px 0px 0px #1a237e');
    }
    render();
}
d3.select('#menu_graticules').on('click', graticuleOuPas);
function secteursOuPas(){
    sectoring=!sectoring;
    if (sectoring){
        d3.select("#menu_secteurs").style("box-shadow",'3px 3px 3px #1a237e');
    }else{
        d3.select("#menu_secteurs").style("box-shadow",'0px 0px 0px #1a237e');
    }
    render();
}
d3.select('#menu_secteurs').on('click', secteursOuPas);

//  dessin des graticules
function drawGraticules(){
  ctx.beginPath();
  path(graticule());
  ctx.strokeStyle = "#666";
  ctx.stroke();
}
//
///////////////////////////////////////////////
//           PISTES                          //
///////////////////////////////////////////////

function drawPiste(id) {
  var tagId="[id=\""+id+"\"]";
  //console.log(tagId);
  gPistes.select(tagId).selectAll('circle')
  .data(pistes[id])
  .enter()
  .append('circle')
  .attr('id',"piste")
  .attr('cx', function(d) { return projection([d['lon'], d['lat']])[0] })
  .attr('cy', function(d) { return projection([d['lon'], d['lat']])[1] })
  .attr('visibility', function (d,i) {
    let visible = pathSVG(
      {type: 'Point', coordinates: [d['lon'], d['lat']]});
      //   console.log(visible);
      return visible ? 'visible' : 'hidden';
    })
  .attr('r', function (d) { return d['r']})
	.on("mouseover", function() {d3.select(this).style("stroke", "pink")})
  .on("mouseout", function() {d3.select(this).style("stroke", "black")});
  }
  //
  function drawPisteSpeed(id) {
    var tagId="[id=\""+id+"\"]";
    gPistes.select(tagId).selectAll('line')
    .data(pistes[id])
    .enter()
    .filter(function(d) { return d['r'] == iniRay })
    .append("line")
    .attr('id',"speedvector")
    .attr("x1", function(d) { return projection([d['lon'], d['lat']])[0]})
    .attr("y1", function(d) { return projection([d['lon'], d['lat']])[1]})
    .attr("x2", function(d) { return projection([d['lon'], d['lat']])[0]+d['vx']/10})
    .attr("y2", function(d) {return projection([d['lon'], d['lat']])[1]-d['vy']/10})
    .attr("stroke-width", 2)
    .attr('visibility', function (d,i) {
      let visible = pathSVG(
        {type: 'Point', coordinates: [d['lon'], d['lat']]});
        //   console.log(visible);
        return visible ? 'visible' : 'hidden';
      })
    .attr("stroke", "black");
  }
  // Partie dynamique
  var socket = io();
  socket.on('track',function(msg){
    var res1 = msg+'';
    var res=res1.split(' ');
    var id=Number(res[1].split('=')[1]);
    var callsign=res[2].split('=')[1];
    var x=Number(res[6].split('=')[1]);
    var y=Number(res[7].split('=')[1]);
    var vx=Number(res[8].split('=')[1]);
    var vy=Number(res[9].split('=')[1]);
//    https://bl.ocks.org/pnavarrc/5bb1a7c2b4c5b624bb83
    var coords=proj4(projCautra).inverse([x,y]);
    console.log("Position lon=%f lat=%f",coords[0],coords[1]);
    addPlot(id,callsign,coords[0],coords[1],vx,vy);
    render();
  })
  // Dessin des secteurs
 function drawSecteursSVG(level){
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
       .attr('d', pathSVG)
       .attr('id',"secFrance")
       // https://www.d3-graph-gallery.com/graph/custom_color.html
       //.style('fill', (function(d, i){
        //    return d3.schemeCategory10[Math.floor(i%10)]})
       //)
       .style('fill', "rgba(137, 196, 234, 0.1)")
       .style('stroke', "rgba(255, 2555, 255, 0.9)");

 }
  //
  function renderSVG(){
    gPistes.selectAll("circle").remove();
    gPistes.selectAll("line").remove();
    gSecteurs.selectAll("path").remove();
    if (actualScale>minLodScale) {
      console.log("Mode SVG");
      for(var i in pistesIds) {
      //  console.log("Dessin de la piste idPiste=%i",pistesIds[i]);
        drawPiste(pistesIds[i]);
        drawPisteSpeed(pistesIds[i]);
        if (sectoring) drawSecteursSVG(350);
      }
    }
  }

  d3.json("maps/Sectors.geojson",sectors => {
    secteurs = sectors;
  //  console.log("Nombre de secteurs =%i",sectors.length);
});
  //https://www.datavis.fr/index.php?page=migration-v4
  function zoomstarted() {
    v0 = versor.cartesian(projection.invert(d3.mouse(this)));
    r0 = projection.rotate();
    q0 = versor(r0);
  }

  function zoomed() {
    actualScale=d3.event.transform.k * (700 - 10) / 2;
    console.log(actualScale);
    projection.scale(actualScale);
    //console.log(scaled);
    var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this))),
    q1 = versor.multiply(q0, versor.delta(v0, v1)),
    r1 = versor.rotation(q1);
    projection.rotate(r1);
    render();
  }
https://bl.ocks.org/veltman/f539d97e922b918d47e2b2d1a8bcd2dd
  d3.select('body').call(d3.zoom()
  .on("start", zoomstarted)
  .on('zoom', zoomed));



  d3.json("maps/countries-110m.json", world => {
    function renderCanvas() {
      ctx.clearRect(0, 0, map.canvas.attr('width'), map.canvas.attr('height'));

      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.fillStyle = "#03224c";
      ctx.fill();

      ctx.beginPath();
      path(topojson.feature(world, world.objects.countries));
      ctx.strokeStyle = "#000";
      ctx.lineWidth=2;
      ctx.stroke();
      ctx.lineWidth=1;
      ctx.fillStyle = "#AAA";
      ctx.fill();

      if (graticuling) drawGraticules();
      if (actualScale<=minLodScale) {
        console.log("Mode CANVAS");
        for(let i in pistesIds) {
          let piste=pistes[pistesIds[i]];
          //console.log(piste);
          for (let j=0;j<piste.length;j++){
            let plot=piste[j];
            //console.log(plot);
            let ray=iniRay-(maxPlotsPiste - piste.length);
            if (plot['r']==ray){
              //console.log("dessin plot ",plot['r']);
              ctx.strokeStyle = "#000";
    			    ctx.beginPath();
              let pos=projection([plot['lon'], plot['lat']]);
    			    ctx.arc(pos[0], pos[1], plot['r'], 0, 2*Math.PI);
    			    ctx.stroke();
            }

          }

        }
      }
    }
    //
    render=function(){
      renderCanvas();
      renderSVG();
    };
    render();
  });
