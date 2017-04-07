// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose'),
      URLSlugs = require('mongoose-url-slugs');

// define the data in our collection
const User = new mongoose.Schema({
  username: {type: String, unique: true},
  fname: String,
  lname: String,
  password: String,
  type: [String],
  sweetness: [String]
});

User.plugin(URLSlugs('username fname lname'));

mongoose.model('User', User);

mongoose.connect('mongodb://localhost/finProj', () =>{
	 //mongoose.connection.db.dropDatabase();
});