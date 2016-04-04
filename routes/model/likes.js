var mongoose = require('mongoose');

var likeSchema = mongoose.Schema({
	user_id: Number,
	tweet_id: Number
});

var Like = mongoose.model('Like',likeSchema);

module.exports = Like;