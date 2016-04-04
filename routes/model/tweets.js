var mongoose = require('mongoose');

var tweetSchema = mongoose.Schema({
	id: {type: Number, required: true, index: true},
	tweet: {type: String},
	user_id: {type: Number, required: true},
	img_url: String,
	createdAt: { type:Date, required: true },
	updatedAt: Date,
	parent_id: Number,
	likes: Number,
	retweets: Number,
}, {collection: 'tweets'});

var Tweets = mongoose.model('Tweets',tweetSchema);

module.exports = Tweets;