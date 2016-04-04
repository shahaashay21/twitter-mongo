var mongoose = require('mongoose');

var followschema = mongoose.Schema({
	following_id: {type: Number, index: true},
	followers_id: {type: Number, index: true}
},{collection:'follow'});

var Follow = mongoose.model('Follow',followschema);

module.exports = Follow;