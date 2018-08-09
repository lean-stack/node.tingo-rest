
var expect = require('chai').expect;
var superagent = require('superagent');
var fs = require('fs');

var express = require('express');
var tingoRest = require('../index');

describe('Data directory', function(){
  
  var server;
  var port = 3000;
  var dataDir = __dirname + '/tmp';
  
  var apiUrl = '/api';
  
  before(function(done) {
    
      if (fs.existsSync(dataDir)) {
        fs.rmdirSync(dataDir);
      }

        var app = express();
        app.use(apiUrl,tingoRest(dataDir));

        server = app.listen(port);
        done();
            
    
  });
  
  it('creates the data dir if not present',
    function(done){
      fs.exists(dataDir, (exists) => {
        expect(exists).to.be.true;
        done();
      });
    }
  );

  
  after(function(done){
    
    server.close();
    fs.rmdir(dataDir, function(){
      done();
    });
    
  });

});
