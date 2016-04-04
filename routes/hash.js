var errmsg = require('./errmsg');

var Counter = require('./model/counter');
var Tweets = require('./model/tweets');
var Follow = require('./model/follow');
var Users = require('./model/users');
var HashTag = require('./model/hashtag');

var user = require('./user');

exports.page = function(req,res){
	console.log("Class hash and function page");
	if(req.session.uid){
		user.userInfo(req.session.uid, function(userinfo){
	//		console.log(req.params.tag);
			userinfo['hashSearch'] = req.params.tag;
//			console.log(userinfo);
			res.render('hashtag', userinfo);
		});
	}else{
		res.render('index', { title: 'Express' });
	}
}

exports.hashtweet = function(req,res){
	console.log("Class hash and function hashtweet");
	var tag = req.param('q');
	tag = tag.toLowerCase();
	console.log(tag);

	HashTag.find({hashtag: tag}, 'tweet_id' , function(err, hashTweets){
		// console.log(hashTweets);
		hashName = [];
		for (var i = 0; i < hashTweets.length; i++) {
			hashName[i] = hashTweets[i].tweet_id;
		}
		// console.log(hashName);

		Tweets.find({'id':{$in: hashName}}).limit(10).sort({'createdAt': -1 }).exec(function(err,allTweets){// console.log(allTweets);
			console.log(allTweets);
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
}