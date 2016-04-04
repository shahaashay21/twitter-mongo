var app = angular.module("twitter",[]);

app.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});

app.controller("twitterhash",function($scope, $http){

//	$scope.hashtag = function(){
//		$http({
//		});
//	}
//	angular.element('.center-home').hide();
//	$scope.hashtag();
});

app.controller("twitter",function($scope, $http, $location){
	//LOGOUT USER
	$scope.logout = function(){
		$http({
			method: 'POST',
			url: '/logout',
		}).then(function suc(val){
			if(val.data == "done"){
				window.location.assign('/');
			}
		});
	};
	$scope.tweetchar = function(){
		if($scope.tweet.length == 0 || $scope.tweet.length > 140){
			angular.element(".tweetsubmitbtn").addClass("disabled");
		}else{
			angular.element(".tweetsubmitbtn").removeClass("disabled");
		}
	};
	//SUBMIT TWEET
	$scope.tweetsubmit = function(){
		// console.log(window.file);
		var ret = 0; 
		if(!window.file){
			if($scope.tweet.length > 0 && $scope.tweet.length <= 140){
			}else{
				ret = 1;
				angular.element("#tweetbox").modal('hide');
				alertline("alert-notify-danger","<b>Tweet must have less than 140 character</b>");
			}
		}
		if(ret == 0){
			var formData = new FormData();
		    var file = window.file;
		    if(file && filename){
		    	filename = document.getElementById('twimage').value;
		    	formData.append('myFile', file);
		    	formData.append('url', filename);
		    }
		    formData.append('tweet', $scope.tweet);
		    // console.log(filename);
		    
		    var xhr = new XMLHttpRequest();
		    
		    xhr.onreadystatechange = function() {
			    if (xhr.readyState == 4 && xhr.status == 200) {
			      	angular.element("#tweetbox").modal('hide');
					alertline("alert-notify-success","<b>Tweet has been successfully posted</b>");
					angular.element(".stylish-input-group2").hide();
					angular.element(".stylish-input-group1").show();
					angular.element(".center-home .top").css('height', '55px');
					$scope.tweet = "";
					$scope.recenttweet();
					$scope.totalTweet += 1;
					$('#previewing').css("display", "none");
					if(file && filename){
						window.file = "";
						document.getElementById('twimage').value = "";
					}
			    }
			}

		    xhr.open('post', '/tweet', true);

		    xhr.send(formData);

		}
	};
	//GET RECENT TWEET
	$scope.recenttweet = function(){
		$scope.userid = window.userid;
		if(window.hashSearch){
			var url = "/hashtweet";
			var data = {'q': window.hashSearch}; 
		}else if(window.useridpage){
			var url = "/tweetbyuserid";
			var data = {'q': window.useridpage};
		}else{
			var url = "/recenttweet";
			var data = {'q': ""};
		}
			$http({
			method: 'POST',
			url: url,
			data: data,
			dataType: 'json'
		}).then(function(data){
			// console.log(data.data);
//			console.log(data.data.likes);
//			$scope.tweetlike = data.data.likes;
//			$scope.likeval = data.data.likes;
			$scope.recentTweets = data.data;
			// console.log($scope.recentTweets[0].tweet);
//			console.log($scope.tweetlike);
			for(var i=0; i<$scope.recentTweets.length; i++){// Give all object of tweet
//				console.log($scope.recentTweets[i].tweet.tweet);
				var hashtag = [];
				if($scope.recentTweets[i].tweet && $scope.recentTweets[i].tweet.tweet != null && $scope.recentTweets[i].tweet.tweet != ""){
					var hashWithSpace = $scope.recentTweets[i].tweet.tweet.match(/(^#\w+| #\w+| #\w+)/g);
					if(hashWithSpace){
						hashWithSpace = hashWithSpace.getUnique(true);
						for(var j=0; j<hashWithSpace.length; j++){// Get hastag from tweet
							hashtag[j] = hashWithSpace[j].trim();
							$scope.recentTweets[i].tweet.tweet = $scope.recentTweets[i].tweet.tweet.replace(new RegExp(hashtag[j],'g'),"<a href='/hashtag/"+hashtag[j].substring(1)+"'>"+hashtag[j]+"<a/>");
						}
					}
				}
				// console.log($scope.recentTweets[i].tweet.tweet);
				if($scope.recentTweets[i].parentTweet && $scope.recentTweets[i].parentTweet.tweet){
					var hashWithSpace = $scope.recentTweets[i].parentTweet.tweet.match(/(^#\w+| #\w+| #\w+)/g);
					if(hashWithSpace){
						hashWithSpace = hashWithSpace.getUnique(true);
						for(var j=0; j<hashWithSpace.length; j++){// Get hastag from tweet
							hashtag[j] = hashWithSpace[j].trim();
							$scope.recentTweets[i].parentTweet.tweet = $scope.recentTweets[i].parentTweet.tweet.replace(new RegExp(hashtag[j],'g'),"<a href='/hashtag/"+hashtag[j].substring(1)+"'>"+hashtag[j]+"<a/>");
						}
					}
				}
				if($scope.recentTweets[i].parentTweet){
					var newdate = new Date($scope.recentTweets[i].parentTweet.createdAt);
				}else{
					var newdate = new Date($scope.recentTweets[i].tweet.createdAt);
				}
				var nowdate = new Date();
				var difference = parseInt(nowdate - newdate); 
				var seconds = parseInt((difference)/1000);
				var minutes = parseInt(seconds/60);
				var hrs = parseInt(minutes/60);
				var days = parseInt(hrs/24);
				var months = parseInt(hrs/30);
				if(seconds > 60){
					if(minutes > 60){
						if(hrs > 24){
							if(days > 30){
								var time = months+"m";
							}else{
								var time = days+"d"; 
							}
						}else{
							var time = hrs+"h"; 
						}
					}else{
						var time = minutes+"m"; 
					}
				}else{
					var time = seconds+"s"; 
				}
				if($scope.recentTweets[i].parentTweet){
					$scope.recentTweets[i].parentTweet.time = time;
				}else{
					$scope.recentTweets[i].tweet.time = time;
				}
			}
			// console.log($scope.recentTweets);	
		});
	}
	
//	 }
	
	//DELETE TWEET
	$scope.deleteTweet = function(id){
		// console.log(id);
		data = {'id': id};
		$http({
			method: 'POST',
			dataType: 'json',
			url: '/deletetweet',
			data: data
		}).then(function success(res){
			$scope.recenttweet();
			alertline("alert-notify-success","<b>Tweet has been successfully deleted</b>");
			$scope.totalTweet -= 1;
		});
	};
	

	//GET SEARCH SUGGESTION MADE BY ME
	var tempcheck = "";
	$scope.q ="";
	$scope.search = function(opt){
		var hashtag = 0;
		var handle = 0;
		if(opt == "focus"){
			tempcheck = "";
		}
		if($scope.q != tempcheck){
			var data = {'q': $scope.q};
			if($scope.q.charAt(0) == '#'){
				hashtag = 1;
			}else if($scope.q.charAt(0) == '@'){
				handle= 1;
			}
			$http({
				method: 'POST',
				dataType: 'json',
				url: '/suggest',
				data: data
			}).then(function success(res){
				if(hashtag == 1){
					$scope.availableTagsHashtag = res.data;
					angular.element('.for-drop').css("display","none");
					angular.element('.for-drop-hashtag').css("display","table");
				}else if(handle == 1){
					$scope.availableTags = res.data;
					angular.element('.for-drop').css("display","table");
				}else{
					$scope.availableTags = res.data;
					angular.element('.for-drop-hashtag').css("display","none");
					angular.element('.for-drop').css("display","table");
				}
				angular.element('.dropdown-toggle').dropdown();
				angular.element('.dropdown-toggle').css("display","table");
				tempcheck = $scope.q;
			});
			
		}
	};
	
	//REDIRECT TO USER PROFILE PAGE
	$scope.userRedirect= function(id){
		window.location.assign("/user/"+id);
	};
	
	//REDIRECT TO HASHTAG SEARCH
	$scope.hashtagRedirect = function(hashtag){
		window.location.assign("/hashtag/"+hashtag);
	}
	
	
	$scope.like = function(id,userlike,index,retweet){
		data = {'id': id};
//		console.log(index);
		$http({
			method: 'POST',
			url: '/like',
			data: data,
			dataType: 'json'
		}).then(function suc(reslike){
			if(reslike.data == true){
				if(retweet == 0){
					$scope.recentTweets[index].tweet.likes = Number($scope.recentTweets[index].tweet.likes) + 1;
				}else{
					$scope.recentTweets[index].parentTweet.likes = Number($scope.recentTweets[index].parentTweet.likes) + 1;
				}
				$scope.recentTweets[index].like = 1;
			}
			if(reslike.data == false){
				if(retweet == 0){
					$scope.recentTweets[index].tweet.likes = Number($scope.recentTweets[index].tweet.likes) - 1;
				}else{
					$scope.recentTweets[index].parentTweet.likes = Number($scope.recentTweets[index].parentTweet.likes) - 1;
				}
				$scope.recentTweets[index].like = 0;
			}
		});
	}
	
	//FOLLOW AND UNFOLLOW
	$scope.follow = function(followid, followChk){
		data = {'id': followid, 'followChk': followChk};
		// console.log('go '+data);
		$http({
			method: 'POST',
			url: '/followid',
			data: data,
			dataType: 'json'
		}).then(function suc(followUserChk){
			// console.log('return '+followUserChk.data);
			$scope.proffollowchk = followUserChk.data;
		});
	}
	
	//CHECK WHETHER SELECTED PROFILE IS OWNER,FOLLOWERS OR NOT(FOR BUTTONS)
	$scope.profilebtn = function(){
		console.log('Function profilebtn');
		if(window.userid == window.useridpage){
//			$scope.profuser = 1;
		}else{
//			$scope.profuser = 0;
		}
		$scope.profuserid = window.userid;
		$scope.profuser_id = window.useridpage;
		$scope.proffollowchk = window.followchk;
	}
	
	//UPDATE USER INFORMATION MODEL
	$scope.userDetails = function(){
		$http({
			method: 'POST',
			url: '/userdetails'
		}).then(function suc(data){
			// console.log(data);
			// if(data.data.bday != null || data.data.bday != "" || data.data.bday != "0000-00-00"){
			// 	bday = new Date(data.data.bday);
			// 	data.data.bday = new Date(bday.getYear(),bday.getMonth(),bday.getDate()+1);
			// }
//			console.log(new Date(data.data.bday).getYear());
			if(data.data.bday == "0000-00-00" || new Date(data.data.bday).getYear() == '69'){
				data.data.bday = null;
			}
//			console.log(data.data.bday);
			$scope.userinfo = data.data;
		});
	}
	
	$scope.addinfo = function(){
//		angular.element(".input_text_box").hide();
		angular.element(".input_text_box").removeClass("inputerr");
		angular.element(".ff-text-danger").remove();
		data = {'user': $scope.userinfo};
		console.log(data);
		$http({
			method: 'POST',
			url: '/addinfo',
			data: data,
			dataType: 'json'
		}).then(function suc(data){
			// console.log(data.data);
			if(data.data.alert || data.data.alert == 1){
				alertline("alert-notify-danger","<b>Something went wrong!</b>");
			}else{
				if(data.data.msg == 1){
					angular.forEach(data.data.message, function(i,item){
						angular.element("#"+item).addClass("inputerr");
						angular.element("#"+item).after("<div class=\'col-xs-12 ff-text-danger\'>"+i+"</div>");
					});
				}else{
					angular.element("#userinfo").modal("hide");
					alertline("alert-notify-success","<b>Saved contact information</b>");
				}
			}
		});
	}
	
	//User Retweet
	$scope.retweet = function(user,userid,parent_id,retweet,index){
		if(user == userid){
			alertline("alert-notify-warning","<b>Can not retweet your own tweet</b>");
		}else{
			data = {'id': parent_id, 'retweet': retweet};
			$http({
				method: 'POST',
				url: '/retweet',
				data: data,
				dataType: 'json'
			}).then(function suc(res){
				// if($scope.tweets[index].parent_tweet_retweet_count == null || $scope.tweets[index].parent_tweet_retweet_count == "");{
				// 	$scope.tweets[index].parent_tweet_retweet_count = 0;
				// }
				if(res.data == true){
					if(retweet == 0){
						$scope.recentTweets[index].tweet.retweets = Number($scope.recentTweets[index].tweet.retweets) + 1;
					}else{
						$scope.recentTweets[index].parentTweet.retweets = Number($scope.recentTweets[index].parentTweet.retweets) + 1;
					}
					$scope.recentTweets[index].retweet = 1;
				}
				if(res.data == false){
					if(retweet == 0){
						$scope.recentTweets[index].tweet.retweets = Number($scope.recentTweets[index].tweet.retweets) - 1;
					}else{
						$scope.recentTweets[index].parentTweet.retweets = Number($scope.recentTweets[index].parentTweet.retweets) - 1;
					}
					$scope.recentTweets[index].retweet = 0;
				}
				// console.log(res.data);
				if(window.location.pathname.indexOf("/user") >= 0){
					
				}
				if(window.location.pathname.indexOf("/user") >= 0){
					
				}else{
//					$scope.recenttweet();
				}
				$scope.recenttweet();
				
			});
		}
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
	
	
	//CALL DEFAULT WHEN PAGE LOAD
	$scope.recenttweet();
	if(window.location.pathname.indexOf("/user") >= 0){
		$scope.profilebtn();
	}
});

// DIRECTIVE MADE IN ORDER TO APPLY JQUERY AFTER NG-REPEAT, HTTP
app.directive('searchRepeatDirective', function() {
	  return function(scope, element, attrs) {
		  element.hover(function (){
			  angular.element(this).find('.suggest-name').css("color","#fff");
			  angular.element(this).find('.suggest-handle').css("color","#fff");
			  angular.element(this).find('.suggest-hashtag').css("color","#fff");
		  },function () {
			  angular.element(this).find('.suggest-name').css("color","#292f33");
			  angular.element(this).find('.suggest-handle').css("color","#8899a6");
			  angular.element(this).find('.suggest-hashtag').css("color","#66757f");
		  });
	  };
});
app.directive('followBtn', function(){
	return function(scope, element, attrs) {
		element.hover(function (){
			angular.element(".btn-following").addClass("btn-unfollow");
    		angular.element(".btn-following").html("Unfollow");
		},function (){
			angular.element(".btn-following").removeClass("btn-unfollow");
			angular.element(".btn-following").html("Following");
		});
	};
});