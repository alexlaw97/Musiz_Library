var axios = require('axios');
var bodyParser = require('body-parser');
var ins = require('./catDb');
var ins2 = require('./factDb');
var mongoose = require('mongoose');
var query = "https://api.thecatapi.com/v1/images/search?breed_id=beng";
var query2 = "https://catfact.ninja/facts?limit=20";    // Get fact list
var query2 = "https://https://catfact.ninja/fact";      // Get random fact
var db = "mongodb+srv://admin:admin123@api-6qso5.mongodb.net/CatAPI?retryWrites=true&w=majority";

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect(db).then(() => {
    console.log('connected');
})

axios.get(query).then((response) => {
    console.log(response.data[0]);
    cat = new ins({
        name: response.data[0].breeds[0].name,
        origin: response.data[0].breeds[0].origin,
        description: response.data[0].breeds[0].description,
        url: response.data[0].url
    });
    // console.log(response.data[0].url)
    // cat.save().then((result) => {
    //     console.log(result);
    // });
}).catch((error) => {
    console.log(error);
})

// axios.get(query2).then((response2) => {
//     for(var i = 0; i < response2.data.data.length; i++){
//         console.log(response2.data.data[i].fact);
//         var fact = response2.data.data[i].fact;
//         facts = new ins2({
//             fact: fact,
//             name: "anonymous"
//         });
//         facts.save().then((result) => {
//             console.log(result);
//         })
//         .catch((error) => {
//             console.log(error);
//         })
//     }
// })
