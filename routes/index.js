
/*
 * GET home page.
 */
var bcrypt = require('bcrypt');
var user = require('./user');
exports.index = function(req, res){
	// bcrypt.hash('aashay',5, function(err,hash){
		// bcrypt.compare('aashay', hash, function(err,ans){
		// 	res.render('index', { title: 'Express', hash: hash, ans: ans });
		// })
	// });
	console.log(req.session.uid);
	if(req.session.uid){
		user.userInfo(req.session.uid, function(userinfo){
			res.render('home', userinfo);
		});
		
	}else{
		res.render('index', { userid: '' });
	}
};