// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose'),
      URLSlugs = require('mongoose-url-slugs');

// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more lists
const Feedback = new mongoose.Schema({
    comment: String,
    user: String,
    rate: Number
});

const Wine = new mongoose.Schema({
    color: String,
    acid: String,
    image: String,
    type: String,
    feedback: [Feedback],
});

Wine.plugin(URLSlugs('color acid image type feedback'));

const Pref = new mongoose.Schema({
    flavors: [Wines], 
    favorites: [String],
    try: [String],
    dislike: [String]
    recommendMe: [String], //if there's time -- this seems hard to work in
    dontShowMe: [String] //if there's time -- this seems hard to work in
});

// define the data in our collection
const User = new mongoose.Schema({
  username: String,
  pd: String,
  lists: [Prefs];
});

User.plugin(URLSlugs('username pd lists'));

mongoose.model('Feedback', Feedback);
mongoose.model('Wine', Wine);
mongoose.model('Pref', Pref);
mongoose.model('User', User);

mongoose.connect('mongodb://localhost/finProj');