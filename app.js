// app.js

const express = require('express');
const session = require('express-session');
const app = express();
const router = express.Router();

const sessionOptions = {
	secret: 'secret cookie thang',
	resave: true,
	saveUninitialized: true
};

app.use(session(sessionOptions));

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false}));

require('./db');

// express static setup
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
// hbs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const mongoose = require('mongoose');
const Feedback = mongoose.model("Feedback");
const Wine = mongoose.model("Wine");
const User = mongoose.model("User");
const Pref = mongoose.model("Pref");

app.use('/', router);

app.get('/404', (req, res) =>{
	res.render('404', {});
});

router.get('/', function(req, res){
	console.log('in app.get /');
	res.render('index', {links: links});
});

router.post('/', (req, res) => {
	res.redirect('/');
});


app.listen(3000);