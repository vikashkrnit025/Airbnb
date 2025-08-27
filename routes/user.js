const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const User=require("../models/user.js");
const router = express.Router();
const passport=require('passport');
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
      try{
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.flash("success", "Welcome to Wanderlust!");
    res.redirect("/listings");
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }

  })
);

router.get("/login", (req, res) => {
res.render("users/login.ejs");
}) 

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    res.send("Welcome to Wanderlust! You are logged in!");
  }
);

module.exports = router;