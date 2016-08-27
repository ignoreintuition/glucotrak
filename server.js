// server.js

const express 		= require('express');
const bodyParser 	= require('body-parser');
const app 			= express();
const path 			= require('path');
const MongoClient	= require('mongodb').MongoClient;
//var config 			= require('./config.json');

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));

var db
MongoClient.connect(
	process.env.MONGOLAB_AQUA_URI || 'mongodb://localhost',  
	(err, database) => {
	if (err) return console.log(err)
	db = database
	var port = process.env.PORT || 3000;
	app.listen(port, () => {
		console.log('listening')
	})
})

app.get('/req', (req, res) => {
	var cursor = db.collection('glucotrak').find().toArray(function(err, results) {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(results, null, 3));
	})
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




