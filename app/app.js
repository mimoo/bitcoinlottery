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

var MAX_REPLAY = 3;

// TODO : Put this in an other file
// Visitor model that match the db
var visitorSchema = mongoose.Schema({
    ip: { type: String, default: "unknown" },
    date: { type: Date, default: Date.now },
});
var visitorModel = mongoose.model('Visitor', visitorSchema);

// Make assets folder accessible
app.use("/assets/", express.static(__dirname + '/assets'));

function createKeys() {
  var key = bitcoin.ECKey.makeRandom()
  return {
            "private_key" : key.toWIF(),
            "public_key" : key.pub.getAddress().toString()
          }
}

// Be careful : this is an asynchronous function
// so use the callback when we use it :) http://stackoverflow.com/a/6898978
var canPlay = function(ip, callback) {

  var today = new Date();
  var hourago = new Date(today.getTime() - (1000*60*60));

  visitorModel.count({ip: ip, date:{$gte: hourago}}, function(err, count)
  {
    if (err) console.log(err);

    console.log("count is " + count);
    if (count < MAX_REPLAY)
      callback(true); // can still play
    else
      callback(false);
  });
};

function getIP(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// TODO : make this method with callback to make sure it save in mongo 
// But now it's called before an API request, so we're almost sure it's saved before
function saveVisit(ip) {

  var visitor = new visitorModel( {ip : ip});
  visitor.save(function (err, visitor) {
    if (err) return console.error(err);
  });
}

app.get('/', function(req, res) {

  canPlay(getIP(req), function (possible) {

    if (possible === true)
      res.sendFile(__dirname + "/index.html");
    else
      res.sendFile(__dirname + "/no.html");

  });


});

app.get('/play', function(req, res){

  var ip_address = getIP(req);


  saveVisit(ip_address);
  var keys = createKeys();
  console.log(keys);

  canPlay(ip_address, function(possible) {

    if (possible === false) {
      res.json(
        {
          "can_play_again" : false,
          "error": "you forget to manage this case dude!"
        }
      );      
    }
    else {
      request('https://blockchain.info/address/' + keys.public_key +'?format=json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body);

          canPlay(ip_address, function(possible) {
            res.json({
              "balance": body.final_balance,
              "public_key" : keys.public_key,
              "private_key" : keys.private_key,
              "can_play_again" : possible
            });
          });
        }
        else {
          res.json(
            {
              "error": ":("
            }
          );      
        }
      });



    }


  });

});


module.exports = app;
