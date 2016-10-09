var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var url = 'https://drive.google.com/embeddedfolderview?hl=sv&id=0B-YMLl6RLeCabENpdmd5V2IwYVk#list';

var scraper = {

    scrape: function (resultCallback) {
        var letters = JSON.parse(fs.readFileSync('./resources/hembrev/letters.js', 'utf8'));
        var subscribers = JSON.parse(fs.readFileSync('./resources/hembrev/subscribers.js', 'utf8'));

        async.waterfall([
            // get html from page    
            function (callback) {
                request(url, function (error, response, html) {
                    if (error) callback(new Error(error));

                    callback(null, html);
                })
            },

            // create result
            function (html, callback) {
                var $ = cheerio.load(html);

                var result = { subscribers: subscribers, letters: [] };

                $('.flip-entry').each(function (i, elem) {
                    var data = $(this);

                    var title = data.children('.flip-entry-info').find('a').first().children('.flip-entry-title').text();
                    var link = data.children('.flip-entry-info').find('a').attr('href');

                    var sent = false;
                    for(var j = 0; j < letters.length; j++) {                        
                        if(letters[j].title == title) {
                            sent = true;
                        }
                    }
                    result.letters[result.letters.length] = { title: title, link: link, sent: sent };
                })
                callback(null, result);
            },

            // return result
            function (result) {
                resultCallback(null, result);
            }
        ]);
    }
};

exports.scrape = scraper.scrape;