// server.js

const flash = require('connect-flash');
const express 			= require('express');
const session 			= require('express-session');
const bodyParser 		= require('body-parser');
const app 				= express();
const path 				= require('path');
const MongoClient		= require('mongodb').MongoClient;
const passport			= require('passport')
const LocalStrategy 	= require('passport-local').Strategy;
const cookieParser		= require('cookie-parser');
const _und				= require('underscore');
const crypto			= require('crypto');
const moment			= require('moment');

app.use(flash());
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
	secret: 'itsasecret',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}))
app.use(passport.initialize());
app.use(passport.session());

//instantiate connection to Mongo Database
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

// Serve up index.html page
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
})

// Once authenticated req will pass back all of the records
// in JSON format for the user_id supplied
app.get('/req', function(req, res)  {
	passport.authenticate('local');
	if (req.user){
		var cursor = db.collection('glucotrak').find({"userid":req.user._id}).toArray(function(err, results) {
			var results = _und.sortBy(results, 'date').reverse();
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(results, null, 3));
		})
	}
})

// Returns the currently logged in user name
app.get('/user', function(req, res)  {
	passport.authenticate('local');
	if (req.user){
		res.send(JSON.stringify({username: req.user.username}, null, 3));
	} else {
		res.send({}, null, 3);
	}
})

//Serve the login page
app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/public/login.html');
})

app.get('/err', (req, res) => {
	res.send({messages: req.flash('error')});
})

//serve the sign up page
app.get('/signup', (req, res) => {
	res.sendFile(__dirname + '/public/signup.html');
})

//Post a new reading 
app.post('/resp', (req, res ) => {
	passport.authenticate('local');
	req.body.userid = req.user._id;
	db.collection('glucotrak').save(req.body, (err, result) => {
		if (err) return console.log(err)
			console.log('saved to database')
		res.redirect('/')
	})
})

//delete a reading
app.post('/del', (req, res) => {
	passport.authenticate('local');
	db.collection('glucotrak').deleteMany(
		{ "guid": req.body.guid }
		)
})

//update a reading
app.post('/update', (req, res) => {
	passport.authenticate('local');
	console.log(req.body.date.toLocaleString('en-US'));
	db.collection('glucotrak').updateOne(
		{ "guid": req.body.guid }, {
			$set: {"value": req.body.value, "date": req.body.date}
		})
	res.redirect('/')

})

//authentication
passport.use(new LocalStrategy( {passReqToCallback : true},
	function(req, username, password, done){
		db.collection('users').findOne({username: username}, function(err, user){
			var hash = crypto.createHash('sha256');
			if (err) {
				console.log('err');
				return done(err);
			}
			if(!user){
				console.log('!user');
				return done(null, false, {message: 'incorrect username'});
			}
			hash.update(password);
			password = hash.digest('hex');	
			if(user.password != password){
				console.log('!password')
				return done(null, false, {message: 'incorrect password'})
			}
			console.log('logged in');
			return done(null, user);
		});
	})
);

// login an existing user account
app.post('/login', 
	passport.authenticate('local', { 	
		successRedirect: '/', 
		failureRedirect: '/login',
		failureFlash: true })
);

// login an existing user account
app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

// signup for a new user account
app.post('/signup', (req, res ) => {
	db.collection('users').find({ "username": req.body.username }).toArray(function(err, results){
		var hash = crypto.createHash('sha256');
		hash.update(req.body.password);
		req.body.password = hash.digest('hex');	
		passport.authenticate('local');
		if(results[0] == undefined){
			db.collection('users').save(req.body, (err, result) => {
				if (err)
					{ return console.log(err) }
				console.log('saved to database')
				res.redirect('/login')
			})
		}else {
			req.flash('error', 'User Already Exists')
			res.redirect('/signup')
		}
	})
})

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

