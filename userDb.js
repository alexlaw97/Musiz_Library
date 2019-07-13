var mongoose = require('mongoose');
// var db = "mongodb+srv://admin:admin123@api-6qso5.mongodb.net/CatAPI?retryWrites=true&w=majority";

// mongoose.connect(db).then(() => {
//     console.log('connected');
// })

var userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    status: String 
})

var user = mongoose.model('user', userSchema, 'users');
module.exports = user;
