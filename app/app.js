"use strict";
/////////////////////////////////////////
//             CONFIG
///////////////////////////////////////

var MAX_REPLAY = 3; // you can only play three times
var EXTERN_API = true; // we use the blockchain.info API (for now)
var TIME_PLAY = 60*60*1000; // we can play 3 times per hour
var API_KEY = process.env.blockchain_apikey; // blockchain.info api key

/////////////////////////////////////////
//             REQUIRES
///////////////////////////////////////

var express = require('express');
var request = require('request');

if(MAX_REPLAY > 0){
    var bitcoindb = require('bitcoinjs-lib');
    var mongoose = require('mongoose');
}

/////////////////////////////////////////
//             WEB
///////////////////////////////////////

var app = express();

/////////////////////////////////////////
//             MONGODB
///////////////////////////////////////

if(MAX_REPLAY > 0){
    mongoose.connect('mongodb://localhost:27017/bitcoinlottery');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function (callback) {
		console.log("Connection to mongo successful!");
    });
    // Visitor model that match the db
    // TODO : Put this in an other file
    var visitorSchema = mongoose.Schema({
		ip: { type: String, default: "unknown" },
		date: { type: Date, default: Date.now },
		counter: { type: Number, default: 0 }
    });
    // Mongoose automatically looks for the plural version of your model name
    // so it will look for visitors collection in the db
    var visitorModel = mongoose.model('Visitor', visitorSchema);
}

/////////////////////////////////////////
//             HELPERS
///////////////////////////////////////

// generate private/public keys
function createKeys() {
    var key = bitcoindb.ECKey.makeRandom()
    var private_key = key.toWIF();
    var public_key = key.pub.getAddress().toString()

    console.log("key generated:");
    console.log(private_key, public_key); // should remove the log of private key in the future

    return {
        "private_key" : private_key,
        "public_key" : public_key
    }
}

// test if the user can still play
// Be careful : this is an asynchronous function
// so use the callback when we use it :) http://stackoverflow.com/a/6898978
function can_play(ip, callback) {
    if(MAX_REPLAY > 0){
		visitorModel.findOne({ip: ip}, function(err, visitor){
		    if (err) console.log(err);

		    // visitor has never played before
		    if(visitor == null){
				callback(0);
				return;
		    }
		    
		    console.log(ip, "has played", visitor.counter, "times");
		    console.log("last time played:", visitor.date);

		    if (visitor.counter < MAX_REPLAY){
				callback(0); // can still play
		    }
		    else{
				// timer
				var time_diff = Date.now() - visitor.date;
				var time_left = TIME_PLAY - time_diff // one hour

				console.log("time left:", time_left);

				// timer done?
				if(time_left < 0){
				    visitorModel.findOneAndRemove({ip: ip}, function(){
				    	callback(0);
				    });
				}
				// nope
				else{
				    console.log("still has to wait", time_left);
				    callback(time_left);
				}
		    }
		});
    }
    else
	callback(0);
}

// get IP address of visitor
function getIP(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}


// Increment the number of times that IP played
// -> false if it's the last time IP can play
// -> true otherwise
function increment_ip(ip, callback) {

    console.log("incrementing counter for", ip);

    var update = {
		$inc: { counter: 1 }, // increment the counter
		date: Date.now() // update the date
    };

    var options = {
		new: true, // new: if true, return the modified document rather than the original. defaults to false (changed in 4.0)
		upsert: true //upsert: bool - creates the object if it doesn't exist. defaults to false.
    };

    visitorModel.findOneAndUpdate({ ip: ip }, update, options, function(err, visitor){
	if(err) console.log(err);

	console.log("incrementing the counter for", visitor.ip, "at date", visitor.date, "counter is now:", visitor.counter);

	if(visitor.counter >= 3)
	    callback(false); // can't play anymore after that
	else
	    callback(true);
    });

}

function api_call(public_key, callback){
    // Use blockchain.info?
    if(EXTERN_API){
		request('https://blockchain.info/address/' + public_key +'?format=json&api_code=' + API_KEY, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
			body = JSON.parse(body);
			callback(body);
		    }
		    else {
			callback({ "error": "can't query blockchain.info anymore" });
		    }
		});
    }
    else{

	// need to do the code with our API
	//
	// ...
	
    }
}
	
/////////////////////////////////////////
//             ROUTES
///////////////////////////////////////

// Make assets folder accessible
app.use("/assets/", express.static(__dirname + '/assets'));

// root
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

// get status
app.get('/can_play', function(req, res) {
    can_play(getIP(req), function (time_left) {

    	var can_play_again = true;

    	if(time_left > 0){
    		can_play_again = false;
    	}

		res.json({ 
			"can_play_again" : can_play_again,
			timer: time_left
		});
    });
});

// play
app.get('/play', function(req, res){

    var ip_address = getIP(req);

    can_play(ip_address, function(time_left) {
		if (time_left != 0) {
		    res.json({
			"can_play_again" : false,
			"timer" : time_left,
			"balance" : -1
		    });      
		}
		else {
		    // increment the number of games played
		    var can_play_again;

		    if(MAX_REPLAY > 0){
			    increment_ip(ip_address, function(result){
			    	can_play_again = result;
			    });
			}
			else{
				can_play_again = true;
			}

		    // generate keys
		    var key = createKeys();

		    // make api call
		    api_call(key.public_key, function(body){
			    if(body['error'] != null){
			    	alert(body['error']);
			    	return;
			    }
			    
				res.json({
				    "balance": body.final_balance,
				    "public_key" : key.public_key,
				    "private_key" : key.private_key,
				    "can_play_again" : can_play_again,
				    "timer" : TIME_PLAY
				});
		    });
		}

    });
});

//
module.exports = app;
