
/*
 * GET users listing.
 */
var errmsg = require('./errmsg');

//Collections
var Users = require('./model/users');
var Tweets = require('./model/tweets');
var Follow = require('./model/follow');

//WARNING---- BY DEFAULT CODE---- DO NOT DELETE IT
exports.list = function(req, res){
  res.send("respond with a resource");
};

//User information
function userInfo(req, res){
	console.log("Class user and function userInfo");

	Users.findOne({id:req}).then(function(ans){
		Follow.count({following_id: req}).then(function(followers_id){
			Follow.count({followers_id: req}).then(function(following_id){
				Tweets.count({user_id: req}).then(function(tweets){
					// ans.likes = ans.likes.length;
					ans.tweet = tweets;
					ans.followers = followers_id;
					ans.following = following_id;
					ans.userid = req;
					// console.log(ans);
					res(ans);
				});
			});
		});
	});
}

exports.profile = function(req, res){
	if(req.session.uid){
		userInfo(req.session.uid, function(userinfo){
			// console.log(req.params.id);
			newuser = {uid: req.params.id};
			userinfo['useridpage'] = req.params.id;
			// console.log(userinfo);
			userInfo(newuser.uid, function(newuserinfo){
				// console.log("before");
				Follow.count({'following_id': req.params.id, 'followers_id': req.session.uid}, function(err, followchk){
					// console.log("After");
					// console.log(followchk);
					userinfo['followchk'] = followchk;
					userinfo['us'] = newuserinfo;
					// console.log(userinfo['us']);
					res.render('user', userinfo);
				});
			});
		});
	}else{
		res.render('index', { title: 'Express' });
	}
};

exports.follow = function(req,res){
	var id = req.param('id');
	var followChk = req.param('followChk');
	if(followChk == 1){
		//Destroy
		Follow.remove({'following_id': id, 'followers_id': req.session.uid}, function(err){
			followChk = 0;
			res.json(followChk);
		});
	}else{
		//Create
		var fol = new Follow();
		fol.following_id = id;
		fol.followers_id = req.session.uid;
		fol.save(function(err){
			if(!err){
				followChk = 1;
				res.json(followChk);
			}
		});
	}
};

exports.userDetails = function(req,res){
	Users.findOne({'id': req.session.uid}, 'id fname lname email bday tweet_handle contact location').then(function(userinfo){
		res.send(userinfo);
	});
};

exports.addinfo = function(req,res){
	user = req.param('user');
	// console.log(user);
	if(user.id != req.session.uid){
		data = {'alert': 1};
		res.send(data);
	}
//	console.log(user);
	message = {};
	msgchk = 0;
	if(user.fname == "" || user.fname == null){
		message['us-fname'] = "First name field is required";
		msgchk = 1;
	}
	if(user.lname == "" || user.lname == null){
		message['us-lname'] = "Last name field is required";
		msgchk = 1;
	}
	if(user.contact && isNaN(user.contact)){
		message['us-contact'] = "Wrong contact information";
		msgchk = 1;
	}
	if(user.bday && user.bday != "" && user.bday != null){
		// regular expression to match required date format
	    re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

	    if(user.bday != '') {
	      if(regs = user.bday.match(re)) {
	        if(regs[1] < 1 || regs[1] > 12 || regs[2] < 1 || regs[2] > 31 || regs[3] < 1902 || regs[3] > (new Date()).getFullYear()) {
	        	message['us-dob'] = "Invalid format";
	        	msgchk = 1;
	        }
	      } else {
	        message['us-dob'] = "Invalid format";
	        msgchk = 1;
	      }
	    }
		// user.bday = new Date(user.bday);
	}
	if(user.tweet_handle != "" && user.tweet_handle != null){
		Users.count({'tweet_handle': user.tweet_handle, id:{$ne: user.id}}, function(err, handlecount){
//			console.log(handlecount);
			if(handlecount > 0){
//				console.log('in here');
				message['us-handle'] = "Tweet Handle has already been taken";
				msgchk = 1;
			}
			if(msgchk == 1){
				data = {'message': message, 'msg': 1};
				res.send(data);
			}else{
				// console.log(user);
				Users.update({'id': user.id}, {$set: user}, function(err, update){
					if(!err){
						dataa = {'msg': 0};
						res.send(dataa);
					}
				});
			}
		});
	}else{
		if(msgchk == 1){
			data = {'message': message, 'msg': 1};
			res.send(data);
		}else{
//			console.log(user.bday);
			// if(user.bday != "" || user.bday != null){
			// 	user.bday = new Date(user.bday);
			// }
			// console.log(user);
			Users.update({'id': user.id}, {$set: user}, function(err, update){
				if(!err){
					dataa = {'msg': 0};
					res.send(dataa);
				}
			});
		}
	}
	
}

exports.updateprof = function(req,res){
	// console.log(req.files.profPhoto.File);
	console.log(req.param('url'));
	if(!(isEmpty(req.files))){
		if(!(isEmpty(req.files.myFile.path))){
			var file = req.files.myFile.path;
			filename = file.substr((file.indexOf('\\img\\')+5));
			Users.update({id: req.session.uid}, {dp:filename}, function(err, update){
				if(!err){
					res.json('Ok');
				}
			});
		}
	}
}

//CHECK OBJECT IS EMPTY OR NOT
function isEmpty(object) {
  for(var key in object) {
    if(object.hasOwnProperty(key)){
      return false;
    }
  }
  return true;
}

exports.userInfo = userInfo;