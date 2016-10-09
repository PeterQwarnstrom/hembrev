var fs = require('fs');
var nodemailer = require('nodemailer');
var async = require('async');

var user = process.env.MAIL_USERNAME;
var pass = process.env.MAIL_PASSWORD;
var mailFrom = process.env.MAIL_FROM;

if (!user) throw "no user name defined for mail account!";
if (!pass) throw "no password defined for mail account!";
if (!mailFrom) throw "no from address defined for sending mail!";

var data;

var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: user,
        pass: pass
    }
};

var smtpTransport = nodemailer.createTransport(smtpConfig);

var mailsender = {

    send: function (data, mainCallback) {
        this.data = data;

        var bodyHtml = fs.readFileSync('./resources/hembrev/body.html', 'utf8');
        var bodyText = fs.readFileSync('./resources/hembrev/body.txt', 'utf8');

        async.waterfall([

            function (callback) {
                var doSend = false;

                var lettersHtml = '<ul>';
                var lettersText = '';

                for (var i = 0; i < data.letters.length; i++) {
                    var letter = data.letters[i];

                    if (letter.sent == false) {
                        doSend = true;
                        lettersHtml += "<li><a href='" + letter.link + "'>" + letter.title + "</a></li>";
                        lettersText += "* " + letter.title + "  (" + letter.link + ")";
                    }
                }
                lettersHtml += "</ul>";

                bodyHtml = bodyHtml.replace('##letters##', lettersHtml);
                bodyText = bodyText.replace('##letters##', lettersText);

                callback(null, data, doSend, bodyHtml, bodyText);
            },

            function (data, doSend, bodyHtml, bodyText, callback) {
                if (doSend) {
                    for (var i = 0; i < data.subscribers.length; i++) {
                        var subscriber = data.subscribers[i];

                        bodyHtml = bodyHtml.replace("##name##", subscriber.name);
                        bodyText = bodyText.replace("##name##", subscriber.name);

                        var mailOptions = {
                            from: mailFrom,
                            to: subscriber.email,
                            subject: 'Ny information från Jollen',
                            text: bodyText,
                            html: bodyHtml
                        };

                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                            }
                        });
                    }
                }

                callback(null, data, doSend)
            },

            function (data, doSend, callback) {
                for (var i = 0; i < data.letters.length; i++) {
                    delete data.letters[i].sent;
                }

                fs.writeFile('./resources/hembrev/letters.js', JSON.stringify(data.letters, null, 4), (err) => {
                    if (err) callback(err);

                    mainCallback(null, { mailSend: doSend })
                });
            }
        ]);
    }
}
exports.send = mailsender.send;