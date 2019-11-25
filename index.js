const express = require('express')
const session = require('express-session')
const axios = require('axios')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const app = express();
const apikey = '195003';
const db = "mongodb+srv://admin:abc0123@cluster0-k1y0a.mongodb.net/assignment?retryWrites=true&w=majority";
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


    // Load Index page
    app.get('/', loginSession, (req, res) => {
        res.render("pages/index",{
           ans : req.session.ans,
           name : req.session.name
        })
    });

    app.get('/top', loginSession, (req, res) => {
        res.render("pages/topmusic",{
            ans : req.session.ans,
            name : req.session.name
        });
    });

    app.get('/list', loginSession, (req, res) => {
        res.render("pages/list",{
            ans : req.session.ans,
            name : req.session.name
        });
    });

    //  Load error page
    app.get('/error', (req, res) => {
        res.render('pages/error');
    })

    // Load Login page
    app.get('/login', loginSession, (req, res) => {
        res.render("pages/login",{
            ans : req.session.ans
        });
        })

    // Redirect to home page
    app.get('/logout', (req, res) => {
        req.session.destroy();    // Destroy session before redirect
        console.log('session destroy');
        res.render("pages/index",{
            ans : "no"
        });
    });

    // Load register page
    app.get('/register', (req, res) => {
    res.render("pages/register");
    })

    //Sign Up Function
    app.post('/signup' , (req,res) => {
        var login = require('./userDb');
        lgn = new login({
            username: req.body.username,
            password: req.body.password,
            name:req.body.name
        }) 
        lgn.save().then((result) => {
            loginSession();
          })
    })
    
    // Sign In function
    app.post('/signin' , (req, res) => {
        var login = require('./userDb');
        login.find({
            username : req.body.username,
            password : req.body.password
        })
        .then((response) =>{
            req.session.name = response[0].name;
            req.session.user = response[0].username;
            res.render('pages/index', {
                name : req.session.name,
                ans : "yes"
            });
        })
        .catch((error) => {
            console.log('user not found');
            res.redirect('/login');
            return false;
        })  
    })

    // Checking Username
    app.post('/search_id' , (req, res) => {
        var username = req.body.user;
        var login = require('./userDb');
        login.find({
            username : username,
        })
        .then((response) =>{
            var user = response;
            res.send(user);
        })    
    })


    app.post('/search', (req,res) => {
        var artist = req.body.artist;
        var songs = [];
        var array = [];
        const querystr = `https://theaudiodb.com/api/v1/json/${apikey}/track-top10.php?s=${artist}`;
        axios.get(querystr).then((response) => {
        if(response['data'].track == null){
            res.redirect('/error');
            }
        else{
            const querykeys = Object.keys(response['data'].track);
            for(var x=0;x < querykeys.length; x++) {
                var song = response.data.track[x].strTrack;
                var artistname = response.data.track[x].strArtist;
                var genre = response.data.track[x].strGenre;
                var musicduration = response.data.track[x].intDuration;
                var desc = response.data.track[x].strDescriptionEN;
                var albumimg = response.data.track[x].strTrackThumb;
                var album = response.data.track[x].strAlbum;
                var link = response.data.track[x].strMusicVid;
                var totallisteners = response.data.track[x].intTotalListeners;
                var totalplays = response.data.track[x].intTotalPlays;  
                songs = [{
                    "songname" : song,
                    "duration" : musicduration,
                    "genre" : genre,
                    "name" : artistname,
                    "description" : desc,
                    "album" : album,
                    "albumimage" : albumimg,
                    "link" : link,
                    "views" : totallisteners,
                    "plays" : totalplays
                }]
                array.push(songs);
            }
                res.send(array);
            }   
            })
            .catch((error) => {
                console.log(error);
            })
        })

    app.get('/topmusic', (req,res) => {
        var array = [];
        var songs = [];
        const querystr = `https://theaudiodb.com/api/v1/json/1/mostloved.php?format=track&format=track`;
        axios.get(querystr).then((response) => {
        if(response['data'].loved == null){
            res.redirect('/error');
            }
        else{
            const querykeys = Object.keys(response['data'].loved);
            for(var x=0;x < querykeys.length; x++) {
                var song = response.data.loved[x].strTrack;
                var artistname = response.data.loved[x].strArtist;
                var genre = response.data.loved[x].strGenre;
                var musicduration = response.data.loved[x].intDuration;
                var desc = response.data.loved[x].strDescriptionEN;
                var albumimg = response.data.loved[x].strTrackThumb;
                var album = response.data.loved[x].strAlbum;
                var link = response.data.loved[x].strMusicVid;
                var totallisteners = response.data.loved[x].intTotalListeners;
                var totalplays = response.data.loved[x].intTotalPlays;  
                songs = [{
                    "songname" : song,
                    "duration" : musicduration,
                    "genre" : genre,
                    "name" : artistname,
                    "description" : desc,
                    "album" : album,
                    "albumimage" : albumimg,
                    "link" : link,
                    "views" : totallisteners,
                    "plays" : totalplays
                }]
                array.push(songs);
            }
                res.send(array);
            }   
            })
            .catch((error) => {
                console.log(error);
            })
        })
        
        
    app.post('/lyric', (req,res) => {
        var artist = req.body.artist;
        var song = req.body.song;
        var bank = [];
        const querystr2 = `https://api.lyrics.ovh/v1/${artist}/${song}`;
        axios.get(querystr2).then((response2) => {
            bank.push(response2.data.lyrics);
            res.send(bank);
            })
        .catch((error) => {
            console.log(error);
        })
    }); 

    //Insert into database
    app.post('/ins_url', (req,res) => {
        var inslist = require('./listDb')
        var name = req.body.names;
        var musics = req.body.musics;
        var index = req.body.id;
        var usernames = req.session.user;
        var bank = [];
        const querystr = `https://theaudiodb.com/api/v1/json/1/mostloved.php?format=track&format=track`;
        axios.get(querystr).then((response) => {
            data = response.data.loved[index];
            const querystr2 = `https://api.lyrics.ovh/v1/${name}/${musics}`;
            axios.get(querystr2).then((response2) => {
                bank.push(response2.data.lyrics);
                playlist = new inslist({
                    username: usernames,
                    song: data,
                    lyric:bank
                }) 
                playlist.save().then((result) => {
                    console.log("Successful");
                    res.send(bank);
                })
            })
        })
    }); 
    
    app.post('/ins_url2', (req,res) => {
        var inslist = require('./listDb')
        var artist = req.body.names;
        var index = req.body.id;
        var song = req.body.musics;
        var usernames = req.session.user;
        var bank = [];
        const querystr = `https://theaudiodb.com/api/v1/json/${apikey}/track-top10.php?s=${artist}`;
        axios.get(querystr).then((response) => {
                data = response.data.track[index];
                const querystr2 = `https://api.lyrics.ovh/v1/${artist}/${song}`;
                axios.get(querystr2).then((response2) => {
                    bank.push(response2.data.lyrics);
                    playlist = new inslist({
                        username: usernames,
                        song: data,
                        lyric:bank
                    }) 
                    playlist.save().then((result) => {
                        console.log("Successful");
                        res.send(bank);
                    })
                })
            })
            .catch((error) => {
                console.log(error);
            })
        })
    
    app.get('/playlist', (req,res) => {
        var array = [];
        var songs = [];
        var plylist = require('./listDb');
        plylist.find({
            username : req.session.user
        })
        .then((response) => {
            for(var x=0;x < response.length; x++) {
                var songid = response[x]._id;
                var song = response[x].song.strTrack;
                var artistname = response[x].song.strArtist;
                var genre = response[x].song.strGenre;
                var musicduration = response[x].song.intDuration;
                var desc = response[x].song.strDescriptionEN;
                var albumimg = response[x].song.strTrackThumb;
                var album = response[x].song.strAlbum;
                var link = response[x].song.strMusicVid;
                var totallisteners = response[x].song.intTotalListeners;
                var totalplays = response[x].song.intTotalPlays;  
                songs = [{
                    "id" : songid,
                    "songname" : song,
                    "duration" : musicduration,
                    "genre" : genre,
                    "name" : artistname,
                    "description" : desc,
                    "album" : album,
                    "albumimage" : albumimg,
                    "link" : link,
                    "views" : totallisteners,
                    "plays" : totalplays
                }]
                array.push(songs);
            }
                res.send(array);
        })
           
    })

    app.get('/song_lyric', (req,res) => {
        var bank = [];
        var plylist = require('./listDb');
        plylist.find({
            username : req.session.user
        })
        .then((response) => {
            for(var x=0;x < response.length; x++) {
                var lyric = response[x].lyric;
                bank.push(lyric);
            }
            res.send(bank);
        });
    })

    app.post('/delete_playlist', (req,res) => {
        var id = req.body.id;
        var list = require('./listDb')
        list.deleteOne({ 
            "_id": id
        })
        .then(response => {
            console.log("Delete Successful");
            res.send(response);
        })
        .catch(error => {
            console.log(error);
            res.redirect(req.get('referer'));
        });
    })

    // Connect to port 5000 unless heroku define
    app.listen(PORT, () =>{
        console.log(`Listening on ${ PORT }`)
    });

    // Function for checking session
    function loginSession(req, res, next) {
        var sessionName = req.session.name;
        var sessionuser = req.session.user;
        if(!sessionName){
            // res.redirect('/');  // Redirect back to login
            // console.log('session invalid');
            req.session.ans = "no";
            next();
        }
        else {
            // console.log('session valid'); 
            req.session.ans = "yes";
            next();
        }
    };