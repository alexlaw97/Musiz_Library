var mongoose = require('mongoose');

var listSchema = new mongoose.Schema({
    username: String,
    song: Object,
    lyric: []
})

var list = mongoose.model('list', listSchema, 'playlist');
module.exports = list;
