const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');

const User = require("../models/users")

const bcrypt = require("bcrypt")

router.get("/login",(req, res)=>{
    res.render("login");
});

router.get("/register",(req, res)=>{
    res.render("register");
});

router.post("/login", (req, res)=>{
    let query = {
        username: req.body.username
    }
    User.findOne(query)
    .then(user=>{
        if(user){
            bcrypt
            .compare(req.body.password, user.password)
            .then(response => {
                if(response === true){
                    req.session.username = user.username;
                    res.redirect("/")
                }else{
                    req.flash('danger', 'Invalid Login')
                    res.render('login');
                }
            })
            .catch(err => {
                console.log(err);
            }) 
        }else{
            req.flash('danger', 'Invalid Login')
            res.render('login');
        }
    })
    .catch(error=>{
        console.log(error)
    })
});

router.post("/register", [
    body("name")
    .notEmpty().withMessage("Name is required")
    .isAlpha().withMessage("Name should only contain alphabets")
    .isLength({min: 3}).withMessage("Name should contain at least 3 letters"),
    body("username")
    .notEmpty().withMessage("username is required")
    .isLength({min: 3}).withMessage("Username should contain at least 3 letters")
    .isAlphanumeric().withMessage("username cannot have special characters"),
    body("password")
    .notEmpty().withMessage("password is required")
    .isLength({min: 6}).withMessage("Password should contain at least 6 characters")
],
async (req, res)=>{
    var errors = validationResult(req);
    await User.findOne({username: req.body.username})
    .then((existingUser)=>{
        if(existingUser){
                errors.errors.push({ msg: "Username already exists" });
            }
    });
    if(!errors.isEmpty()){
        res.render('register', {
            errors: errors.array()
        })
    }
    else{
        let saltRounds = 10;
    bcrypt
    .hash(req.body.password, saltRounds)
    .then(hash => {
        let newUser = new User({
            name: req.body.name,
            username: req.body.username,
            password: hash
        });
        newUser.save()
        .then(()=>{
            req.flash("success", "Registered successfully")
            res.redirect("/login")
        })
        .catch(error=>{
            console.log(error);
        })
  })
  .catch(err => console.error(err.message))
    
    }
})

router.get('/logout', function(req, res){
    req.session.destroy(function(err){
        console.log(err)
        res.redirect('/user/login')
    });
});

module.exports = router;