const express = require('express');
const app = express();
const passport = require('passport');
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

// Require the 'strategy' to authenticate requests 
const LocalStrategy = require('passport-local').Strategy;

// use following methods as middleware 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  cookieSession({
    name: "session",
    keys: ["helloworld"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Initialize passport and sessions and tell app to use it as middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport calls the 'serializeUser' function after the 'verify callback' function with the user parameter that we passed to its 'done' function. 
passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user);
});

// Deserialize data so we can use it
passport.deserializeUser((user, done) => {
  done(null, user);
});


// Configure a local strategy named 'login' using the passport.use command. This tells Passport what middleware to use: 
passport.use(
  // Argument 1: Arbitrary name of LocalStrategy instance (the strategy)
  "login",  
  // Argument 2: Callback function called 'Verify Callback' which will be invoked by Passport, passing in username and password fields which were extracted from req.body property
  new LocalStrategy((username, password, done) => {
    const authenticated = username === "John" && password === "Smith";

    if (authenticated) {
      return done(null, { myUser: "user", myID: 1234 }); // This code gets passed to 'serializeUser' function
    } else {
      return done(null, false);
    }
  })
);

const authenticateRequest = function (req, res, next) {
  if (!req.isAuthenticated()) {
    // Denied. Redirect to login
    console.log("DEEEnied");
    res.redirect("/login");
  } else {
    next();
  }
};

// Creage a new 'login' post route with passport.authenticate (route-level MW)
app.post(
  // 1. Pass in name of the strategy
  "/login", 
  // 2. Pass in more MW to change routes based on success/failure of authentication
  passport.authenticate("login", {
    successRedirect: "/success",
    failureRedirect: "/login",
    // session: false, // Default is already set to true to use sessions
  })
);

// Success and login GET routes
app.get("/success", (req, res) => {
  console.log(req.user); // see { myUser: 'user', myID: 1234 }
  res.send("Hey, hello from the server!");

});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.listen(8000);