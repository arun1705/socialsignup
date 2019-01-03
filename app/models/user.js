var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	linkedin: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	twitter: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	stocktwits: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	google:{
		id:String,
		email:String,
		name:String,
		contacts:[{type:String}]
	}

});

module.exports = mongoose.model('User', userSchema);