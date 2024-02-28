// Import the required packages
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-google-oauth2').Strategy;
const userdb = require('./model/userSchema');
// Import the database connection
require('./db/conn');
// Set the port
const PORT = 6005; 

const clientid = "666709815815-ccump8minvva9p74po424atfukh5kv83.apps.googleusercontent.com"
const clientsecret = "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"

// Set the middleware to accept the request from the client at the specified origin using the specified methods
app.use(cors({
    origin: 'http://localhost:3000',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));

app.use(express.json());

// setup session
app.use(session({
    secret:"pqpeoirnfp20139487hgn:S:ji-02385",
    resave: false,
    saveUninitialized: true,
}));

//setup passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new OAuth2Strategy({
        clientID: clientid,
        clientSecret: clientsecret,
        callbackURL: "/auth/google/callback",
        scope: ["email", "profile"]
    }, 
    async (accessToken, refreshToken, profile, done) => {
        console.log("profile", profile);
        try {
            let user = await userdb.findOne({googleId: profile.id});
            
            if(!user) {
                user  = new userdb({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.email[0].value,
                    image:profile.photos[0].value
                })

                await user.save();
            } 

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
    )
)

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);
})

// inital google auth login
app.get("/auth/google", passport.authenticate("google", {scope: ["email", "profile"]}));

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: "http://localhost:3000/dashboard",
    failureRedirect: "http://localhost:3000/login"
}));


app.get("/login/sucess", (req, res) => {

    if(req.user) {
        res.status(200).json({message: "User Login", user:req.user});
    } else {
        res.status(401).json({message: "Not Authenticated"});
    }

})

app.get("/logout", (req, res, next) => {
    req.logout(function(err){
        if(err) {return next(err)}
        res.redirect("http://localhost:3000/login"); 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});