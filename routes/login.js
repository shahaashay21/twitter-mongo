var bcrypt = require('bcrypt');
var errmsg = require('./errmsg');
//Collections
var Users = require('./model/users');
var Counter = require('./model/counter');

exports.loginUser = function(req, res){

	// console.log("Class Login and function loginUser");
	var email = req.param('email-login');
	var pass = req.param('pass-login');
	
	Users.findOne({email: email}, 'pass id', function(err, hash){
		if(hash){
			bcrypt.compare(pass, hash.pass, function(err,ans){
				console.log(ans);
				if(ans){
					req.session.uid = hash.id;
				 	res.end(JSON.stringify('pass')); 
				}else{
					errmsg.wrongAuthWithMessage(function(data){
						res.end(JSON.stringify(data));
					});
				}
			});
		}else{
			errmsg.wrongAuthWithMessage(function(data){
				res.end(JSON.stringify(data));
			});
		}

	});
};

exports.registerUser = function(req,res){

	console.log("Class Login and function registerUser");
	var email = req.param('email');
	var pass = req.param('pass');
	var fname = req.param('fname');
	var lname = req.param('lname');

	bcrypt.hash(pass, 5, function(err, hash) {
		Counter.findOneAndUpdate({table_name: 'users'},{$inc: {lastid: 1}},function(err,id){
			Users.findOne({email: email},'email', function(err,useremail){
				console.log(useremail);
				if(useremail){
					res.end(JSON.stringify('available'));
				}else{
					var user = new Users();
					user.id = id.lastid;
					user.fname = fname;
					user.lname = lname;
					user.email = email;
					user.pass = hash;
					user.likes = [];
					user.retweets = [];
					user.createdAt = Date();
					user.save(function (err){
						if(!err){
							res.end(JSON.stringify('Registered'));
						}
					});
				}
			});
		});
	});
};
exports.logOut = function(req,res){
	req.session.destroy(function(err) {
		res.json("done");
	});
};