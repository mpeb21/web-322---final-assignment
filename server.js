/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
* assignment has been copied manually or electronically from any other source (including web sites) or
* distributed to other students. *
* Name: Maria Patricia Espinoza Bueno Student ID:157472218  Date: 28-11-2022 *
* Online (Cyclic) Link: https://calm-fawn-capris.cyclic.app/
* ********************************************************************************/
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");
const clientSessions = require("client-sessions");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.set('view engine', '.hbs');

app.use(express.static("public"));

// Setup client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "assignment6_web322", // this should be a long un-guessable string.
    duration: 6 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

const user = {
    username: "sampleuser",
    password: "samplepassword",
    email: "sampleuser@example.com"
};


  
  // The login route that adds the user to the session
  app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if(username === "" || password === "") {
      return res.render("login", { errorMsg: "Missing credentials.", layout: false });
    }
  
    if(username === user.username && password === user.password){
  
      req.session.user = {
        username: user.username,
        email: user.email
      };
  
      res.redirect("/students");
    } else {
  
      res.render("login", { errorMsg: "Invalid username or password!", layout: false});
    }
  });
  
 
  app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/login");
  });

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
};

app.get("/", (req,res) => {
    if(!req.session.user)
    {
        res.render("home");
    }
    else{
        res.render("home",{user:req.session.user});
    }
});
app.get("/home",(req,res)=>{
    res.render("home");
})

app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/about", (req,res) => {
    res.render("about");
});

app.get("/htmlDemo", (req,res) => {
    res.render("htmlDemo");
});


    if (req.query.course) {
        
        data.getStudentsByCourse(req.query.course).then((data) => {
            res.render("students", {students: data,user:req.session.user});
        }).catch((err) => {
            res.render("students", {message: "no results",user:req.session.user});
        });
    }else{
        data.getAllStudents().then(function(data){
            if(data.length>0)
            {
                res.render("students",{students:data,user:req.session.user});
            }
            else
            {
                res.render("students",{message: "no results",user:req.session.user});
            }
        }).catch(err =>{
            res.render("students",{message: "no results",user:req.session.user});
        });
    }

    data.getCourses().then(function(data){
        if(data.length>0)
        {
            res.render("courses",{courses:data,user:req.session.user});
        }
        else
        {
            res.render("courses",{message: "no results",user:req.session.user});
        }
    }).catch(err =>{
        res.render("students",{message: "no results",user:req.session.user});
    });

   res.render("addCourse",{user:req.session.user});

    data.getCourses().then(function(data){
        res.render("addStudent", {courses: data,user:req.session.user});
    }).catch(function(){
        res.render("addStudent", {courses: [],user:req.session.user});
    });
    
    data.addCourse(req.body).then(()=>{
      res.redirect("/courses");
    });
    data.addStudent(req.body).then(()=>{
      res.redirect("/students");
    });
    // initialize an empty object to store the values 
    let viewData = {};
    data.getStudentByNum(req.params.studentNum).then((data) => { 
    console.log("student",data);
    if (data) {
        viewData.student = data; //store student data in the "viewData" object as "student" 
    } else {
        viewData.student = null; // set student to null if none were returned 
        }}).catch(() => {
    viewData.student = null; // set student to null if there was an error 
    }).then(data.getCourses)
    .then((data) => {
    viewData.courses = data; 
    // store course data in the "viewData" object as "courses"
    // loop through viewData.courses and once we have found the courseId that matches // the student's "course" value, add a "selected" property to the matching
    // viewData.courses object
    for (let i = 0; i < viewData.courses.length; i++) {
    if (viewData.courses[i].courseId == viewData.student.course) {
    viewData.courses[i].selected = true; }
    }
    }).catch(() => {
    viewData.courses = []; // set courses to empty if there was an error
    }).then(() => {
    if (viewData.student == null) { // if no student - return an error
    res.status(404).send("Student Not Found"); } else {
    res.render("student", { viewData: viewData,user:req.session.user }); // render the "student" view 
    }
    });

    req.body.courseId = parseInt(req.body.courseId);

    data.updateCourse(req.body).then(() => {
        res.redirect("/courses");
    });

    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    });

    data.getCourseById(req.params.id).then((d) => {
        if(d)
        {
            res.render("course", { course: d,user:req.session.user }); 
        }
        else
        {
            res.status(404).send("Course Not Found");
        }
    }).catch((err) => {
        res.render("course",{message:"no results",user:req.session.user}); 
    });

    data.deleteCourseById(req.params.id).then(() => {
        res.redirect("/courses");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Course / Course not found");
    });

    data.deleteStudentByNum(req.params.studentNum).then(() => {
        res.redirect("/students");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Student / Student not found");
    });

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});


data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
