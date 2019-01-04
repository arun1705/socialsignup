var User = require('./models/user');
module.exports = function (app, passport) {
	app.get('/', function (req, res) {
		res.render('index.ejs');
	});

	app.get('/login', function (req, res) {
		res.render('login.ejs', {
			message: req.flash('loginMessage')
		});
	});
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/signup', function (req, res) {
		res.render('signup.ejs', {
			message: req.flash('signupMessage')
		});
	});


	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.get('/profile', isLoggedIn, function (req, res) {
		res.render('profile.ejs', {
			user: req.user
		});
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {

	}));

	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect: '/profile',
			failureRedirect: '/'
		}));

	app.get('/auth/linkedin',
		passport.authenticate('linkedin'));

	app.get('/auth/linkedin/callback',
		passport.authenticate('linkedin', {
			successRedirect: '/profile',
			failureRedirect: '/'
		}));

	app.get('/auth/twitter',
		passport.authenticate('twitter'));

	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect: '/profile',
			failureRedirect: '/'
		}));
	app.get('/auth/stocktwits', passport.authorize('stocktwits'));

	app.get('/auth/stocktwits/callback', passport.authorize('stocktwits', {
		failureRedirect: '/',
		successRedirect: '/profile'
	}));


	app.get('/auth/google',
		passport.authenticate('google'));

	app.get('/auth/google/callback',
		passport.authenticate('google', {
			successRedirect: '/profile',
			failureRedirect: '/'
		}));

	app.get('/auth/outlook',
		passport.authenticate('windowslive', {
			scope: [
				'openid',
				'profile',
				'offline_access',
				'https://outlook.office.com/Mail.Read'
			]
		})
	);

	app.get('/auth/outlook/callback',
		passport.authenticate('windowslive', {
			failureRedirect: '/login'
		}),
		function (req, res) {
			// Successful authentication, redirect home.
			res.redirect('/');
		});

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	})
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/login');
}