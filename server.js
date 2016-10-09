var fs             =        require('fs');
var express        =        require("express");
var bodyParser     =        require("body-parser");
var hembrev = require('./scrapers/hembrev');
var mailsender = require('./mailsender');
var subscription = require('./subscription');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/scrape', function (req, res) {

    hembrev.scrape(function (err, data) {
        mailsender.send(data, function (err, data) {
            res.send(data);
        });
    });
})

app.get('/subscribers', function (req, res) {
    subscription.get(function (err, data) {
        res.send(data);
    });
})

app.delete('/subscribers/:id', function (req, res) {
    var id = req.params['id'];
    subscription.del(id, function (err, data) {
        res.send(data);
    });
})

app.post('/subscribers', function (req, res) {
    var body = req.body;
    subscription.add(body, function (err, data) {
        res.send(data);
    });
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;