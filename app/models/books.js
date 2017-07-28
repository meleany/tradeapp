'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Book = new Schema ({
  user: String,
  title: String,
  author: String,
  img: String,
  borrower: String,
  requester: String,
  available: Boolean
});

module.exports = mongoose.model("Book", Book);