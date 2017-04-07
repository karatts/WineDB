// app.js

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
//express
const app = express();
//express-session
const sessionOptions = {
	secret: 'secret cookie thang',
	resave: true,
	saveUninitialized: true
};
app.use(session(sessionOptions));
//body-parser
app.use(bodyParser.urlencoded({ extended: false}));
// express static setup
app.use(express.static(path.join(__dirname, 'public')));
// hbs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

require('./db');

//const Feedback = mongoose.model("Feedback");
//const Wine = mongoose.model("Wine");
const User = mongoose.model("User");
//const Pref = mongoose.model("Pref");

//------------------------------------------------------------------------

//home page
app.get('/', function(req, res){
	console.log('in app.get /');
	const sessID = req.session.username;
	if(sessID === undefined){
		res.render('homepage', {noid: true});
	}
	else{
		res.render('homepage', {id: true, session: sessID});
	}
});

//register form
//get - to display the form
app.get('/register', (req, res) => {
	console.log('in app.get /register');
	User.find({}, (err, users) => {
		if(err){
			console.log(err);
		}else{
			console.log(users);
			res.render('register', {users: users});
		}
	});
});
//post - to process the form input
app.post('/register', (req, res) => {
	const testPW = req.body.password;
	let testUN = req.body.username;
	User.findOne({username: testUN}, (err, result, count) => {
		const pwerr = (testPW.length < 8);
		let unerr = false;
		if(result){
			unerr = true;
		}
		if(pwerr || unerr){
			res.render('register', {pwerror: pwerr, unerror: unerr});
		}
		else{
			bcrypt.hash(testPW, 10, function(err, hash) {
				testUN = testUN.toLowerCase();
				const usr = new User({
					username: testUN,
					password: hash,
				});
				//console.log(usr.password);
				usr.save((err) => {
					if(err){
						console.log(err);
					}else{
						//Start an authenticated Session
						req.session.regenerate((err) => {
							if(!err){
								req.session.username = usr.username;
								//redirect to user preferences set up page
								console.log('wow')
								//res.redirect('/preferences');
							}
							else{
								console.log(err);
							}
						});
					}
				});
			});
		}
	});
});

//login form
app.get('/login', (req, res) => {
	console.log('in app.get /login');
	res.render('login', {});
});
app.post('/login', (req, res) => {
	let name = req.body.username;
	name = name.toLowerCase();
	User.findOne({username: name}, (err, result, count) => {
		const userlog = {unerror: false, pwerror: false};
		if(result && !err){
			//test password now
			bcrypt.compare(req.body.password, result.password, (err, result) =>{
				if(!result){
					console.log('Invalid password');
					userlog.pwerror = true;
					res.render('login', userlog);
				}
				else{
					//start an authenticated session
					req.session.regenerate((err) => {
						if(!err){
							req.session.username = req.body.username;
							res.redirect('/');
						}
						else{
							console.log(err);
						}
					});
				}
			});
		}
		else{
			userlog.unerror = true;
			res.render('login', userlog);
		}
	});
});

//a page that can only be seen if logged in
app.get('/restricted', (req, res) => {
	const sessID = req.session.username;
	if(sessID === undefined){
		//not logged in
		res.redirect('/login');
	}
	else{
		//logged in
		res.render('restricted', {});
	}
});

app.get('/preferences', (req, res) => {
	const sessID = req.session.username;
	if(sessID === undefined){
		//not logged in
		res.redirect('/login');
	}
	else{
		//logged in
		sessID = sessID.toLowerCase();
		User.findOne({username: sessID}, (err, result, count) => {
			if(result && !err){
				console.log('logged in!')
				//res.render('preferences', {res: result});
			}
			else{
				console.log('Had a problem finding user');
				console.log(err);
			}
		});
	}
});
app.post('/preferences', (req, res) => {
	console.log(req.body);
});

//add a wine form
app.get('/addawine', (req, res) => {
	const sessID = req.session.username;
	if(sessID === undefined){
		//not logged in
		res.render('addawine', {});
	}
	else{
		//logged in
		res.render('addawine', {});
	}
});
app.post('/addawine', (req, res) => {

});

//logout
app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if(err){
			console.log('There was a problem logging out!');
		}
		else{
			res.redirect('/');
		}
	});
});

//--------------------------------

//listen on port 3000
app.listen(3000);