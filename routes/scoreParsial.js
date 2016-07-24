var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').Server(app);
var db         = require('../modules/db');
var ObjectID   = require('mongodb').ObjectID;



router.get('/', function(req, res, next) {

  var collection = db.get().collection('user');
    collection.find({}).toArray(function(err, data) {
        var last = data.length - 1;
        var last1 = data.length - 2;

        var donnees = [];
        donnees[0]=data[last];
        donnees[1]=data[last1];
        console.log(donnees);
        res.render( 'scoreParsial', {datas: donnees,
                             title : 'Score Parsial'});
    });

});

module.exports = router;
