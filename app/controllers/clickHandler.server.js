'use strict';

var User = require("../models/users.js");
var Book = require("../models/books.js");

function clickHandler () {
  
  this.updateUser = function (req, res) {
    if(req) {
      req = req.body;
      User
        .findOneAndUpdate({"github.username": req.user}, {"profile.fullname": req.name, "profile.city": req.city, "profile.state": req.state,
                                                          "profile.email": req.email}, {upsert: true, returnNewDocument: true})
        .exec(function (err, res) {
          if (err) { throw err; }
        });
    }
  };
  
  this.getProfile = function (req, res) {
    User
      .findOne({"github.username":req.params.user})
      .exec(function (err, profile) {
        if(err) { throw err; }
        if(profile) {
          res.send(profile)
        } else {
          res.send({profile: null});
        }
      });
  };
  
  this.saveRequest = function (req, res) {
    if(req){
      req = req.body;
      Book
        .findOneAndUpdate({user:req.user, title: req.title}, {requester: req.requester, borrower: req.borrower, available: req.available}, 
                          {upsert: true, returnNewDocument: true})
        .exec(function (err, info) {
          if (err) { throw err; }
          res.send({saved: true});
        });
    }
  };
  
  this.getTrades = function (req, res) {
    var myTradeList;
    myTradeList = req.params.trade;
    if(myTradeList == "true"){ // My Requests
      Book
        .find({$or:[{borrower: req.params.user},{requester: req.params.user}]}, {user:1, title:1, borrower: 1, requester: 1}) 
        .exec(function (err, data) {
          if (err) { throw err; }
          if(data) {
            res.send({data: data});
          }else {
            res.send({data: null});
          }
        });
    }else{  // Other Users Requests
      Book
        .find({$and: [{user: req.params.user}, {$or: [{requester: {$ne: ""} }, {borrower: {$ne: ""} }]}]}, {user:1, title:1, borrower: 1, requester: 1})
        .exec(function (err, data) {
          if (err) { throw err; } 
          if (data) {
            res.send({data: data});
          } else {
            res.send({data: null});
          }
        });
    }
  };
  
  this.bookDetails = function (req, res) {
    if(req){
      req = req.body;
      Book
        .findOneAndUpdate({user: req.user, title: req.title}, {user: req.user, title: req.title, author: req.author, available: req.available,
                                                              borrower: req.borrower, requester: req.requester, img: req.img}, 
                          {upsert: true, returnNewDocument: true})
        .exec(function (err, data) {
          if (err) { throw err; }
          res.send({message: "New book added"});
        })
    }
  }
  
  this.getBooks = function (req, res) {
    Book
      .find({}, {user:1, title:1, img:1, borrower:1, requester: 1, available: 1})
      .exec(function (err, list) {
        if (err) { throw err; }
        if(list) {
          res.send({list: list});  
        }else {
          res.send({list: null});
        }
      });
  };
  
  this.removeBook = function (req, res) {
    Book
      .find({user: req.params.user, title: req.params.trade})
      .remove().exec(function (err, data) {
        if(err) { throw err; }
        res.json({message: "The book has been deleted from database"});
      });
  };
  
}

module.exports = clickHandler;