// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');

// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more lists
const Feedback = new mongoose.Schema({
    comment: String,
    user: String,
    rate: Number
});

const Wines = new mongoose.Schema({
    color: String,
    acid: String,
    image: String,
    type: String,
    feedback: [Feedback]
});

const Prefs = new mongoose.Schema({
    flavors: [Wines], 
    favorites: [String],
    try: [String],
    dislike: [String]
    recommendMe: [String], //if there's time -- this seems hard to work in
    dontShowMe: [String] //if there's time -- this seems hard to work in
});

// define the data in our collection
const Comment = new mongoose.Schema({
  username: String,
  pd: String,
    lists: [Prefs];
});

// TODO: add remainder of setup for slugs, connection, registering models, etc. below


