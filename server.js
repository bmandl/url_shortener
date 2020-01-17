'use strict';

var express = require('express');
var mongoClient = require('mongodb');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
var dns = require("dns");
var bodyParser = require('body-parser');
const ShortUrl = require('nanoid/generate');

dotenv.config();

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGOLAB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var db = mongoose.connection;

db.on("error", console.error.bind(console, 'connection error:'));

var urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: {
    type: Number,
    index: true
  }
});

var Url = mongoose.model('url', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/shorturl/new", (req, res) => {

  var newUrl = new Url(({ original_url: req.body.url , short_url: ShortUrl('1234567890',3)}));

  Url.find({ original_url: newUrl.original_url }, (err, data) => {
    if (err) return console.err(err);
    if (!data.length) {
      newUrl.save((err1, entry) => {
        if (err1) return console.err(err1);
      });
      res.json(newUrl);
      console.log("Url added");      
    }
    else {
      console.log("Url already exists");
      res.json(data);
    }
  });
});


/*Url.find((err, data) => {
  if (err) return console.err(err);
  console.log(data);
});*/

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.listen(port, function () {
  console.log(`Node.js listening on port ${port}...`);
});