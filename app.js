
/**
 * Module dependencies.
 */
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , formidable = require('formidable')
  , login = require('./routes/login')
  , tweet = require('./routes/tweet')
  , hash = require('./routes/hash');

var mongoose = require('mongoose');
mongoose.connect("mongodb://clonetwitter:clonetwitter@ds031975.mlab.com:31975/clonetwitter");
// mongoose.connect("mongodb://localhost/twitter?poolSize=5"); //LOCAL USE

var mongoURL = "mongodb://clonetwitter:clonetwitter@ds031975.mlab.com:31975/clonetwitter";
// var mongoURL = "mongodb://localhost/twitter"; //LOCAL USE
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var app = express();

// all environments
app.set('port', process.env.PORT || 3002);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.use(express.favicon());
app.use(express.logger('dev'));
// app.use(express.bodyParser({
// 	keepExtensions: true, 
//     uploadDir: __dirname + '/public/img',
//     limit: '3mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.methodOverride());

app.use(fileUpload());


//SETTING UP SESSION
app.use(expressSession({
	key: 'session_cookie_aashay',
    secret: 'aashay',
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new mongoStore({
		url: mongoURL
	})
}));


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//GET REQUEST

app.get('/', routes.index);
app.get('/users', user.list);


//GET ALL THE TWEET THAT HAS HASHTAG OF :TAG
app.get('/hashtag/:tag', hash.page);

//USER PROFILE FROM ID
app.get('/user/:id',user.profile);


//POST REQUEST

//To register user
app.post('/reg', login.registerUser);
//To login user
app.post('/login', login.loginUser);
//To logout user
app.post('/logout', login.logOut);
// Insert tweet to db
app.post('/tweet', tweet.ins);
//Get recent tweet
app.post('/recenttweet', tweet.recentTweet);
//Delete tweet
app.post('/deletetweet', tweet.deleteTweet);
//Search suggestion
app.post('/suggest', tweet.suggest);
//Get Hash Tweet
app.post('/hashtweet', hash.hashtweet);
//Like and Dislike button
app.post('/like', tweet.like);
//Show all tweets of user by userid
app.post('/tweetbyuserid', tweet.tweetbyuserid);
//Follow and unfollow user
app.post('/followid', user.follow);
//User information to update it using model
app.post('/userdetails', user.userDetails);
//Update user information it using model
app.post('/addinfo', user.addinfo);
//Retweet
app.post('/retweet', tweet.retweet);
//Update Profile
app.post('/updateprof', user.updateprof);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
