//external import
const express=require('express')
const dotenv=require('dotenv')
var session = require('express-session')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const passport=require('passport')


//create app
const app=express()


//env config
dotenv.config()

//parsing data for goggle auth
app.use(session({ secret: "cats",resave: false,
saveUninitialized: true, }));

app.use(passport.initialize());

app.use(passport.session());


//middleware for user check login or not
const isLogged=((req,res,next)=>{
  req.user ? next() : res.sendStatus(401)
})


//crediantial for client
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:    process.env.GOOGLE_CLIENT_URL,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    
    return done(null,profile)
  } 
));

passport.serializeUser(function(user,done){
    done(null,user)
})
passport.deserializeUser(function(user,done){
    done(null,user)
})

//routing
app.get('/',(req,res)=>{
  res.send('<a href="/auth/google">Authenticate with Google</a>');
})


app.get('/auth/google',
  passport.authenticate('google', { scope:
  	[ 'email', 'profile' ] }
));

//calback routing
app.get( '/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/protected',
        failureRedirect: '/auth/failure'
}));

//failure route
app.get('/auth/failure',(req,res)=>{
  res.send("something wrong!")
})

//protected router
app.get('/protected', isLogged,(req,res)=>{
  console.log(req.user)
  res.send(`Hello ${req.user.displayName} `)
})

//log out route
app.get('/logout',(req,res)=>{
  req.logOut()
  req.session.destroy()
  res.send("GoodBye!")
})


//app starter port
app.listen(4000,()=>{
  console.log("server start")
})