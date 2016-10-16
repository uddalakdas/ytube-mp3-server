'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({
  url: String,
  metadata: {
  	id : String,
  	title : String,
  	publicUrl: String,
  	thumbnailUrl: String,
  	description: String,
  	duration: String
  },
  active: Boolean,
  status: String,
  fileId: String
});

module.exports = mongoose.model('Song', SongSchema);

