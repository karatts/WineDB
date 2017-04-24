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
//Functions
function capFirst(str) {
    return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '); 
}
function getNum(first, last){
	return Math.floor(Math.random() * ((last) - first + 1) + first);
}
function checkWines(num, addWine, numArray, wineArray){
	if(numArray.includes(num) === false){
		wineArray.push(addWine);
		numArray.push(num);
	}
}
function findAndAddWine(object2find, winePref, length, res, sessID){
	Wine.find(object2find, (err, result, count) => {
		if(err){
			console.log(err);
		}
		else{
			let addedNums = [];
			if(result.length < length){
				result.forEach((ele) => {
					winePref.push(ele);
				});
				res.render('homepage', {id: true, session: sessID, wine: winePref});
			}
			else{
				while(addedNums.length < length){
					let num = getNum(0, (result.length - 1));
					checkWines(num, result[num], addedNums, winePref);
				}
				res.render('homepage', {id: true, session: sessID, wine: winePref});
			}
		}
	});
}
function createAWine(brand, name, year, type, sweetness, image, rating){
	const wine = new Wine({
		brand: brand,
		name: name,
		year: year,
		type: type,
		sweetness: sweetness,
		image: image,
		avgrating: rating,
		comments: [],
	});
	Wine.find({brand: wine.brand, name: wine.name, year: wine.year}, (err, results, count) =>{
		if(results.length === 0){
			wine.save((err) =>{
				if(err){
					console.log("Error saving default wine 1...");
				}
			});
		}
	});
}

//-----------------------------------------------------------
// Starter wines
function addStarterWines(){
	createAWine("Mascota Vineyards", "Unanime", "2013", "Red Wine", ["Dry", "Semi-Sweet"], "http://www.totalwine.com/media/sys_master/twmmedia/hbd/h41/9701912936478.png", 93);
	createAWine("Chateau Dalem", "Fronsac", "2014", "Red Wine", ["Dry", "Semi-Sweet"], "http://www.totalwine.com/media/sys_master/twmmedia/h22/hf4/9814718349342.png", 91);
	createAWine("Dr Heidemanns", "Riesling Qba", "2015", "White Wine", ["Semi-Sweet", "Sweet"], "http://www.totalwine.com/media/sys_master/twmmedia/h38/hdd/8811158011934.png", 88);
	createAWine("Renieri", "Invetro", "2013", "Red Wine", ["Dry"], "http://www.totalwine.com/media/sys_master/twmmedia/h94/h13/8803381018654.png", 91);
	createAWine("Olema", "Chardonnay Sonoma", "2014", "White Wine", ["Dry", "Semi-Sweet"], "http://www.totalwine.com/media/sys_master/twmmedia/h94/h13/8803381018654.png", 91);
}
//-----------------------------------------------------------

let start = true;

//home page
router.get('/', (req, res) => {
	console.log('in router.get /');
	const sessID = req.session.username;
	if(sessID === undefined){
		if(start){
			addStarterWines();
			start = false;
			console.log('Adding startup wines');
		}
		let winehp = [];
		Wine.find({}, (err, result, count) => {
			if(err){
				console.log('error in get /');
			}
			else{
				let numAdded = [];
				while(numAdded.length < 5){	
					let num = getNum(0, (result.length-1));
					checkWines(num, result[num], numAdded, winehp);
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
			if(typeLike.length === 1){ //if there is one type of wine preference
				//if there is no sweetness preference
				if(sweetnessLen === 0){
					findAndAddWine({type: typeLike}, winePref, 6, res, sessID);
				}
				//if there is a sweetness preference
				else{
					//pick one random sweetness preference
					let num2 = getNum(0, (sweetnessLen - 1));
					const sweetPref = (result1[0].sweetness)[num2];
					findAndAddWine({type: typeLike, sweetness: sweetPref}, winePref, 6, res, sessID);
				}
			}
			else{ //if they like none or both of the types
				//if they have no preferences, display random from all wines
				if(sweetnessLen === 0){
					findAndAddWine({}, winePref, 6, res, sessID);
				}
				else{
				//if they have a sweetness preference, pick one and display those
					let num2 = getNum(0, (sweetnessLen - 1));
					const sweetPref = (result1[0].sweetness)[num2];
					findAndAddWine({sweetness: sweetPref}, winePref, 6, res, sessID);
				}
			}
		});
	}
});

//register form
//get - to display the form
router.get('/register', (req, res) => {
	console.log('in router.get /register');
	User.find({}, (err, users) => {
		if(err){
			console.log(err);
		}else{
			res.render('register', {users: users});
		}
	});
});
//post - to process the form input
router.post('/register', (req, res) => {
	console.log('in router.post /register');
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
router.get("/wine/:slug", (req, res) => {
	console.log("AT THE SLUG PAGE");
	const slug = req.params.slug;
	Wine.find({slug: slug}, (err, result, count) => {
		if(err){
			console.log("Error at the slug page");
		}
		else{

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