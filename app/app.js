var express = require('express');
var bitcoin = require('bitcoinjs-lib');
var request = require('request');
var mongoose = require('mongoose');

var app = express();

mongoose.connect('mongodb://localhost:27017/bitcoinlottery');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Connection to mongo successful!");
});


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

// Improvement : make this method with callback to make sure it save in mongo 
// But now it's called before an API request, so we're almost sure it's saved before
function saveVisit(req) {
  var visitorSchema = mongoose.Schema({
      ip: { type: String, default: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress },
      date: { type: Date, default: Date.now },
  });

  var Visitor = mongoose.model('Visitor', visitorSchema);
  var newVisitor = new Visitor();

  newVisitor.save(function (err, visitor) {
    if (err) return console.error(err);
  });
}

app.get('/', function(req, res) {

  if (canPlay() === true)
    res.sendFile(__dirname + "/index.html");
  else
    res.sendFile(__dirname + "/no.html");

});

app.get('/play', function(req, res){

  saveVisit(req); 
  var keys = createKeys();
  console.log(keys);

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
