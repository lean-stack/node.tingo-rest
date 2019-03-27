const expect = require('chai').expect;
const superagent = require('superagent');
const fs = require('fs');

const express = require('express');
const tingoRest = require('../index');

describe('REST API - Filter operation:', function() {
  // Express Server started for each test
  let server;

  const dataDir = __dirname + '/data';
  const resourceUrl = 'http://localhost:3131/api/users';

  before(done => {
    const app = express();
    app.use('/api', tingoRest(dataDir));
    server = app.listen(3131, done);
  });

  it('GET /resource filtering should return an empty array on a new resource', function(done) {
    superagent.get(resourceUrl + '?filter[acc]=micha').end(function(e, res) {
      expect(e).to.eql(null);
      expect(res.body).to.have.length(0);
      done();
    });
  });

  describe('Filtering on existing resources', () => {
    const users = [
      { acc: 'micha', email: 'mail@micha.de', city: 'Cottbus' },
      { acc: 'tom', email: 'tom@micha.de', city: 'Cottbus' },
      { acc: 'stephan', email: 'stephan@micha.de', city: 'Trier ' },
      { acc: 'dirki', email: 'mail@dirki.de', city: 'Berlin ' },
      { acc: 'martin', email: 'martin@micha.de', city: 'München ' }
    ];

    before(done => {
      Promise.all(users.map(u => superagent.post(resourceUrl).send(u))).then(
        () => {
          done();
        }
      );
    });

    it('GET /resource filtering on unique prop should return one result', function(done) {
      superagent.get(resourceUrl + '?filter[acc]=micha').end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.body).to.have.length(1);
        done();
      });
    });

    it('GET /resource filtering on not existing prop value should return zero result', function(done) {
      superagent.get(resourceUrl + '?filter[acc]=pm').end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.body).to.have.length(0);
        done();
      });
    });

    it('GET /resource filtering on not existing prop should return zero result', function(done) {
      superagent.get(resourceUrl + '?filter[password]=s3cret').end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.body).to.have.length(0);
        done();
      });
    });

    it('GET /resource filtering on prop should return correct result', function(done) {
      superagent.get(resourceUrl + '?filter[city]=Cottbus').end(function(e, res) {
        expect(e).to.eql(null);
        expect(res.body).to.have.length(2);
        done();
      });
    });
  });

  after(done => {
    server.close();
    fs.unlink(dataDir + '/users', () => { done(); });
  });
});
