const express 		= require('express');
const bodyParser 	= require('body-parser');
const app 			= express();
const path 			= require('path')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html')
})

app.post('/resp', (req, res) => {
  console.log(req.body)
})

app.listen(3000, function(){
	console.log('listening on 3000')
})

