var ASQ = require("asynquence");

module.exports = function usersRouter(app, dataAdapter) {
	var querystring = require("querystring");
	var crypto = require("crypto");

	app.post("/registration", registrationHandler);
	app.post("/login", loginHandler);

	function registrationHandler(req, res) {
		var user = {
			username: req.param("username", null),
			email: req.param("email", null),
			password: req.param("password", null),
			location: req.rendrApp.get("baseData").siteLocation,
			languageId: 10
		}

		ASQ(function callValidateUserCallback(done) {
			validateUser(done, user);
		})
		.then(registerUser)
		.then(function saveDataRegistrationCallback (done, user) {
			saveData(req, res, user, done);
		})
		.then(function redirectRegistrationHomeCallback (done) {
			res.redirect("/");
		})
		.or(function errorRegistrationCallback(err){
	        console.log("Failure: " + err);
	        res.redirect("/registration?" + querystring.stringify(err));
	    });

		function validateUser(done, user) {
			var errors = {
				errCode: 400,
				err: [],
				errFields: []
			}
			if (!user.username) {
				errors.err.push("Invalid username");
				errors.errFields.push("username");
			}
			if (!user.email) {
				errors.err.push("Invalid email");
				errors.errFields.push("email");
			}
			if (!user.password) {
				errors.err.push("Invalid password");
				errors.errFields.push("password");
			}
			if (errors.err.length) {
				done.fail(errors);
				return;
			}
			done(user);
		}

		function registerUser(done, user) {
			var api = {
				method: "POST",
				body: user,
				url: "/users"
			}

			makeRequest(req, api, done, function requestDone (body) {
				done(body);
			});
		}

	}

	function loginHandler(req, res) {

		var usernameOrEmail = req.param("usernameOrEmail", null);
		var password = req.param("password", null);

		ASQ(function callGetChallengeCallback(done) {
			getChallenge(done, usernameOrEmail);
		})
		.then(loginUser)
		.then(function saveDataLoginCallback (done, user) {
			saveData(req, res, user, done);
		})
		.then(function redirectLoginHomeCallback (done) {
			res.redirect("/");
		})
		.or(function errorLoginCallback(err){
	        console.log("Failure: " + err);
	        res.redirect("/login?" + querystring.stringify(err));
	    });

		function getChallenge (done, usernameOrEmail) {
			var api = {
				body: {},
				url: "/users/challenge?u=" + usernameOrEmail
			}

			makeRequest(req, api, done, function challengeRequestDone (body) {
				var hash = crypto.createHash("md5").update(password).digest("hex");
				hash += usernameOrEmail;
				hash = crypto.createHash("sha512").update(hash).digest("hex");

				var credentials = {
					c: body.challenge,
					h: hash
				}

				done(credentials);
			});
		}

		function loginUser (done, credentials) {
			var api = {
				body: {},
				url: "/users/login?" + querystring.stringify(credentials)
			}

			makeRequest(req, api, done, function loginRequestDone (body) {
				done(body);
			});
		}

	}

	function makeRequest (req, api, done, requestDone) {
		dataAdapter.request(req, api, function adapterRequestDone(err, response, body) {
			if (err) {
				var error = {
					errCode: err.status,
					err: []
				}
				body.forEach(function processError(err) {
					error.err.push(err.message);
				});

				done.fail(error);
				return;
			}

			requestDone(body);
		});
	}

	function saveData(req, res, user, done) {
		app.set('user', user);
	    req.updateSession('user', user);

		done();
	}

};