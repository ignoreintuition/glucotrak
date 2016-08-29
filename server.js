// server.js

const express 			= require('express');
const session 			= require('express-session');
const bodyParser 		= require('body-parser');
const app 				= express();
const path 				= require('path');
const MongoClient		= require('mongodb').MongoClient;
const passport			= require('passport')
const LocalStrategy 	= require('passport-local').Strategy;
const jwt 				= require('jsonwebtoken');
const cookieParser		= require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}))
app.use(passport.initialize());
app.use(passport.session());

var db
MongoClient.connect(
	process.env.MONGOLAB_AQUA_URI || 'mongodb://localhost',  
	(err, database) => {
		if (err) return console.log(err)
			db = database
		var port = process.env.PORT || 3000;
		app.listen(port, () => {
			console.log('listening on '+ port)
		})
	})

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
})

app.get('/req', function(req, res)  {
	passport.authenticate('local');
	var cursor = db.collection('glucotrak').find({"userid":req.user._id}).toArray(function(err, results) {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(results, null, 3));
	})
})

app.get('/user', function(req, res)  {
	passport.authenticate('local');
	res.send(JSON.stringify({username: req.user.username}, null, 3));
})

app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/public/login.html');
})

app.post('/resp', (req, res ) => {
	passport.authenticate('local');
	req.body.userid = req.user._id;
	db.collection('glucotrak').save(req.body, (err, result) => {
		if (err) return console.log(err)
			console.log('saved to database')
		res.redirect('/')
	})
})

passport.use(new LocalStrategy(
	function(username, password, done){
		db.collection('users').findOne({username: username}, function(err, user){
			if (err) {
				console.log('err');
				return done(err);}
				if(!user){
					console.log('!user');
					return done(null, false, {message: 'incorrect username'});
				}
				if(user.password != password){
					console.log('!password')
					return done(null, false, {message: 'incorrect password'})
				}
				console.log('logged in');
				return done(null, user);
			});
	})
);

app.post('/login', 
	passport.authenticate('local', { 	
		successRedirect: '/', 
		failureRedirect: '/login'
	})
	);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

