var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LinkedInStrategy = require('passport-linkedin').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var StockTwitsStrategy = require('passport-stocktwits').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var OutlookStrategy = require('passport-outlook').Strategy;
var request1 = require("request");
var User = require('../app/models/user');
var configAuth = require('./auth');
var contactlist = [];

module.exports = function (passport) {


	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});


	passport.use('local-signup', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function (req, email, password, done) {
			process.nextTick(function () {
				User.findOne({
					'local.username': email
				}, function (err, user) {
					if (err)
						return done(err);
					if (user) {
						return done(null, false, req.flash('signupMessage', 'That email already taken'));
					} else {
						var newUser = new User();
						newUser.local.username = email;
						newUser.local.password = newUser.generateHash(password);

						newUser.save(function (err) {
							if (err)
								throw err;
							return done(null, newUser);
						})
					}
				})

			});
		}));

	passport.use('local-login', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function (req, email, password, done) {
			process.nextTick(function () {
				User.findOne({
					'local.username': email
				}, function (err, user) {
					if (err)
						return done(err);
					if (!user)
						return done(null, false, req.flash('loginMessage', 'No User found'));
					if (!user.validPassword(password)) {
						return done(null, false, req.flash('loginMessage', 'invalid password'));
					}
					return done(null, user);

				});
			});
		}
	));


	passport.use(new FacebookStrategy({
			clientID: configAuth.facebookAuth.clientID,
			clientSecret: configAuth.facebookAuth.clientSecret,
			callbackURL: configAuth.facebookAuth.callbackURL,
			profileFields: ['id', 'first_name', 'last_name', 'middle_name', 'displayName', 'emails', 'photos']

		},
		function (accessToken, refreshToken, profile, done) {
			console.log(profile);

			process.nextTick(function () {
				User.findOne({
					'facebook.id': profile.id
				}, function (err, user) {
					if (err)
						return done(err);
					if (user)
						return done(null, user);
					else {

						var newUser = new User();
						newUser.facebook.id = profile.id;
						newUser.facebook.token = accessToken;
						newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
						newUser.facebook.email = profile.emails[0].value;

						newUser.save(function (err) {
							if (err)
								throw err;
							return done(null, newUser);
						})

					}
				});
			});
		}

	));

	passport.use(new LinkedInStrategy({
			consumerKey: configAuth.linkedinAuth.clientID,
			consumerSecret: configAuth.linkedinAuth.clientSecret,
			callbackURL: configAuth.linkedinAuth.callbackURL,
			profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline']
		},
		function (token, tokenSecret, profile, done) {
			process.nextTick(function () {
				User.findOne({
					'linkedin.id': profile.id
				}, function (err, user) {
					if (err)
						return done(err);
					if (user)
						return done(null, user);
					else {
						var newUser = new User();
						newUser.linkedin.id = profile.id;
						newUser.linkedin.token = token;
						newUser.linkedin.name = profile.name.givenName + ' ' + profile.name.familyName;
						newUser.linkedin.email = profile.emails[0].value;

						newUser.save(function (err) {
							if (err)
								throw err;
							return done(null, newUser);
						})

					}
				});
			});

		}

	));

	passport.use(new TwitterStrategy({
			consumerKey: configAuth.twitterAuth.clientID,
			consumerSecret: configAuth.twitterAuth.clientSecret,
			userProfileURL: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
			callbackURL: configAuth.twitterAuth.callbackURL
		},
		function (token, tokenSecret, profile, done) {
			process.nextTick(function () {
				User.findOne({
					'twitterAuth.id': profile.id
				}, function (err, user) {
					if (err)
						return done(err);
					if (user)
						return done(null, user);
					else {
						var newUser = new User();
						newUser.twitter.id = profile.id;
						newUser.twitter.token = token;
						newUser.twitter.name = profile._json.name;
						newUser.twitter.email = profile.emails[0].value;

						newUser.save(function (err) {
							if (err)
								throw err;
							return done(null, newUser);
						})

					}
				});
			});

		}

	));

	passport.use(new StockTwitsStrategy({
		clientID: configAuth.stocktwitsAuth.clientID,
		clientSecret: configAuth.stocktwitsAuth.clientSecret,
		callbackURL: configAuth.stocktwitsAuth.callbackURL,
		scope: ['read', 'watch_lists', 'publish_messages', 'publish_watch_lists',
			'follow_users', 'follow_stocks'
		],
		passReqToCallback: true
	}, function (req, token, secret, profile, done) {
	
		process.nextTick(function () {
			User.findOne({
				'stocktwits.id': profile.id
			}, function (err, user) {
				if (err)
					return done(err);
				if (user)
					return done(null, user);
				else {
					var newUser = new User();
					newUser.stocktwits.id = profile.id;
					newUser.stocktwits.token = token;
					newUser.stocktwits.name = profile.name;
					newUser.stocktwits.email = profile.email;

					newUser.save(function (err) {
						if (err)
							throw err;
						return done(null, newUser);
					})

				}
			});
		});
	}));


	passport.use(new GoogleStrategy({
			clientID: configAuth.googleAuth.clientID,
			clientSecret: configAuth.googleAuth.clientSecret,
			callbackURL: configAuth.googleAuth.callbackURL,
			scope: ['email', 'profile', 'https://www.googleapis.com/auth/userinfo.profile',
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/plus.login',
				'https://www.google.com/m8/feeds/contacts/default/full'
			],
			passReqToCallback: true
		},
		async function (request, accessToken, refreshToken, profile, done) {


			var url = 'https://www.google.com/m8/feeds/contacts/default/full?max-results=999999&alt=json&oauth_token=' + accessToken;
			let res = await doRequest(url);
			console.log(res);
			User.findOne({
				'google.id': profile.id
			}, function (err, user) {
				if (err)
					return done(err);
				if (user)
					return done(null, user);
				else {
					var newUser = new User();
					newUser.google.id = profile.id;
					newUser.google.token = accessToken;
					newUser.google.name = profile.name.givenName + ' ' + profile.name.familyName;
					newUser.google.contacts = res;

					newUser.save(function (err) {
						if (err)
							throw err;
						return done(null, newUser);
					})
				}
			});

		}
	));


	// passport.use(new OutlookStrategy({
	// 	clientID: OUTLOOK_CLIENT_ID,
	// 	clientSecret: OUTLOOK_CLIENT_SECRET,
	// 	callbackURL: 'http://www.example.com/auth/outlook/callback'
	//   },
	//   function(accessToken, refreshToken, profile, done) {
	// 	var user = {
	// 	  outlookId: profile.id,
	// 	  name: profile.DisplayName,
	// 	  email: profile.EmailAddress,
	// 	  accessToken:  accessToken
	// 	};
	// 	if (refreshToken)
	// 	  user.refreshToken = refreshToken;
	// 	if (profile.MailboxGuid)
	// 	  user.mailboxGuid = profile.MailboxGuid;
	// 	if (profile.Alias)
	// 	  user.alias = profile.Alias;
	// 	User.findOrCreate(user, function (err, user) {
	// 	  return done(err, user);
	// 	});
	//   }
	// ));

};

function doRequest(url) {
	return new Promise(function (resolve, reject) {
		request1(url, function (error, res, body) {
			if (!error && res.statusCode == 200) {
				var contacts = JSON.parse(body);
				for (let i = 0; i < 10; i++) {
					if (contacts.feed.entry[i].hasOwnProperty("gd$email")) {
						contactlist.push(contacts.feed.entry[i].gd$email[0].address)
					}
				}
				resolve(contactlist);
			} else {
				reject(error);
			}
		});
	});
}