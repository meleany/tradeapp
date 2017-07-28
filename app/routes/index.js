'use strict';

var path = process.cwd();
var ClickHandler = require(path + "/app/controllers/clickHandler.server.js");

module.exports = function (app, passport, bookSearch) {
  
  var clickHandler = new ClickHandler();
  
  function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/");
    }
  }
  
  app.route("/")
    .get(function(req, res){
      res.sendFile(path + "/public/main.html");
    });

  app.route("/profile")
    .get(function (req, res) {
      res.sendFile(path + "/public/profile.html");
    });
  
  app.route("/logout")
    .get(function (req, res) {
      req.logout();
      res.redirect("/");
    });
  
  app.route("/auth/github")
    .get(passport.authenticate("github"));
  
  app.route("/auth/github/callback")
    .get(passport.authenticate("github", {
      successRedirect: "/profile",
      failureRedirect: "/"
    }));
  
  app.route("/api/login")
	  .get(function (req, res) {
      if(req.isAuthenticated()) {
        res.send({logged: true, userid: req.user.github});        
      } else {
        res.send({logged: false});     
      }
	  });
  
  app.route("/api/profile")
    .post(clickHandler.updateUser);
  
  app.route("/api/:user")
    .get(clickHandler.getProfile);
  
  app.route("/list/book")
    .get(clickHandler.getBooks)
    .post(clickHandler.saveRequest);
  
  app.route("/api/:user/:trade")
    .get(clickHandler.getTrades)
    .delete(clickHandler.removeBook);
  
  app.route("/book/:title")
    .get(function (req, res) {
      bookSearch.search(req.params.title, {field: "title", type: "books", order: "relevance", limit: 3}, function (err, results) {
        if(!err) {
          res.send({results: results[0]});
        }else {
          res.send({results: null});
        }
      });
    })
    .post(clickHandler.bookDetails);
  
};