// server.js

const express 		= require('express');
const bodyParser 	= require('body-parser');
const app 			= express();
const path 			= require('path');
const MongoClient	= require('mongodb').MongoClient;
const config		= require('./config.js');

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html')
})

app.post('/resp', (req, res) => {
	db.collection('glucotrak').save(req.body, (err, result) => {
		if (err) return console.log(err)
		console.log('saved to database')
		res.redirect('/')
	})
})


var db

MongoClient.connect('mongodb://'+config.mongo.user+':'+config.mongo.password+'@ds013966.mlab.com:13966/rwd-test', (err, database) => {
	if (err) return console.log(err)
	db = database
	app.listen(3000, () => {
		console.log('listening on 3000')
	})

})


