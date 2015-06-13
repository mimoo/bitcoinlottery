var express = require('express');
var bitcoin = require('bitcoinjs-lib');
var app = express();


function createKeys() {
  var key = bitcoin.ECKey.makeRandom()
  return {"private_key" : key.toWIF() , "public_key" : key.pub.getAddress().toString()}
}

app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html"); 
});


app.get('/play', function(req, res){
  console.log("Playing....");
  console.log(createKeys());
});


module.exports = app;
