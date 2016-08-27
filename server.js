// server.js

const express 		= require('express');
const bodyParser 	= require('body-parser');
const app 			= express();
const path 			= require('path');
const MongoClient	= require('mongodb').MongoClient;
//const config		= require('./config.js');

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));

var db
MongoClient.connect(
	process.env.MONGOLAB_URI, 
	(err, database) => {
	if (err) return console.log(err)
	db = database
	app.listen(process.env.PORT || 3000, () => {
		console.log('listening')
	})
})

app.get('/req', (req, res) => {
	var cursor = db.collection('glucotrak').find().toArray(function(err, results) {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(results, null, 3));
	})
	//res.redirect('/');
})

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
})

app.post('/resp', (req, res) => {
	db.collection('glucotrak').save(req.body, (err, result) => {
		if (err) return console.log(err)
			console.log('saved to database')
		res.redirect('/')
	})
})




