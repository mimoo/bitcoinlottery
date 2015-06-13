var express = require('express');
var bitcoin = require('bitcoinjs-lib');
var app = express();


app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html"); 
});


app.get('/play', function(req, res){
  console.log("Paying....");
});


module.exports = app;
