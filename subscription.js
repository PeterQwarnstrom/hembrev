var fs = require('fs');

var subscription = {

    get: function (mainCallback) {
        var subscribers = JSON.parse(fs.readFileSync('./resources/hembrev/subscribers.js', 'utf8'));
        mainCallback(null, subscribers);
    },

    del: function (id, mainCallback) {
        var subscribers = JSON.parse(fs.readFileSync('./resources/hembrev/subscribers.js', 'utf8'));
        var newSubscribers = [];

        for (var i = 0; i < subscribers.length; i++) {
            if (subscribers[i].id != id) {
                newSubscribers.push(subscribers[i]);
            }
        }

        fs.writeFile('./resources/hembrev/subscribers.js', JSON.stringify(newSubscribers, null, 4), (err) => {
            if (err) 
                mainCallback(err);

            mainCallback(null, newSubscribers)
        });
    },

    add: function (subscriber, mainCallback) {
        var subscribers = JSON.parse(fs.readFileSync('./resources/hembrev/subscribers.js', 'utf8'));
        subscribers.push(subscriber);
        fs.writeFile('./resources/hembrev/subscribers.js', JSON.stringify(subscribers, null, 4), (err) => {
            if (err) 
                callback(err);

            mainCallback(null, subscribers)
        });
    }


}
exports.get = subscription.get;
exports.del = subscription.del;
exports.add = subscription.add;