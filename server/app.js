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
    credentials: true // Allows user credential cookies to be sent to the server and used in combination with the user session.
}));

app.use(express.json()); // parse the incoming json data automatically

// setup session
app.use(session({
    secret:"pqpeoirnfp20139487hgn:S:ji-02385", // used to sign the session ID cookie. A production application would need a more secure secret than this example.
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request.
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified. Ensures the session always exists
}));
// as each client interacts with the server, they get sent their own unique session ID cookie. Their data get saved in the session store. The session ID is automatically created

//setup passport
app.use(passport.initialize()); // initialize the passport middleware
app.use(passport.session()); // use the Express session to manage the user session

passport.use(
    // This object defines the Google OAuth2 Strategy, basically how we want to authenticate the user using Google
    new OAuth2Strategy({
        // the client ID and secret from the Google Developer Console specifically for this application
        clientID: clientid, 
        clientSecret: clientsecret,
        callbackURL: "/auth/google/callback", // the URL that Google will redirect to after the user logs in. Sends a request to the server itself
        scope: ["email", "profile"] // what data the app is asking for from the user's Google account
    },
    // Function to check if the user is already in the database, if not, add them 
    async (accessToken, refreshToken, profile, done) => { // the parameters are provided by the Google OAuth2 Strategy
        console.log("profile", profile);
        try {
            let user = await userdb.findOne({googleId: profile.id}); // check if the user is already in the database
            
            if(!user) { // add the user to the database if they are not already in it
                user  = new userdb({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.email[0].value,
                    image:profile.photos[0].value
                })

                await user.save();
            } 

            return done(null, user); // done is a callback function that hands over control back to passport. This completes the cycle of authenticating the user and allows passpoert to
                                     //    take any next steps. In this case, we are passing the user object to passport, which will then be serialized and stored in the session store.
                                     // Serializing the user object is done through a serialize function called by passpoert to determine and store a unique identifier for the user in the session store.
        } catch (error) {            // The user's identifier is stored in the session store (any store mechanism). The session cookie and unique ID are sent to the client to maintain 
                                     //    the user's session across requests.
                                     // The client sends back a cookie with the session ID in subsqeuent requests. Passport uses the session ID to find the seession in the session store, 
                                     //    and then deserialize the user object into its usable form. It make this information available in the request object as req.user. 
            return done(error, null);
        }
    }
    )
)
// so after the strategy is defined, each user's information gets stored in the session store

// The data should be stored in the session is serialized here. This simple example serializes the entire user object, but usually you would serialize just the user's ID.
passport.serializeUser((user, done) => {
    done(null, user); // usually 
})
// This function would deserialize the user object from the session store, (usually the database) and make it available in the request object as req.user.
// In this simple example, the entire user object is deserialized, but usually you would deserialize the user's ID and then use that to look up the user in the database.
passport.deserializeUser((user, done) => {
    done(null, user);
})

/*
    Key points to remember:
    the session ID is automatically created and assigned to each user when running app.use(session({...})). The middle ware manages this process.
    The data stored in the session is controlled by the developer and defined by the serialize and deserialize functions. The data is stored in the session store.

*/ 


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