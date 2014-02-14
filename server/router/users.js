module.exports = function usersRouter(app, dataAdapter) {
	var querystring = require("querystring");
	var crypto = require("crypto");

	app.post("/registration", function(req, res) {
		var user = {
			username: req.param("username", null),
			email: req.param("email", null),
			password: req.param("password", null),
			location: req.rendrApp.get("baseData").siteLocation,
			languageId: 10
		}

		validateUser(user, function(err, user) {
		    if (err) {
		    	return res.redirect("/registration?" + querystring.stringify(err));
		    }

			var api = {
				method: "POST",
				body: user,
				url: "/users"
			}

			dataAdapter.request(req, api, function(err, response, body) {
				if (err) {
					var error = {
						errCode: err.status,
						err: []
					}
					body.forEach(function(err) {
						error.err.push(err.message);
					});
		    		return res.redirect("/registration?" + querystring.stringify(error));
				}

			    app.set('user', body);
			    req.updateSession('user', body);

				res.redirect("/");
			});
		});
	});

	function validateUser(user, callback) {
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
			return callback(errors, user);
		}
		callback(null, user);
	}

	app.post("/login", function(req, res) {

		var usernameOrEmail = req.param("usernameOrEmail", null);
		var password = req.param("password", null);

		var api = {
			body: {},
			url: "/users/challenge?u=" + usernameOrEmail
		}

		dataAdapter.request(req, api, function(err, response, body) {
			if (err) {
				var error = {
					errCode: err.status,
					err: []
				}
				body.forEach(function(err) {
					error.err.push(err.message);
				});
	    		return res.redirect("/login?" + querystring.stringify(error));
			}

			var hash = crypto.createHash("md5").update(password).digest("hex");
			hash += usernameOrEmail;
			hash = crypto.createHash("sha512").update(hash).digest("hex");

			var credentials = {
				c: body.challenge,
				h: hash
			}

			var api = {
				body: {},
				url: "/users/login?" + querystring.stringify(credentials)
			}

			dataAdapter.request(req, api, function(err, response, body) {
				if (err) {
					var error = {
						errCode: err.status,
						err: []
					}
					body.forEach(function(err) {
						error.err.push(err.message);
					});
		    		return res.redirect("/login?" + querystring.stringify(error));
				}

			    app.set('user', body);
			    req.updateSession('user', body);

				res.redirect("/");
			});
		});
	});

};