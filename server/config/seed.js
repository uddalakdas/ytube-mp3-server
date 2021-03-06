/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// Insert seed models below
var Song = require('../api/song/song.model');
var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');

// Insert seed data below
var songSeed = require('../api/song/song.seed.json');
var thingSeed = require('../api/thing/thing.seed.json');
var userSeed = require('../api/user/user.seed.json');

// Insert seed inserts below
Song.find({}).remove(function() {
	Song.create(songSeed);
});

Thing.find({}).remove(function() {
  Thing.create(thingSeed);
});

User.find({}).remove(function() {
	User.create(userSeed);
})