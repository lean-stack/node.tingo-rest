
var express = require('express');
var bodyParser = require('body-parser');
var tingoEngine = require('tingodb')();

module.exports = function (dataDir) {

  if( typeof dataDir === 'undefined' ) {
    throw new Error('Missing data directory');
  }
  
  var app = express();
  app.use(bodyParser.json());
  
  var db = new tingoEngine.Db(dataDir, {});
  
  app.param('resourceName',function(req,res,next,resourceName) {
  
    req.collection = db.collection(resourceName);
    return next();
  });
  
  // get all
  app.get('/:resourceName', function(req,res,next) {
    
    req.collection.find({})    
      .toArray(function(err, results){
        
        if (err) { return next(err); }
      
        for(resource of results) { mapInternalId(resource); }
        res.send(results);
      });
  });
  
  // get by id
  app.get('/:resourceName/:id', function(req,res,next) {
    
    req.collection.findOne({_id: req.params.id},
      function(err, result){
        if (err) { return next(err); }
        if( result ) {
          mapInternalId(result);
          res.send(result);
        } else {
          res.sendStatus(404);
        }
      });
  });
  
  // insert one
  app.post('/:resourceName', function(req, res, next) {
    
    req.collection.insert(req.body, {}, function(err, result){
      if (err) { return next(err); }
      res.statusCode = 201;
      res.setHeader('Location', req.protocol + '://' + req.hostname 
        + req.baseUrl + '/' + req.path + '/' + result[0]._id);
      
      // Map result to created resource
      const resource = result[0];
      mapInternalId(resource);

      res.send(resource);
    });
  });

  // update one
  app.put('/:resourceName/:id', function(req, res, next) {
    
    req.collection.update(
      {_id: req.params.id}, req.body,
      function(err, count){
        if (err) { return next(err); }
        req.collection.findOne({_id: req.params.id}, function(err, result) {
          mapInternalId(result);
          res.send(result);
        });
      }); 
    });
  
  // delete one
  app.delete('/:resourceName/:id', function(req, res, next) {
    
    req.collection.remove(
      {_id: req.params.id},
      function(err, count){
        if (err) { return next(err); }
        res.send((count===1)?{msg:'success'}:{msg:'error'});
      }); 
    });
  
    function mapInternalId( resource ) {
      resource.id = resource._id.id; 
      delete resource._id;
    }

  return app;
};
