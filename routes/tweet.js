var errmsg = require('./errmsg');
var fs = require("fs");

var Counter = require('./model/counter');
var Tweets = require('./model/tweets');
var Follow = require('./model/follow');
var Users = require('./model/users');
var HashTag = require('./model/hashtag');

var path = require('path');

//INSERT TWEET INTO DB
exports.ins = function(req, res){
	console.log("Class tweet and function ins");
	// console.log(req.param);

	var handle =[];
	var hash = [];
	var tweet = "";
	if(req.param('tweet') && req.param('tweet') != "undefined"){
		tweet = req.param('tweet');
	}



	//express-fileupload
	console.log(req.files);
	var filename = "";
	if(!(isEmpty(req.files))){
		let myFile = req.files.myFile;
		var filePath = path.join(__dirname, '../public/img/');
		filename = req.files.myFile.name;
		myFile.mv(filePath + req.files.myFile.name, function(err){
			if (err)
		      return res.status(500).send(err);
		    
		});
	}

	// var filename = "";
	// if(!(isEmpty(req.files))){
	// 	if(!(isEmpty(req.files.myFile.path))){
	// 		var file = req.files.myFile.path;
	// 		console.log(file);
	// 		// filename = file.substr((file.indexOf('\\img\\')+5));
	// 		filename = file.substr((file.lastIndexOf("\/img\/")+5));
	// 		console.log(filename);
	// 	}
	// }




	var handleWithSpace = tweet.match(/(^@\w+| @\w+| @\w+)/g);
	if(handleWithSpace){
		for(var i=0; i<handleWithSpace.length; i++){
			tagWithhandle = handleWithSpace[i].trim();
			handle[i] = tagWithhandle.slice(1);
		}
	}
	
//	console.log(handle);
	var hashWithSpace = tweet.match(/(^#\w+| #\w+| #\w+)/g);
	if(hashWithSpace){
		for(var i=0; i<hashWithSpace.length; i++){
			tagWithHash = hashWithSpace[i].trim();
			hash[i] = tagWithHash.slice(1);
		}
	}
	hash = hash.getUnique(true);
//	console.log(hash);
	
	var hashdata = [];
	var ret = 0;
	if(!filename){
		if(tweet.length > 0 && tweet.length <= 140){
		}else{
			ret = 1;
		}
	}
	if(ret == 0){
		//GET NEXT ID
		Counter.findOneAndUpdate({table_name: 'tweets'},{$inc: {lastid: 1}},function(err,id){
			//FIND OR CREATE NEW TWEET INTO DB
			// console.log(id);
			var tweetTable = new Tweets();
			tweetTable.id = id.lastid;
			tweetTable.tweet = tweet;
			tweetTable.user_id = req.session.uid;
			tweetTable.img_url = filename;
			tweetTable.likes = 0;
			tweetTable.retweets = 0;
			tweetTable.createdAt = new Date();
			// console.log('tweetTable: '+tweetTable);
			tweetTable.save(function (err){
				// console.log(err);
				if(!err){
					function hashSave(i, hashCallback){
						if(i< hash.length){
							var hashtag = new HashTag();
							hashtag.hashtag = hash[i].toLowerCase();
							hashtag.tweet_id = id.lastid;
							hashtag.user_id = req.session.uid;
							hashtag.save(function(err){
								if(!err){
									hashSave(i+1, hashCallback);
								}
							});
						}else{
							hashCallback();
						}
					}
					hashSave(0, function(){
						res.end(JSON.stringify('Posted'));	
					});	
				}
			});
		});
	}else{
		res.json('fail');
	}
};

//SHOW RECENT TWEETS
exports.recentTweet = function(req,res){
	console.log("Class tweet and function recentTweet");
	var min = req.param('min');
	var bunch = req.param('bunch');
	Follow.find({'followers_id': req.session.uid}, 'following_id', function(err,following){
		followingIds = [];
		for(var i=0; i<following.length; i++){
			followingIds[i] = following[i].following_id; 
		}
		followingIds[i] = req.session.uid;
		// console.log(followingIds);
		Tweets.find({'user_id':{$in: followingIds}}).limit(10).sort({'createdAt': -1 }).exec(function(err,allTweets){// console.log(allTweets);
			// console.log(allTweets);
			// allTweets = JSON.parse(allTweets);
			newData = [];
			function tweetDetails( i, callback ) {
			    if( i < allTweets.length ) {
			        // console.log(i);
			        newData[i] = {};	
			        Users.findOne({id: allTweets[i].user_id}, function(err, userinfo){
			        	if(allTweets[i].parent_id){
			        		Tweets.findOne({id: allTweets[i].parent_id}, function(err, parentTweet){
			        			Users.findOne({id: parentTweet.user_id}, function(err, parentUserinfo){
			        				Users.count({id: req.session.uid, likes: {$elemMatch: {$in: [parentTweet.id]}}}, function(err, likes){
			        					Users.count({id: req.session.uid, retweets: {$elemMatch: {$in: [parentTweet.id]}}}, function(err, retweets){
				        					newData[i].retweet = retweets;
				        					newData[i].like = likes;
						        			newData[i].parentTweet = parentTweet;
						        			newData[i].parentUser = parentUserinfo;
						        			newData[i].tweet = allTweets[i];
					        				newData[i].user = userinfo;
					        				tweetDetails( i+1, callback );
					        			});
			        				});
				        		});
			        		});	
			        	}else{
			        		Users.count({id: req.session.uid, likes: {$elemMatch: {$in: [allTweets[i].id]}}}, function(err, likes){
			        			Users.count({id: req.session.uid, retweets: {$elemMatch: {$in: [allTweets[i].id]}}}, function(err, retweets){
				        			newData[i].retweet = retweets;
				        			newData[i].like = likes;
				        			newData[i].tweet = allTweets[i];
				        			newData[i].user = userinfo;
				        			tweetDetails( i+1, callback );
				        		});
			        		});
			        	}
			        });
			    } else {
			        callback();
			    }
			}
			tweetDetails( 0, function() {
			    res.send(newData);
			});
		});
	});
};

//ALL TWEETS OF USER BY USERID
exports.tweetbyuserid = function(req,res){
	var userid = req.param('q');
	
	Tweets.find({'user_id':{$in: userid}}).limit(10).sort({'createdAt': -1 }).exec(function(err,allTweets){// console.log(allTweets);
		// console.log(allTweets);
		// allTweets = JSON.parse(allTweets);
		newData = [];
		function tweetDetails( i, callback ) {
		    if( i < allTweets.length ) {
		        // console.log(i);
		        newData[i] = {};	
		        Users.findOne({id: allTweets[i].user_id}, function(err, userinfo){
		        	if(allTweets[i].parent_id){
		        		Tweets.findOne({id: allTweets[i].parent_id}, function(err, parentTweet){
		        			Users.findOne({id: parentTweet.user_id}, function(err, parentUserinfo){
		        				Users.count({id: req.session.uid, likes: {$elemMatch: {$in: [parentTweet.id]}}}, function(err, likes){
		        					Users.count({id: req.session.uid, retweets: {$elemMatch: {$in: [parentTweet.id]}}}, function(err, retweets){
			        					newData[i].retweet = retweets;
			        					newData[i].like = likes;
					        			newData[i].parentTweet = parentTweet;
					        			newData[i].parentUser = parentUserinfo;
					        			newData[i].tweet = allTweets[i];
				        				newData[i].user = userinfo;
				        				tweetDetails( i+1, callback );
				        			});
		        				});
			        		});
		        		});	
		        	}else{
		        		Users.count({id: req.session.uid, likes: {$elemMatch: {$in: [allTweets[i].id]}}}, function(err, likes){
		        			Users.count({id: req.session.uid, retweets: {$elemMatch: {$in: [allTweets[i].id]}}}, function(err, retweets){
			        			newData[i].retweet = retweets;
			        			newData[i].like = likes;
			        			newData[i].tweet = allTweets[i];
			        			newData[i].user = userinfo;
			        			tweetDetails( i+1, callback );
			        		});
		        		});
		        	}
		        });
		    } else {
		        callback();
		    }
		}
		tweetDetails( 0, function() {
		    res.send(newData);
		});
	});
}

//DELETE TWEET FROM DB
exports.deleteTweet = function(req,res){
	console.log("Class tweet and function deleteTweet");
	var tweetid = req.param('id');
	Tweets.findOne({id: tweetid}, 'img_url', function(err, img){
		if(!(isEmpty(img.img_url))){
			var dir = path.join(__dirname, '../public/img/');
			fs.unlink(dir+img.img_url, function(err) {
			   if (err) {
			       console.error(err);
			   }
			   // console.log("File deleted successfully!");
			   Tweets.remove({$or: [{parent_id: tweetid},{id: tweetid}]}, function(err){
					HashTag.remove({tweet_id: tweetid}, function(err){
						Users.update({}, {$pull: {likes: tweetid, retweets: tweetid}}, {multi: true}, function(err, update){
							res.json('Suc');
						});
					});
				});
			});
		}else{
			Tweets.remove({$or: [{parent_id: tweetid},{id: tweetid}]}, function(err){
				HashTag.remove({tweet_id: tweetid}, function(err){
					Users.update({}, {$pull: {likes: tweetid, retweets: tweetid}}, {multi: true}, function(err, update){
						res.json('Suc');
					});
				});
			});
		}
	});
};

exports.like = function(req,res){
	console.log("Class tweet and function like");
	id = req.param('id');
	Users.count({id: req.session.uid ,likes: {$elemMatch: {$in: [id]}}}, function(err, chk){
		if(chk > 0){
			Users.update({id: req.session.uid}, {$pull: {likes: id}}, function(err, upUser){
				Tweets.update({id: id}, {$inc: {likes: -1}}, function(err, up){
					res.json(false);
				});
			});
		}else{
			Users.update({id: req.session.uid}, {$push: {likes: id}}, function(err, upUser){
				Tweets.update({id: id}, {$inc: {likes: 1}}, function(err, up){
					res.json(true);
				});
			});
		}
	})
}


//GIVE SUGGESTION ON BASED ON NAME, TWEET_HANDLE AND HASHTAG
exports.suggest = function(req,res){
	console.log("Class tweet and function suggest");
	var q = req.param('q');
	if(q.charAt(0) == '#'){
		q = q.substring(1);
		// console.log(q);
		// HashTag.find('hashtag', {hashtag: new RegExp('^'+q,'i')}).limit(5).exec(function(err, hashtag){
		HashTag.aggregate([{$match: {hashtag: new RegExp('^'+q,'i')}}, {$group: {_id:'$hashtag', hashtag: {$first:'$hashtag'}}}, {$limit: 5}]).exec(function(err, hashtag){
			// console.log(hashtag);
			res.json(hashtag);
		});
	}else if(q.charAt(0) == '@'){
		q = q.substring(1);
		Users.find({tweet_handle: new RegExp('^'+q,'i')}).limit(5).exec(function(err,qans){
			res.json(qans);
		});
	}else{
		Users.find({fname: new RegExp('^'+q,'i')}).limit(5).exec(function(err,qans){
			res.json(qans);
		});
	}
}

//Retweet
exports.retweet = function(req,res){
	console.log("Class tweet and function rwtweet");
	tweetid = req.param('id');
	// console.log(tweetid);
	Tweets.count({'user_id': req.session.uid, 'parent_id': tweetid}, function(err,co){
		if(co > 0){
			Tweets.remove({'user_id': req.session.uid, 'parent_id': tweetid}, function(err){
				Tweets.findOneAndUpdate({id: tweetid},{$inc: {retweets: -1}},function(err,id){
					if(!err){
						Users.update({id: req.session.uid},{$pull: {retweets: tweetid}}, function(err, pull){
							res.json(false);
						});
					}
				});
			});
		}else{	
			Counter.findOneAndUpdate({table_name: 'tweets'},{$inc: {lastid: 1}},function(err,id){
				// console.log(id);
				var ret = new Tweets();
				ret.id = id.lastid;
				ret.parent_id = tweetid;
				ret.user_id = req.session.uid;
				ret.createdAt = new Date();
				ret.save(function(err){
					if(!err){
						Tweets.findOneAndUpdate({id: tweetid},{$inc: {retweets: 1}},function(err,id){
							if(!err){
								Users.update({id: req.session.uid},{$push: {retweets: tweetid}}, function(err, push){
									res.json(true);
								});
							}
						});
					}
				})
			});
		}
	});
//	res.json(tweetid);
}


//GET UNIQUE ARRAY
Array.prototype.getUnique = function (createArray) {
    createArray = createArray === true ? true : false;
    var temp = JSON.stringify(this);
    temp = JSON.parse(temp);
    if (createArray) {
        var unique = temp.filter(function (elem, pos) {
            return temp.indexOf(elem) == pos;
        }.bind(this));
        return unique;
    }
    else {
        var unique = this.filter(function (elem, pos) {
            return this.indexOf(elem) == pos;
        }.bind(this));
        this.length = 0;
        this.splice(0, 0, unique);
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
