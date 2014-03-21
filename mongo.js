var MongoClient = require('mongodb').MongoClient,
    MONGO_PASSWORD = process.env.MONGO_PASSWORD, 
    connection_string = 'mongodb://gomoku-admin:' + 'gomokuis429' + '@ds033047.mongolab.com:33047/gomoku-crowd-bots';

module.exports.init = function (callback) {
  MongoClient.connect(connection_string, function(err, db) {
  	//export the collections we are going to use
    module.exports.BotCollection = db.collection("Bot");
    module.exports.GameRecordCollection = db.collection("GameRecord");
    callback(err);
  });
};