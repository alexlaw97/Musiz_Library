var mongoose = require('mongoose');
// var db = "mongodb+srv://admin:admin123@api-6qso5.mongodb.net/CatAPI?retryWrites=true&w=majority";

// mongoose.connect(db).then(() => {
//     console.log('connected');
// })

var catSchema = new mongoose.Schema({
    name: String,
    origin: String,
    description: String,
    url: String
})

var cat = mongoose.model('cat', catSchema , 'cats');
module.exports = cat;
