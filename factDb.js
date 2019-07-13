var mongoose = require('mongoose');
// var db = "mongodb+srv://admin:admin123@api-6qso5.mongodb.net/CatAPI?retryWrites=true&w=majority";

// mongoose.connect(db).then(() => {
//     console.log('connected');
// })

var factSchema = new mongoose.Schema({
    fact: String,
    name: String,
    date: String
})

var fact = mongoose.model('fact', factSchema , 'facts');
module.exports = fact;
