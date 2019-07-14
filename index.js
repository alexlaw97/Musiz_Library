const express = require('express')
const session = require('express-session')
const axios = require('axios')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const app = express();
const db = "mongodb+srv://admin:admin123@api-6qso5.mongodb.net/CatAPI?retryWrites=true&w=majority"
const PORT = process.env.PORT || 5000

// Mongodb connection
mongoose.connect(db).then(() => { 
  console.log('connected');
})

app.use(session({secret: 'ssshhhhh', saveUninitialized: true, resave: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Load login page
app.get('/', (req, res) => {
  res.render("pages/login");
});

// Load register page
app.get('/register', (req, res) => {
  res.render("pages/register");
})

// Load list page 
app.get('/list', loginSession, (req, res) => {
    var status = req.session.status;
    console.log(req.session.name);
    if(status == "admin"){
        // Admin page
        console.log('aaa');
        var cat = require('./catDb');
        cat.find({}).then((response) => {
            // console.log(response);
            res.render("pages/list", {
                catList : response,
                status : status
            });
            return;
        })
    }
    else if(status == "user"){
        // User page
        console.log('uuu');
        var cat = require('./catDb');
        cat.find({}).then((response) => {
            // console.log(response);
            res.render("pages/list", {
                catList : response,
                status : status
            });
            return;
        })
    }
    else{
        console.log('uuu');
        var cat = require('./catDb');
        cat.find({}).then((response) => {
            // console.log(response);
            res.render("pages/list", {
                catList : response,
                status : status
            });
            return;
        })
    }
})

// Load facts
app.get('/fact', loginSession, (req, res) => {
  var status = req.session.status;
  if(status == "admin"){
      console.log('aaaa');
      var facts = require('./factDb');
      facts.find({}).then((response) => {
          res.render("pages/fact", {
              catFact : response,
              status : status
          });
      })
  }
  else if(status == "user"){
      console.log('uuuu');
      var facts = require('./factDb');
      facts.find({}).then((response) => {
          // console.log(date);
          res.render("pages/fact", {
              catFact : response,
              status : status
          });
      })
  }
})

// Load register page
app.get('/register', loginSession, (req, res) => {
    res.render("pages/register");
})

// Load add new cat page
app.get('/newCat', (req, res) => {
    var status = req.session.status;
    console.log('ncc');
    var cat = require('./catDb');
    cat.find({}).then((response) => {
        // console.log(response);
        res.render("pages/newCat", {
            catList : response,
            status : status
        });
        return;
    })
})

// Load add new fact page
app.get('/newFact', loginSession, (req, res) => {
    var sessionStatus = req.session.status;
    var sessionName = req.session.name;
    console.log('nff');
    var fact = require('./factDb');
    fact.find({
        "name":sessionName
    })
    .then((response) => {
        // console.log(response);
        res.render("pages/newFact", {
            catFact : response,
            status: sessionStatus
        });
        return;
    })
})

//  Load error page
app.get('/error', (req, res) => {
    res.render('pages/error');
})

// Redirect to home page
app.get('/logout', (req, res) => {
    req.session.destroy();    // Destroy session before redirect
    console.log('session destroy');
    res.redirect("/");
});

// Saved into MongoDB User
app.post('/registration', (req, res) => {
    var insUser = require('./userDb');
    console.log(req.body.name);
    console.log(req.body.username);
    console.log(req.body.password);
    user = new insUser({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        status: "user"
    })
    // if(!user.username || !user.name || !user.password){
    //     res.send('Empty field detected');
    //     return;
    // }
    user.save().then((result) => {
        console.log(result);
        res.redirect('/');
    });
    // res.redirect("/");
})

// Login using MongoDB User
app.post('/login', (req, res) => {
    var user = require('./userDb');
    var username = req.body.username;
    var password = req.body.password;
    user.find({
        "username": username,
        "password": password
    })
    .then((response) => {
        console.log(response[0].status);
        if(response[0].status == "admin"){
            req.session.name = response[0].name;
            req.session.status = response[0].status;
            res.redirect('/list');
        }
        else if(response[0].status == "user"){
            req.session.name = response[0].name;
            req.session.status = response[0].status;
            res.redirect('/list');
        }
        console.log(req.session.name)
    })
    .catch((error) => {
        console.log('user not found');
        res.redirect('/');
        return false;
    })
})

// Randomly get a fact
app.get('/random/fact', (req, res) => {
    var fact = require('./factDb');
    var query = "https://catfact.ninja/fact";
    axios.get(query).then((response) => {
        console.log(response.data);
        fact.findOne({
            "fact": response.data.fact
        })
        .then((response2) => {
            console.log(response2);
            if(response2 != null){
                console.log('exist');
                res.redirect('/random/fact');
            }
            else if(response2 == null){
                var date = new Date();
                var dateNow = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
                console.log('not exist');
                rFact = new fact({
                    name: "anonymous",
                    fact: response.data.fact,
                    date: dateNow
                })
                rFact.save().then((result) => {
                    console.log(result);
                    res.redirect(req.get('referer'));
                })
                .catch((error) => {
                    console.log(error);
                    res.redirect(req.get('referer'));
                })
            }
        })
        .catch((error) => {
            console.log(error);
        })
    })
})

// Get cat api using input
app.post("/findCat", (req, res) => {
    var nCat = require('./catDb');
    // Check database for same name
    var catName = req.body.catName;
    // Check if input is empty
    if(catName == ""){
        console.log('empty input');
        res.redirect('/newCat');
        return;
    }
    // Check name to get ID
    var query = "https://api.thecatapi.com/v1/breeds/search?q="+catName;
    axios.get(query).then((response) => {
        console.log(response.data);
        if(response.data[0] == null){
            console.log('There is no species like this');
            res.redirect('/error');
            return;
        }
        var name = response.data[0].name;
        var id = response.data[0].id;
        nCat.findOne({
            "name":name
        })
        .then((response2) => {   // Get cat exist
            // console.log(response2)
            // If exist
            if(response2 != null){  // Exist return
                // Return 
                console.log('exist'+response2.name);
                res.redirect('/newCat');
                return false;
            }
            // If not exist
            else if(response2 == null){ // Not exist add
                console.log('new');
                // Insert
                var query3 = "https://api.thecatapi.com/v1/images/search?breed_id="+id; //  Get cat image url
                axios.get(query3).then((response3) => {
                    console.log(response3.data[0].url);
                    cat = new nCat({
                        name: response.data[0].name,
                        origin: response.data[0].origin,
                        description: response.data[0].description,
                        url: response3.data[0].url
                    })
                    cat.save().then((result) => {   //  Save into mongodb
                        console.log(result);
                    })
                    res.redirect('/newCat');
                })
                .catch((error) => {     //  Show error
                    console.log(error);
                })
                return false;
            }
        })
        .catch((error) => {
            console.log(error)
        })
    })
});

// Insert fact into mongodb using input
app.post('/insertFact', (req, res) => {
    var name = req.session.name;        //  Get session name
    var userFact = req.body.userFact;   //  Get user input
    var date = new Date();              //  Get date now
    var dateNow = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();   // Get Date with format (YYYY-MM-DD)
    var nFact = require('./factDb');    //  Get Fact DB
    console.log(dateNow);
    fact = new nFact({
        fact : userFact,
        name : name,
        date : dateNow
    })
    fact.save().then((result) => {      //  Save into mongodb
        console.log(result);
        res.redirect('/newFact');
    })
    .catch((error) => {
        console.log(error);
    })
    });

    // Delete cat from mongodb
    app.post('/cat/delete', (req, res) => {
    console.log('delete cat');
    console.log(req.body.catID);
    var cat = require('./catDb');
    cat.deleteOne({ 
        "_id": req.body.catID
    })
    .then(response => {
        console.log('delete success. ID: '+req.body.catID);
        res.redirect(req.get('referer'));
    })
    .catch(error => {
        console.log(error);
        res.redirect(req.get('referer'));
    });
});

// Delete fact from mongodb
app.post('/fact/delete', (req, res) => {
    console.log('delete fact');
    console.log(req.body.factID);
    var fact = require('./factDb');
    fact.deleteOne({ 
        "_id": req.body.factID
    })
    .then(response => {
        console.log('delete success. ID: '+req.body.factID);
        res.redirect(req.get('referer'));
    })
    .catch(error => {
        console.log(error);
        res.redirect(req.get('referer'));
    });
});

// Connect to port 5000 unless heroku define
app.listen(PORT, () =>{
    console.log(`Listening on ${ PORT }`)
});

// Function for checking session
function loginSession(req, res, next) {
    var sessionName = req.session.name;
    if(!sessionName){
        res.redirect('/');  // Redirect back to login
        console.log('session invalid');
    }
    else {
        console.log('session valid');
        next(); // Continue to next step
    }
};