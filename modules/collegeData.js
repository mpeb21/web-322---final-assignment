const Sequelize = require('sequelize');

var sequelize = new Sequelize('umnkuwpv', 'umnkuwpv', 'Jppe590kAea471VYpMALkGyVrMqIph1c', {
    host :'peanut.db.elephantsql.com',
    dialect:'postgres',
    port:5432,
    dialectOptions:{
        ssl:{rejectUnauthorized:false}
    },
    query: {raw :true}
});

var Student =  sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: 
    {
        type: Sequelize.STRING
    },
    lastName: 
    {
        type: Sequelize.STRING,
    },
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

var Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});
Course.hasMany(Student, {foreignKey:'course'});

module.exports.initialize = function () {
    return new Promise(function(resolve,reject){
        sequelize.sync().then(function(){

                resolve("Sync to the database is successfull.");
        }).catch(function(){
            reject("unable to sync the database");
        });
    });
};
module.exports.getAllStudents = function(){
    return new Promise(function(resolve,reject){
        Student.findAll().then(function(data){
            
                resolve(data);
        }).catch(function(error){
                console.log("Error",error);
                reject("No results returned");
        });
    });
};
module.exports.getStudentsByCourse = function (course) {

    console.log("courseid",course);
    return new Promise(function(resolve,reject){
       Student.findAll({
        where : {course : course}
       }).then(function(data){
        console.log("data returned",data);
            resolve(data);
       }
       ).catch(function(){reject("no result returned");});
    });
};
module.exports.getStudentByNum = function (num) {
    console.log("student data",num);
    return new Promise(function(resolve,reject){
        Student.findAll({
            where : {studentNum : num}
           }).then(function(data){
                resolve(data[0]);
           }
           ).catch(function(){reject("no result returned");});
        });
};
module.exports.getCourses = function(){
    return new Promise(function(resolve,reject){
        Course.findAll().then(function(data){
            resolve(data);
    }).catch(function(){
            reject("No results returned");
    });
});
};
module.exports.getCourseById = function (id) {
    return new Promise(function(resolve,reject){
        Course.findAll({
            where : {courseId : id}
        }).then(function(data){
                console.log("resolved",data);
                resolve(data[0]);
           }
           ).catch(function(){reject("no result returned");});
        });
};
module.exports.addStudent = function (studentData) {
    return new Promise(function(resolve,reject){
        studentData.TA = (studentData.TA) ? true:false;

       

        for (const keys in studentData)
        {
            if (!studentData[keys]) 
            {
                studentData[keys] = null; 
            }
        }
        console.log(studentData);
        Student.create(studentData).then(function(data){
            resolve(data);
        }).catch(function(){
                reject("No results returned");
        });
    
    });
};
module.exports.updateStudent = function (studentData) {
    return new Promise(function(resolve,reject){
        studentData.TA = (studentData.TA) ? true:false;
        for (const values in studentData)
        {
            if (!studentData[values]) 
            {
                studentData[values] = null; 
            }
        }
        Student.update(studentData,{
            where: {studentNum: studentData.studentNum}
        }).then(function(){
            resolve("Successfully updated.");
        }).catch(function(){
            reject("Unable to update student");
        });
    });
};
module.exports.addCourse = function(courseData){
    return new Promise(function(resolve,reject){
        for (const values in courseData)
        {
            if (!courseData[values]) 
            {
                courseData[values] = null; 
            }
        }

        Course.create(courseData).then(function(data){
            console.log(data);
            resolve(data);
        }).catch(function(){
                reject("Unable to Create Course");
        });
    });
};
module.exports.updateCourse = function(courseData){
    return new Promise(function(resolve,reject){
        for (const values in courseData)
        {
            if (!courseData[values]) 
            {
                courseData[values] = null; 
            }
        }
        Course.update(courseData,{
            where: {courseId: courseData.courseId}
        }).then(function(){
            resolve("Successfully updated.");
        }).catch(function(){
            reject("Unable to update Course");
        });
    });
};
module.exports.deleteCourseById = function(id){
    return new Promise(function(resolve,reject){
        Course.destroy({
            where: {courseId:id}
        }).then(function(){
            resolve("Deleted");
        }).catch(function(){
            reject("Error in Deletion");
        });
    });
};
module.exports.deleteStudentByNum = function(studentNum){
    return new Promise(function(resolve,reject){
        console.log("studennum",studentNum);
        Student.destroy({
            where: {studentNum : studentNum}
        }).then(function(){
            resolve("destroyed");
        }).catch(function(){
            reject("Error in destroying");
        });
    });
};
