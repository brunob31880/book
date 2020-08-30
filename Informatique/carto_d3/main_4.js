const MARGIN = 5;
//Variables
// géométrie de la fenêtre
const width = window.innerWidth; //largeur fenêtre
const height = window.innerHeight; // heuteur fenêtre
const center = [width/2, height/2]; // centre de la fenêtre
let graticuling=true; // voir les graticules
const maxPlotsPiste=3;
const iniRay=5;
// Tableau d'identifiants de pistes
var pistesIds=[]
// Tableau d'objets pistes initialement vide (tableau associatif clef=id value=tableau de plots)
var pistes={};
var render = function() {};
var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
r0, // Projection rotation as Euler angles at start.
q0; // Projection rotation as versor at start.
var map = {};
map.width = 960;
map.height = 800;

var menu = [
	{
		title: 'Item #1',
		action: function(d, i) {
			console.log('Item #1 clicked!');
			console.log('The data for this circle is: ' + d);
		},
		disabled: false // optional, defaults to false
	},
	{
		title: 'Item #2',
		action: function(d, i) {
			console.log('You have clicked the second item!');
			console.log('The data for this circle is: ' + d);
		}
	}
]
map.svg =
d3.select('body')
.append('svg')
.attr('width', map.width)
.attr('height', map.height);

map.canvas =
d3.select('body')
.append('canvas')
.attr('width', map.width)
.attr('height', map.height);


const gPistes = map.svg.append('g').attr('id',"gPistes"); // groupe pour les pistes
gPistes.append('rect')
.attr('class', 'overlay')
.attr('width', map.width)
.attr('height', map.height);

var data = [1, 2, 3];
//https://bl.ocks.org/vasturiano/825ea5fe26c1dd9172efc3dc849e6fe3
//http://bl.ocks.org/sxv/4485778
//https://engineering.mongodb.com/post/d3-round-two-how-to-blend-html5-canvas-with-svg-to-speed-up-rendering
function showMenu(){
  gPistes.selectAll('circles')
  	.data(data)
  	.enter()
  	.append('circle')
  	.attr('r', 30)
  	.attr('fill', 'steelblue')
  	.attr('cx', function(d) {
  		return 100;
  	})
  	.attr('cy', function(d) {
  		return d * 100;
  	})
    .on('contextmenu', d3.contextMenu(menu)); // attach menu to element
}

const ctx = map.canvas.node().getContext('2d');
//map.nodes = map.svg.nodes.concat( map.canvas.nodes );
//var root = map.nodes[0];
//root.r = 0;
//root.fixed = true;
/*
projection = d3.geoConicConformal().parallels([35, 65])
.scale(width)
.center([0, 45])
.translate([width / 2, height / 2])
.clipExtent([[0, 0], [width, height]])
.precision(0.5)
*/
const projection = d3.geoOrthographic()
.scale((Math.min(width, height)) / 2 - MARGIN)
.translate([width / 2, height / 2]);

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
function addPlot(id,lon,lat,vx,vy) {
  //  console.log("Function addPlot id=%s lon=%s lat=%s ",id,lon,lat);
  var r=getId(id);
  if (r!=-1)
  {
    if (r!=iniRay) {
      console.log("Ajout plot rayon %i",(r-1));
      pistes[id].push({'id' : id,'lon': lon,'lat' : lat, 'r': (r+1),'vx' : vx, 'vy' :vy     });
    }
    else
    {
      console.log("Mouvement piste");
      pastPlot(id);
      console.log("Ajout plot rayon %i",iniRay);
      pistes[id].push({'id' : id,'lon': lon,'lat' : lat, 'r': iniRay,'vx' : vx, 'vy' :vy   });
    }
  }
  else
  {
    console.log("Creation Piste idPiste=%s lon=%s lat=%s ",id,lon,lat);
    pistesIds.push(id);
    var gPiste=gPistes.append('g').attr('id',id).attr('transform', map.svg.transform);;
    pistes[id]=[];
    console.log("Ajout plot rayon %i",iniRay);
    pistes[id].push( {'id' : id,'lon': lon,'lat' : lat, 'r': iniRay-maxPlotsPiste+1,'vx' : vx, 'vy' :vy   });
  }
  //console.log(pistes);
}

addPlot(1,0,45,100,100);
addPlot(1,0.05,45,100,100);
addPlot(1,0.1,45,100,100);
addPlot(1,0.15,45,100,100);
addPlot(1,0.2,45,100,100);
addPlot(1,0.25,45,100,100);
//console.log(pistes);
//addPlot(2,0,45,200,100);
//addPlot(2,0,45.5,200,100);
//addPlot(2,0,46,200,100);
//addPlot(2,0,46.5,200,100);



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
  .attr('r', function (d) { return d['r']});
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
    .attr("stroke", "black");
  }
  // Partie dynamique
  var socket = io();
/*
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
*/
  //
  function renderSVG(){
    gPistes.selectAll("circle").remove();
    gPistes.selectAll("line").remove();
    for(var i in pistesIds) {
      console.log("Dessin de la piste idPiste=%i",pistesIds[i]);
      drawPiste(pistesIds[i]);
      drawPisteSpeed(pistesIds[i]);
    }
  }
  function zoomstarted() {
    v0 = versor.cartesian(projection.invert(d3.mouse(this)));
    r0 = projection.rotate();
    q0 = versor(r0);
  }

  function zoomed() {
    projection.scale(d3.event.transform.k * (height - 10) / 2);

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
      ctx.stroke();
      ctx.fillStyle = "#AAA";
      ctx.fill();

      if (graticuling) drawGraticules();
    }
    //
    render=function(){
      renderCanvas();
      renderSVG();
      showMenu();
    };
    render();
  });
