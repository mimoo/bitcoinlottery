var express = require('express');
var bitcoin = require('bitcoinjs-lib');
var request = require('request');

var app = express();

// Make assets folder accessible
app.use("/assets/", express.static(__dirname + '/assets'));

function createKeys() {
  var key = bitcoin.ECKey.makeRandom()
  return {"private_key" : key.toWIF() , "public_key" : key.pub.getAddress().toString()}
}

function canPlay() {
  return true;
}

function updatePlayer() {
}

app.get('/', function(req, res){
  if (canPlay() === true)
    res.sendFile(__dirname + "/index.html");
  else
    res.sendFile(__dirname + "/no.html");

});

app.get('/play', function(req, res){
  var keys = createKeys();
    console.log("public_key : " + keys.public_key);
    console.log("private_key : " + keys.private_key);

  request('https://blockchain.info/address/' + keys.public_key +'?format=json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      console.log(body.final_balance);
      res.json(
        {
          "balance": body.final_balance,
          "public_key" : keys.public_key,
          "private_key" : keys.private_key,
          "can_play_again" : canPlay()
        }
      );
    }
    else {
      res.json(
        {
          "error": ":("
        }
      );      
    }
  })

});


module.exports = app;
