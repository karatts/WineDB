const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
//express
const app = express();
const router = express.Router();
//express-session
const sessionOptions = {
	secret: 'this is a random secret',
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

const User = mongoose.model("User");
const Wine = mongoose.model("Wine");

User.remove({}, function(err) { 
   console.log('collection removed') 
});

app.use('/', router);
//-----------------------------------------------------------
//Default starter wine DB
const newWine1 = new Wine({
	brand: "Mascota Vineyards",
	name: "Unanime",
	year: "2013",
	type: "Red Wine",
	sweetness: ["Dry", "Semi-Sweet"],
	image: "http://www.totalwine.com/media/sys_master/twmmedia/hbd/h41/9701912936478.png",
	comments: [],
	avgrating: 93,
});
newWine1.save((err) =>{
	if(err){
		console.log("Error saving default wine 1...");
	}
});
const newWine2 = new Wine({
	brand: "Chateau Dalem",
	name: "Fronsac",
	year: "2014",
	type: "Red Wine",
	sweetness: ["Dry", "Semi-Sweet"],
	image: "http://www.totalwine.com/media/sys_master/twmmedia/h22/hf4/9814718349342.png",
	comments: [],
	avgrating: 91,
});
newWine2.save((err) =>{
	if(err){
		console.log("Error saving default wine 2...");
	}
});
const newWine3 = new Wine({
	brand: "Dr Heidemanns",
	name: "Riesling Qba",
	year: "2015",
	type: "White Wine",
	sweetness: ["Semi-Sweet", "Sweet"],
	image: "http://www.totalwine.com/media/sys_master/twmmedia/h38/hdd/8811158011934.png",
	comments: [],
	avgrating: 88,
});
newWine3.save((err) =>{
	if(err){
		console.log("Error saving default wine 3...");
	}
});
const newWine4 = new Wine({
	brand: "Renieri",
	name: "Invetro",
	year: "2013",
	type: "Red Wine",
	sweetness: ["Dry"],
	image: "http://www.totalwine.com/media/sys_master/twmmedia/h94/h13/8803381018654.png",
	comments: [],
	avgrating: 91,
});
newWine4.save((err) =>{
	if(err){
		console.log("Error saving default wine 4...");
	}
});
const newWine5 = new Wine({
	brand: "Olema",
	name: "Chardonnay Sonoma",
	year: "2014",
	type: "White Wine",
	sweetness: ["Dry", "Semi-Sweet"],
	image: "http://www.totalwine.com/media/sys_master/twmmedia/h94/h13/8803381018654.png",
	comments: [],
	avgrating: 91,
});
newWine5.save((err) =>{
	if(err){
		console.log("Error saving default wine 5...");
	}
});
//-----------------------------------------------------------
//random functions
function capFirst(str) {
    return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '); 
}
//-----------------------------------------------------------

//home page
router.get('/', (req, res) => {
	const sessID = req.session.username;
	let winehp = [];
	if(sessID === undefined){
		Wine.find({}, (err, result, count) => {
			if(err){
				console.log('error in get /');
			}
			else{
				console.log(result);
				let numAdded = [];
				const len = result.length;
				while(numAdded.length < 5){			
					let num = Math.floor(Math.random() * ((len-1) - 0 + 1) + 0);
					if(numAdded.includes(num) === false){
						winehp.push(result[num]);
						numAdded.push(num);
					}
				};
			}
		});
		res.render('homepage', {noid: true, wine: winehp});
	}
	else{
		const sessID2 = sessID.toLowerCase();
		const winePref = [];
		User.find({username: sessID2}, (err, result1, count) => {
			//find user preferences
			const typeLike = result1[0].type;
			const sweetnessLen = (result1[0].sweetness).length;
			//if there is one type of wine preference
			if(typeLike.length === 1){
				//if there is no sweetness preference
				if(sweetnessLen === 0){
					Wine.find({type: typeLike}, (err, resultw1, count) =>{
						if(resultw1.length < 6){
							resultw1.forEach((ele)=>{
								winePref.push(ele);
							});
						}
						else{
							let addedNums2 = [];
							while(addedNums2.length < 6){
								let num5 = Math.floor(Math.random() * ((resultw1.length-1) - 0 + 1) + 0);
								if(addedNums1.includes(num5) === false){
									winePref.push(resultw1[num5]);
									addedNums1.push(num5);
								}
							}
						}
					});
				}
				//if there is a sweetness preference
				else{
					//pick one random sweetness preference
					let num2 = Math.floor(Math.random() * ((sweetnessLen-1) - 0 + 1) + 0);
					const sweetPref = (result1[0].sweetness)[num2];

					Wine.find({type: typeLike, sweetness: sweetPref}, (err, result2, count) => {
					let addedNums1 = [];
					let i = 0;
					const addedLen = result2.length;
					if(addedLen < 6){
						result2.forEach((ele) =>{
							winePref.push(ele);
						});
					}
					else{
						while(addedNums1.length < 6){
							let num3 = Math.floor(Math.random() * ((addedLen-1) - 0 + 1) + 0);
							if(addedNums1.includes(num3) === false){
								winePref.push(result2[num3]);
								addedNums1.push(num3);
							}
						}
					}
					});
				}
			}
			else{
			//if they like none or both of the types
				//if they have no preferences, display random from all wines
				if(sweetnessLen === 0){
					Wine.find({}, (err, result, count) => {
						if(err){
							console.log('error in get /');
						}
						else{
							let numAdded3 = [];
							const len = result.length;
							if(len < 6){
								result.forEach((ele)=>{
									winePref.push(ele);
								});
							}
							else{
								while(numAdded3.length < 6){			
									let num = Math.floor(Math.random() * ((len-1) - 0 + 1) + 0);
									if(numAdded3.includes(num) === false){
										winePref.push(result[num]);
										numAdded3.push(num);
									}
								};
							}
						}
					});
				}
				else{
				//if they have a sweetness preference, pick one and display those
					let num2 = Math.floor(Math.random() * ((sweetnessLen-1) - 0 + 1) + 0);
					const sweetPref = (result1[0].sweetness)[num2];
					Wine.find({sweetness: sweetPref}, (err, result4, count) => {
						let addedNums2 = [];
						let i = 0;
						for(i = 0; i < 6; i++){
							let num4 = Math.floor(Math.random() * ((result4.length-1) - 0 + 1) + 0);
							if(addedNums2.includes(num4) === false){
								winePref.push(result4[num4]);
								addedNums2.push(num4);
							}
						}
					});
				}
			}
			res.render('homepage', {id: true, session: sessID, wine: winePref});
		});
	}
});

//register form
//get - to display the form
router.get('/register', (req, res) => {
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
router.post('/register', (req, res) => {
	console.log(req.body);
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
					fname: req.body.fname,
					lname: req.body.lname,
					password: hash,
					type: req.body.type,
					sweetness: req.body.sweetness,
				});
				console.log(usr.password);
				usr.save((err) => {
					if(err){
						console.log(err);
					}else{
						//Start an authenticated Session
						req.session.regenerate((err) => {
							if(!err){
								req.session.username = usr.username;
								res.redirect('/');
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
router.get('/login', (req, res) => {
	console.log('in app.get /login');
	res.render('login', {first: true});
});
router.post('/login', (req, res) => {
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

//add a wine to the database!
router.get('/addawine', (req, res) => {
	const sessID = req.session.username;
	if(sessID === undefined){
		//not logged in
		res.redirect('/login');
	}
	else{
		//logged in
		res.render('addawine', {start: true});
	}
});

router.post('/addawine', (req, res) => {
	let brand = req.body.brand;
	brand = capFirst(brand);
	let name = req.body.name;
	name = capFirst(name);

	Wine.find({brand: brand, name: name, year: req.body.year}, (err, result, count) =>{
		if(result.length !== 0){
			//don't add the wine
			res.render('addawine', {exists: true, wine: result[0]});
		}
		else{
			const newWine = new Wine({
				brand: brand,
				name: name,
				year: req.body.year,
				type: req.body.type,
				sweetness: req.body.sweetness,
				image: req.body.image,
				comments: [],
				avgrating: 0,
			});
			//add the wine
			newWine.save((err) =>{
				if(err){
					console.log("Error saving new wine...");
				}
				else{
					res.render('addawine', {success: true, wine: newWine});
				}
			});
		}
	});
});

//Wine slug
router.get("/:slug", (req, res)=>{
	console.log("AT THE SLUG PAGE");
	const slug = req.params.slug;
	Wine.find({slug: slug}, (err, result, count) => {
		if(err){
			console.log("Error at the slug page").
		}
	});
});

//preferences
router.get('/preferences', (req, res) => {
	let sessID = req.session.username;
	if(sessID === undefined){
		res.redirect('/login');
	}
	else{
		sessID = sessID.toLowerCase();
		User.find({username: sessID}, (err, results, count) =>{
			if(results && !err){
				console.log(results[0]);
				res.render('preferences', results[0]);
			}
			else{
				console.log('error in app.get /preferences');
				console.log(err);
			}
		});
	}
});
router.post('/preferences', (req, res) => {
	let sessID = req.session.username;
	sessID = sessID.toLowerCase();
	console.log(sessID);
	console.log(req.body.type);
	console.log(req.body.sweetness);
	User.find({username: sessID}, (err, results, count) => {
		results[0].type = req.body.type;
		results[0].sweetness = req.body.sweetness;
		results[0].save((err) => {
			if(err){
				console.log(err);
			}
			else{
				//console.log(results[0]);
				res.render('preferences', results[0]);
			}
		})
	});
});

//search page
router.get('/search', (req, res) => {
	let sessID = req.session.username;
	if(sessID === undefined){
		res.redirect('/login');
	}
	else{
		sessID = sessID.toLowerCase();
		User.find({username: sessID}, (err, results, count) =>{
			if(results && !err){
				console.log(results[0]);
				res.render('search', results[0]);
			}
			else{
				console.log('error in app.get /search');
				console.log(err);
			}
		});
	}
});
router.post('/search', (req, res) => {

});

//classification image
app.get('/classifications', (req, res) => {
	res.sendFile(path.join(__dirname, "public/images", "sweetness.png"));
});

//logout page
router.get('/logout', (req, res) => {
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
app.listen(process.env.PORT || 3000);