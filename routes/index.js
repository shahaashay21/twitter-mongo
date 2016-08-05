
/*
 * GET home page.
 */
var bcrypt = require('bcrypt');
var user = require('./user');
var Counter = require('./model/counter');
var fs = require("fs");
var path = require('path');
exports.index = function(req, res){
	// bcrypt.hash('aashay',5, function(err,hash){
		// bcrypt.compare('aashay', hash, function(err,ans){
		// 	res.render('index', { title: 'Express', hash: hash, ans: ans });
		// })
	// });
	console.log(req.session.uid);
	Counter.find(function(err,data){
		// console.log(data.length);
		if(data.length <= 0){
			counterData = [{"lastid":1,"table_name":"users"},{"lastid":1,"table_name":"hashtag"},{"lastid":1,"table_name":"tweets"}];
			Counter.insertMany(counterData,function(err, suc){
				res.render('index', { userid: '' });
			})
		}else{
			if(req.session.uid){
				user.userInfo(req.session.uid, function(userinfo){
					res.render('home', userinfo);
				});
				
			}else{
				res.render('index', { userid: '' });
			}
		}
	})
	
};