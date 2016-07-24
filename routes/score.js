var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').Server(app);
var db         = require('../modules/db');
var ObjectID   = require('mongodb').ObjectID;



router.get('/', function(req, res, next) {

  var collection = db.get().collection('user');
    collection.find({}).toArray(function(err, data) {
        res.render( 'score', {datas: data,
                             title : 'Score'});
    });

});

module.exports = router;
