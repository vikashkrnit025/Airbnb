if(process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate =require("ejs-mate");
const dbUrl=process.env.ATLASDB_URL;
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session =require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User =require("./models/user.js")


const listingsRouter =require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error",()=>{
  console.log("ERROR in  MONGO SESSION STORE",err);
});

const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+ 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly:true,
  },
};

app.get("/test",(req,res)=>{
  res.send("test successful");
});

app.use(cookieParser());
app.use(session(sessionOptions));
app.use(flash());

app.get("/register",(req,res)=>{
  let {name="anonymous"} =req.query;
  req.session.name =name;
  if(name==="anonymous"){
    req.flash("error","user not registered");
  }else{
    req.flash("success","user registerd successfully");
  }
  res.redirect("/hello");
});

app.get("/reqcount",(req,res) =>{
  if(req.session.count){
    req.session.count++;
  }else{
    req.session.count=1;
  }

app.get("/hello",(req,res)=>{
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.render("page.ejs",{name:req.session.name});
});

  res.send(`You sent a request ${req.session.count}times`);
});


// create cookies
app.get("/getcookies",(req,res) =>{
  res.cookie("username","vikash@123");
  res.cookie("Password","admin@123");
  res.send("sent your cookies");
});

//see  cookies
// app.get("/",(req,res)=>{
//   console.dir(req.cookies);

// });

 
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public"))); //to use static file css

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success =req.flash("success");
  res.locals.error =req.flash("error")
  res.locals.currUser = req.user;  
  next();
});
 
app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


app.all("",(req,res,next) =>{
  next(new ExpressError(404,"page not found!"))
});

app.use((err,req,res,next)=>{
  let{statusCode=500,message="something went wrong!"} =err;
  // res.render("error.ejs");  
  res.status(statusCode).send(message); 
  
}); 

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});