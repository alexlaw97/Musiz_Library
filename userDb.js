var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String
})

var user = mongoose.model('user', userSchema, 'login');
module.exports = user;
