
var expect = require('chai').expect;
var superagent = require('superagent');
var fs = require('fs');

var express = require('express');
var tingoRest = require('../index');

describe('REST API - CRUD operations:', function(){
  
  var server, id;
  var port = 3000;
  var dataDir = __dirname + '/data';
  
  var resourceName = 'todos';
  var apiUrl = '/api';
  var requestUrl = 
      'http://localhost:' + port + apiUrl + '/' + resourceName;
  
  before(function(done) {
    
      fs.mkdir(dataDir, function(){
        var app = express();
        app.use(apiUrl,tingoRest(dataDir));

        server = app.listen(port);
        done();
      });      
    
  });
  
  it('GET /resource should return an empty array on a new resource',
    function(done){
      superagent.get(requestUrl)
        .end(function(e, res){
          expect(e).to.eql(null);
          expect(res.body).to.have.length(0);
          done();
      });
    }
  );
  
  it('POST should insert a new object', function(done){
    superagent.post(requestUrl)
      .send(
        { 
          txt: 'Unit Testing',
          completed: false
        }
      )
      .end(function(e,res){
        expect(e).to.eql(null);
        expect(res.body).not.to.be.an('array');
        expect(res.statusCode).to.be.equal(201);
        expect(res.header).to.haveOwnProperty('location');
        expect(res.body.id).to.be.above(0);
        expect(res.body.txt).to.equal('Unit Testing');
        id = res.body.id;
        done();
      });
  });
  
  it('GET /resource should return two objects after inserting a second object', function(done){
    superagent.post(requestUrl)
      .send(
        { 
          txt: 'E2E Testing',
          completed: false
        }
      )
      .end(function(){
        superagent.get(requestUrl)
          .end(function(e, res){
            expect(e).to.eql(null);
            expect(res.body).to.have.length(2);
            for (resource of res.body) {
              expect(resource).to.haveOwnProperty('id');
            }
            done();
        });
      });
  });
  
  it('GET /resource/{id} should return the first object',   function(done){
    superagent.get(requestUrl+'/'+id)
      .end(function(e, res){
          expect(e).to.eql(null);
          expect(res.body.id).to.equal(id);
          done();
      });
  });
  
  it('PUT should modify an object', function(done){
    superagent.put(requestUrl+'/'+id)
      .send(
        { 
          txt: 'Unit Testing',
          completed: true
        }
      )
      .end(function(e,res){
        expect(e).to.eql(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.haveOwnProperty('id');
        expect(res.body.id).to.equal(id);
        expect(res.body.completed).to.be.true;
        superagent.get(requestUrl+'/'+id)
          .end(function(e, res){
            expect(e).to.eql(null);
            expect(res.body.completed).to.be.true;
            done();
          });
      });
  });
  
  it('DELETE should remove an object and return the object', function(done){
    superagent.del(requestUrl+'/'+id)
      .end(function(e,res){
        expect(e).to.eql(null);
        expect(res.body.id).to.equal(id);
        expect(res.body.txt).to.equal('Unit Testing');
        superagent.get(requestUrl)
          .end(function(e, res){
            expect(e).to.eql(null);
            expect(res.body).to.have.length(1);
            done();
          });
      });
  });

  it('GET /resource/{id} should return 404 for wrong id',   function(done){
    superagent.get(requestUrl+'/'+id)
      .end(function(e, res){
          expect(e).to.be.a('Error');
          expect(res.statusCode).to.equal(404);
          done();
      });
  });
  
  after(function(done){
    
    server.close();
    fs.unlink(dataDir + '/' + resourceName, function(){
      done();
    });
    
  });
});
