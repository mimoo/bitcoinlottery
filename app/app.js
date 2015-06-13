var express = require('express');

var app = express();


app.get('/', function(req, res){
  console.log("yo")
  res.sendFile(__dirname + "/index.html"); 

//  res.render('index.html');
});


module.exports = app;
