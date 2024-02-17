const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const flash = require('connect-flash');
const paginate = require('express-paginate')
const path = require('path')

mongoose.connect('mongodb://localhost/medicalStore')
.then(db=>{
    console.log("connected to mongodb")
})
.catch(error=>{
    console.log(error);
})

const app = express();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());
app.use(function(req, res, next){
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(paginate.middleware(5, 50));

app.set('view engine', 'pug');

app.use('/', function(req, res, next){
    if(!req.session.username && req.path != "/user/login" && req.path != "/user/register"){
        res.redirect("/user/login")
    }
    next();
})

app.use(express.json());
app.use(express.urlencoded({extended: true}))

const users = require("./routes/user");
app.use("/user", users)

const Medicine = require("./models/medicines")

app.get("/", async (req, res)=>{
    const searchTerm = req.query.search;
    var [results, itemCount] = await Promise.all([
        Medicine.find().limit(req.query.limit).skip(req.skip),
        Medicine.countDocuments({})
    ]);
    if(searchTerm){
        if(searchTerm.trim() !== ""){
        const regex = new RegExp(searchTerm, 'i');
        var [filteredMedicines, filteredItemCount] = await Promise.all([
            Medicine.find({ name: regex }).limit(req.query.limit).skip(req.skip),
            Medicine.countDocuments({name: regex})
        ]);
        results = filteredMedicines;
        itemCount = filteredItemCount;
    }
}
    let pageCount = Math.ceil(itemCount / req.query.limit);
    res.render("index", {
        title: "Medicines",
        medicines: results,
        pageCount, 
        itemCount, 
        pages: paginate.getArrayPages(req)(5, pageCount, req.query.page)
    })
});

// app.get("/search" , async (req, res)=>{
//     let searchTerm = req.query.keyword;
//     if(searchTerm){
//         if(searchTerm.trim() === ""){
//             var [filteredMedicines, itemCount] = await Promise.all([
//                 Medicine.find().limit(req.query.limit).skip(req.skip),
//                 Medicine.countDocuments({})
//             ]);
//         } 
//         else{
//             const regex = new RegExp(searchTerm, 'i');
//             var [filteredMedicines, itemCount] = await Promise.all([
//                 Medicine.find({ name: regex }).limit(req.query.limit).skip(req.skip),
//                 Medicine.countDocuments({name: regex})
//         ]);
//         }
//         let pageCount = Math.ceil(itemCount / req.query.limit);
//         res.render("index", {
//             title: "Medicines",
//             medicines: filteredMedicines,
//             pageCount, 
//             itemCount, 
//             pages: paginate.getArrayPages(req)(5, pageCount, req.query.page)
//         })
//     }
// })

const medicines = require("./routes/medicine");

app.use("/medicines", medicines);

app.listen(8080, function(){
    console.log("server started on port 8080")
})