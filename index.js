// Require express and create an instance of it
var express = require('express');
//import {promises as fs} from "fs";
var io=require ('socket.io');
var ivyBus=require ('node-ivy');
var http= require('http');
var path=require ('path');
const router = express.Router();
var app = express();
var exec = require('child_process').exec, child;
// Ajout de repertoires pour les données
app.use(express.static('.'));
app.use(express.static('Mooc'));
app.use(express.static('Informatique'));
app.use(express.static('Informatique/D3'));
app.use(express.static('Informatique/IA'));
app.use(express.static('Informatique/NodeJS'));
app.use(express.static('Informatique/VueJS'));
app.use(express.static('Informatique/ReactJS'));
app.use(express.static('Informatique/ReactJS/build2'));
app.use(express.static('Informatique/ReactJS/build2/static'));
app.use(express.static('Informatique/ReactJS/build1'));
app.use(express.static('Informatique/ReactJS/build1/static'));
app.use(express.static('Informatique/Graphiques'));
app.use(express.static('Informatique/carto_d3'));
app.use(express.static('Informatique/Javascript'));
app.use(express.static('Informatique/carto_d3/source'));
app.use(express.static('Informatique/carto_d3/maps'));
app.use(express.static('Mathematiques'));
app.use(express.static('Philosophie'));
app.use(express.static('Personel'));
app.use(express.static('AviationCivile'));
app.use(express.static('Ecologie'));
app.use(express.static('Economie'));
app.use(express.static('Collapsologie'));
app.use(express.static('Reflexions'));
app.use(express.static('Images'));
//Correspondance pour les routes
// localhost:3005/
app.get('/', function (req, res) {
   res.sendFile("index.htm", { root: __dirname });
});
// On localhost:3005/info
app.get('/info.html', function (req, res) {
	res.sendFile("info.htm", { root: __dirname });
});
// On localhost:3005/ac
app.get('/ac.html', function (req, res) {
	res.sendFile("ac.htm", { root: __dirname });
});
// On localhost:3005/math
app.get('/math.html', function (req, res) {
	res.sendFile("math.htm", { root: __dirname });
});
// On localhost:3005/philo
app.get('/philo.html', function (req, res) {
	res.sendFile("philo.htm", { root: __dirname });
});
// On localhost:3005/economie
app.get('/economie.html', function (req, res) {
	res.sendFile("economie.htm", { root: __dirname });
});
// On localhost:3005/economie
app.get('/ecologie.html', function (req, res) {
	res.sendFile("ecologie.htm", { root: __dirname });
});

//app.get("/d3", (req, res) => {
//  res.sendFile(__dirname + "/d3.html");
//});
// Message 404
app.use(function(req, res, next) {
    res.status(404).send("Cette route n existe pas)");
});
app.use('/', router);

// http.Server
var server=http.createServer(app);
// Socket.io
var ioListen=io.listen(server);

//  Demarrage du serveur sur le port 3005
server.listen(3005, function () {
	console.log('Listening on port 3005.');
});
// Passerelle Ivy
var ivy = new ivyBus("WebServer", "192.168.1.255",3111);
//Binding Ivy
var clockEvt = ivy.subscribe(/^ClockEvent(.*)/, function(params){
	console.log(params);
	//envoi d'un message clock via websocket
     	ioListen.emit('clock', params);
	});
var barEvt= ivy.subscribe(/^BarEvent(.*)/, function(params){
	console.log(params);
	//envoi d'un message bars via websocket
    	ioListen.emit('bars', params);
	});
var trackEvt= ivy.subscribe(/^TrackMovedEvent(.*)/, function(params){
        console.log(params);
        //envoi d'un message track via websocket
        ioListen.emit('track', params);
        });

// Connexion - Deconnexion
ivy.on('peerConnected', function(peer){
	console.log("peer "+peer.name+" connected !");
	});

ivy.on('peerQuit', function(peer){
	console.log("peer "+peer.name+" disconnected !");
	});

// Connexion - Deconnection pour les websocket
ioListen.on('connection', function (socket) {
  	console.log('a user connected');
socket.on('disconnect', function(){
	console.log('user disconnected');
});
});

ioListen.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    ioListen.emit('answer',"Vous avez ecris "+ msg);
  child = exec(msg,
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
	ioListen.emit('answer',stdout);
    });
});
});
// Demarrage passerelle ivy
ivy.start();
// Message envoye a l'initiative du serveur web
function intervalFunc() {
        ivy.send("getCompteur");
        ivy.send("getBars");
	ivy.send("getTracks");
}

setInterval(intervalFunc, 2000);
