var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
	id: {type: Number, index: true},
	fname: {type: String, required: true},
	lname: {type: String, required: true},
	email: {type: String, required: true},
	pass: {type: String, required: true},
	bday: String,
	tweet_handle: String,
	contact: String,
	location: String,
	dp: {type: String, default:"blank_user.png"},
	createdAt: Date,
	updatedAt: Date,
	active: {type: Number, default: 1},
	likes: [Number],
	retweets: [Number],
},{collection: 'users'});

var Users = mongoose.model('Users', usersSchema);

module.exports = Users;