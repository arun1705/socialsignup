var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LinkedInStrategy = require('passport-linkedin').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var StockTwitsStrategy = require('passport-stocktwits').Strategy;

var User = require('../app/models/user');
var configAuth = require('./auth');

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
			callbackURL: configAuth.facebookAuth.callbackURL
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
			callbackURL: configAuth.linkedinAuth.callbackURL
		},
		function (token, tokenSecret, profile, done) {
			// process.nextTick(function () {
			// 	User.findOne({
			// 		'linkedinAuth.id': profile.id
			// 	}, function (err, user) {
			// 		if (err)
			// 			return done(err);
			// 		if (user)
			// 			return done(null, user);
			// 		else {
			// 			var newUser = new User();
			// 			newUser.linkedinAuth.id = profile.id;
			// 			newUser.linkedinAuth.token = token;
			// 			newUser.linkedinAuth.name = profile.name.givenName + ' ' + profile.name.familyName;
			// 			newUser.linkedinAuth.email = profile.emails[0].value;

			// 			newUser.save(function (err) {
			// 				if (err)
			// 					throw err;
			// 				return done(null, newUser);
			// 			})
			// 			console.log(profile);
			// 		}
			// 	});
			// });
			
				console.log(token);
				console.log(profile);
				done();
			
		}

	));

	passport.use(new TwitterStrategy({
			consumerKey: configAuth.twitterAuth.clientID,
			consumerSecret: configAuth.twitterAuth.clientSecret,
			callbackURL: configAuth.twitterAuth.callbackURL
		},
		function (token, tokenSecret, profile, done) {
			// process.nextTick(function () {
			// 	User.findOne({
			// 		'twitterAuth.id': profile.id
			// 	}, function (err, user) {
			// 		if (err)
			// 			return done(err);
			// 		if (user)
			// 			return done(null, user);
			// 		else {
			// 			var newUser = new User();
			// 			newUser.twitterAuth.id = profile.id;
			// 			newUser.twitterAuth.token = token;
			// 			newUser.twitterAuth.name = profile.name.givenName + ' ' + profile.name.familyName;
			// 			newUser.twitterAuth.email = profile.emails[0].value;

			// 			newUser.save(function (err) {
			// 				if (err)
			// 					throw err;
			// 				return done(null, newUser);
			// 			})
			// 			console.log(profile);
			// 		}
			// 	});
			// });
			console.log(token);
			console.log(profile);
			done();
		}

	));

	passport.use(new StockTwitsStrategy({
        clientID: '099553b84befb363',
        clientSecret: '35a9b072e43b93bf1858ff65dd0dbbe9546043d8',
        callbackURL: 'http://localhost:8080/connect/stocktwits/callback',
        passReqToCallback: true
    }, function (req, token, secret, profile, done) {
        console.log(token);
        console.log(profile);
        done();
    }
));


};