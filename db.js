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


// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 var fs = require('fs');
 var path = require('path');
 var fn = path.join(__dirname, 'config.json');
 var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 var conf = JSON.parse(data);
 var dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/kat392';
}

mongoose.connect(dbconf, () =>{
	 //mongoose.connection.db.dropDatabase();
});