var mongoose = require('mongoose');

var hashtagSchema = mongoose.Schema({
	hashtag: String,
	tweet_id: Number,
	user_id: Number,
},{collection:'hashtag'});

var Hashtag = mongoose.model('Hashtag',hashtagSchema);

module.exports = Hashtag;