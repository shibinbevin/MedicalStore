const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');

const Medicine = require("../models/medicines")

router.get("/add", (req, res)=>{
    res.render("add", {
        title: "Add Medicine"
    });
});

router.post("/add", [
    body('name').notEmpty().withMessage("name is required"),
    body('company').notEmpty().withMessage("company is required"),
    body('exp').notEmpty().withMessage("Expiry date is required")
],(req, res)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render("add", {
            title: "Add Medicine",
            errors: errors.array()
        })
    }
    else{
        let newMedicine = new Medicine({
            name: req.body.name,
            company: req.body.company,
            exp: req.body.exp
        });
        newMedicine.save()
        .then(()=>{
            req.flash("success", "Medicine Added")
            res.redirect('/')
        })
        .catch(error=>{
            console.log(error)
        });
    }
});

router.get("/:_id", (req, res)=>{
    Medicine.findById(req.params._id)
    .then(medicine=>{
        res.render("medicine", {
            medicine: medicine
        });
    })
    .catch(error=>{
        console.log(error);
    })
})

router.get("/edit/:_id", (req, res)=>{
    Medicine.findById(req.params._id)
    .then((medicine)=>{
        res.render("edit", {
            title: "Edit",
            medicine: medicine
        });
    })
    .catch(error=>{
        console.log(error);
    })
})

router.post("/edit/:_id", (req, res)=>{
    var newMedicine = {
        name: req.body.name,
        company: req.body.company, 
        exp: req.body.exp
    }
    Medicine.findOneAndUpdate({_id: req.params._id}, newMedicine)
    .then(()=>{
        req.flash("success", "Medicine Updated");
        res.redirect("/");
    })
    .catch(error=>{
        console.log(error);
    })
});

router.delete("/delete/:_id", (req, res)=>{
    let medicine = new Medicine({
        name: req.body.name, 
        company: req.body.company, 
        exp: req.body.exp
    });
    let query = {_id: req.params._id};
    Medicine.deleteOne(query, medicine)
    .then(()=>{
        res.send("success");
    })
    .catch(error=>console.log(error))
})



module.exports = router;