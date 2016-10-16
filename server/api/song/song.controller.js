'use strict';

var ytdl = require('youtube-dl');
var _ = require('lodash');
var Song = require('./song.model');
var mongoose = require('mongoose');
var conn = mongoose.connection; 
var fs = require('fs-extra'); 
var Grid = require('gridfs-stream');
var path = require('path');

Grid.mongo = mongoose.mongo;
// Get list of songs
exports.index = function(req, res) {
  Song.find(function (err, songs) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(songs);
  });
};

// Get a single song
exports.show = function(req, res) {
  Song.findById(req.params.id, function (err, song) {
    if(err) { return handleError(res, err); }
    if(!song) { return res.status(404).send('Not Found'); }
    return res.json(song);
  });
};

// Creates a new song in the DB.
exports.create = function(req, res) {
 



  ytdl.getInfo(req.body["url"], function(err, info) {

    if(err) { return handleError(res, err); }
    console.log(info);
    var newSong = {};
    newSong.url = req.body["url"];
    newSong.metadata = {};
    newSong.metadata.id = info.id;
    newSong.metadata.title = info.title;
    newSong.metadata.publicUrl = info.url;
    newSong.metadata.thumbnailUrl = info.thumbnail;
    newSong.metadata.description = info.description;
    newSong.metadata.duration = info.duration;
    newSong.status = "Not Processed";
    Song.create(newSong, function(err, song) {
      if(err) { return handleError(res, err); }
      return res.status(201).json(song);
    });
    ytdl.exec(newSong.url, ['-x', '--audio-format', 'mp3', '-o',path.join(__dirname,newSong.metadata.id)+'/%(title)s.%(ext)s'], {}, function exec(err, output) {
      if (err) { throw err; }
      var gfs = Grid(conn.db);
      var writestream = gfs.createWriteStream({
        filename: newSong.metadata.title + '.mp3'
      });
      fs.createReadStream(path.join(__dirname,newSong.metadata.id,newSong.metadata.title+'.mp3')).pipe(writestream);
      writestream.on('close', function (file) {
        console.log(file);
        Song.findOne({"metadata.id":newSong.metadata.id},function(err,song) {
          song.fileId = file._id;
          song.status = "Processed"
          song.save(function(err) {
            if (err) { throw err; }
          });  
        }); 
      });
    });
  });
};

// Updates an existing song in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Song.findById(req.params.id, function (err, song) {
    if (err) { return handleError(res, err); }
    if(!song) { return res.status(404).send('Not Found'); }
    var updated = _.merge(song, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(song);
    });
  });
};

// Deletes a song from the DB.
exports.destroy = function(req, res) {
  Song.findById(req.params.id, function (err, song) {
    if(err) { return handleError(res, err); }
    if(!song) { return res.status(404).send('Not Found'); }
    song.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}