var express = require('express');
var router = express.Router();

var Class = require('../models/class');
var Course = require('../models/course');
var Student = require('../models/student');
var Result = require('../models/result');
var Assignment = require('../models/assignment');
var Quiz = require('../models/quiz');

var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

//@Author: Beenish Shakeel [SP20-BCS-017]
/* 
    Method: GET	
    Route: /
    Description: View Dashboard
    Returns: an object with data from 3 collections
*/
exports.viewDashboard =  async (req, res, next) => {
    try {
        let teachers = await Teacher.find({}, { __v: 0 }).populate(
            "userid",
            "name"
        );
        teachers = teachers.map(teacher => teacher.toObject());
        let courses = await Course.find({}, { __v: 0, materialList: 0, _id: 0 }).populate({
            path: "teacher",
            select: "userid",
            populate: {
                path: "userid",
                select: "name",
            },
        });
        courses = courses.map((course) => {
            let no_of_students = course.studentsList.length;
            let no_of_quizzes = course.quizList.length;
            let no_of_assignments = course.assignmentList.length;

            course.studentsList = undefined;
            course.quizList = undefined;
            course.assignmentList = undefined;

            return {
                ...course.toObject(),
                no_of_students: no_of_students,
                no_of_quizzes: no_of_quizzes,
                no_of_assignments: no_of_assignments
            };
        });
        let classes = await Class.find({}, { __v: 0, _id: 0 });
        classes = classes.map((class_record) => {
            let no_of_students = class_record.studentsList.length;
            class_record.studentsList = undefined;
            return {
            ...class_record.toObject(),
            no_of_students: no_of_students
            };
        });

        res.json({ teachers: teachers, courses: courses, classes: classes });

    } catch (e) {

        console.log(e);
        res.status(500).send("Could not get dashboard data");
    }
};
  
//@Author: Beenish Shakeel [SP20-BCS-017]
/* 
    Method: GET	
    Route: /graph
    Description: View graph
    Returns: number of passed students
*/
exports.viewGraph =  (req, res, next) => {
    Result.aggregate([
    {
        $group: {
            _id: {
                class: "$class_id",
                course: "$course_id"
            },
            totalStudents: {$sum: 1},
            gpas: {
                $push: "$obtained_gpa"
            }
        }
    },
    {
        $group: {
            _id: "$_id.class",
            courses: {$push: {course: "$_id.course", totalStudents: "$totalStudents", gpas: "$gpas"}}
        }
    }
    ])
    .then(classesResults => {
        classesResults = classesResults.map(classResult => {
            let coursesResults = classResult.courses.map(course => {
                let gpas = [...course.gpas]
                delete course.gpas;
                return {
                    ...course,
                    studentsPassed: gpas.filter(gpa => gpa >= 2).length
                };
            });
            return {
                ...classResult,
                courses: coursesResults
            };
        });
        res.json(classesResults);
    })
    .catch(error => {
        console.log(error);
        res.status(500).send("could not load graph data")
    });
};

// @Author: Farasat Khan [SP20-BCS-025]
/* 
    Method: POST	
    Route: /results/submit	
    Description: Submit Student's Marks
    Returns: Status 201
*/
exports.submitResult =  (req, res, next) => {
    const {student_id, course_id, class_id, total_marks, obtained_marks, obtained_gpa} = req.body;

    Student.find({_id: student_id}).exec((error, data) => {
        if (error) throw error;

        Course.find({_id: course_id}).exec((error, data) => {
            if (error) throw error;

            Result.create(
                {
                    student_id: student_id, course_id: course_id, class_id: class_id, total_marks: total_marks,
                    obtained_marks: obtained_marks, obtained_gpa: obtained_gpa
                },
                (error, data) => {
                    if (error) throw error;

                    res.status(201).send({"status": "Result Submitted"});
                }
            );
        });
    });
};

// @Author: Farasat Khan [SP20-BCS-025]
/* 
    Method: GET	
    Route: /results/
    Description: View All Results
    Returns: Result Collections
*/
exports.viewResult =  (req, res, next) => {
    Result.find({}).exec((error, data) => {
        if (error) throw error;

        res.send(data);
    });
};

// @Author: Farasat Khan [SP20-BCS-025]
/* 
    Method: GET	
    Route: /results/student/:id
    Description: View Results of student
    Returns: Result Collections
*/
exports.viewParticularStudentResultAlt =  (req, res, next) => {
    const student_id = req.params.id;

    Result.find({student_id: student_id}).exec((error, data) => {
        if (error) throw error;

        res.status(200).send(data);
    });
};

// @Author: Farasat Khan [SP20-BCS-025]
/*
    Method: GET	
    Route: /results/student/:id
    Description: View Results of student

    Returns: Returns a document with by applying aggregate method to calculate individual student's marks based 
    on numbers in quizzes and assignments. 
    
    Returns Total number in Assignment and Quizzes.
*/
exports.viewParticularStudentResult =  (req, res, next) => {

    const student_id = req.params.id;

    Course.aggregate([
        {
            $unwind: "$studentsList"
        },
        {
            $match: {
                "studentsList.studentID": ObjectId(student_id)
            }
        },
        {
            $lookup: {
                from: Quiz.collection.name,
                localField: "quizList.quizID",
                foreignField: "_id",
                as: "quizzes",
            }
        },
        {
            $lookup: {
                from: Assignment.collection.name,
                localField: 'assignmentList.assignmentID',
                foreignField: "_id",
                as: "assignments"
            }
        },
        {
            $project: {_id: 1, courseID: 1, courseName: 1, studentsList: 1, quizzes: 1, assignments: 1}
        }
    ]).exec((error, result) => {
        if (error) throw error;

        const studentResult = [];

        const documents = result.map((document) => {
            
            const temp = {
                courseID: document.courseID,
                courseName: document.courseName,
                total_quiz_marks: 0,
                obtained_quiz_marks: 0,
                total_assignment_marks: 0,
                obtained_assignment_marks: 0
            }

            document.quizzes.map((quiz) => {
                quiz.attempted.map((attempted) => {
                    if (attempted.sid == student_id) {
                        temp.total_quiz_marks += quiz.totalMarks;
                        temp.obtained_quiz_marks += attempted.obtainedMarks;
                    }
                })
            })

            document.assignments.map((assignment) => {
                assignment.attempted.map((attempted) => {
                    if (attempted.sid == student_id) {
                        temp.total_assignment_marks += assignment.totalMarks;
                        temp.obtained_assignment_marks += attempted.obtainedMarks;
                    }
                })
            })

            studentResult.push(temp)
        })

        res.status(200).send(studentResult);
    })
};

// @Author: Farasat Khan [SP20-BCS-025]
/* 
    Method: GET	
    Route: /materials	
    Description: View Materials

    Returns: course_id, courseName, materialList
*/
exports.viewMaterials =  (req, res, next) => {
    Course.find({}).select({_id: 1, courseName: 1, materialList: 1}).exec((error, data) => {
        if (error) throw error;

        res.status(200).send(data);
    })
};


// @Author: Maria Javed [SP20-BCS-049]
/* 
    Method: GET	
    Route: /results/class/:id
    Description: View Results of Class

    Returns: Result Collection
*/
exports.viewParticularClassResult =  (req, res, next) => {
    const class_id = req.params.id;

    Result.find({class_id: class_id}).exec((error, data) => {
        if (error) throw error;

        res.status(200).send(data);
    });
};


// @Author: Sammi Gul [SP20-BCS-006]
/* 
    Method: GET	
    Route: /class
    Description: View Classes

    Returns: _id, className, studentsList
*/
exports.viewClasses =  (req, res, next) => {
    Class.find({}).populate({path: 'studentsList.studentID'}).exec((error, data) => {
        if (error) throw error;

        res.status(200).send(data);
    })
};


// @Author: Waleed Abdullah [FA18-BCS-128]
exports.viewStudents =  (req, res, next) => {
    Student.find().sort('name').exec(function(error, results) {
        if (error) {
            return next(error);
        }
        // Respond with valid data
        res.json(results);
    });
};


// @Author: Kumail Raza [SP20-BCS-045]
exports.updateParticularQuiz =  (req, res, next) => {
    Quiz.findOneAndUpdate({ _id: req.params.qid },{$set:{quizNumber: req.body.quizNumber, 
        title: req.body.title, uploadDate: req.body.uploadDate, totalMarks: req.body.totalMarks}},
        function(error, results) {
        if (error) {
            return next(error);
        }
        // Respond with valid data
        res.json(results);
    });
};

// @Author: Hassan Shahzad [SP20-BCS-036]
exports.updateParticularAssignment =  (req, res, next) => {
    Assignment.findOneAndUpdate({_id:req.params.qid},{$set:{assignmentNumber:req.body.assignmentNumber,
        title: req.body.title, uploadDate: req.body.uploadDate, totalMarks: req.body.totalMarks, deadline: req.body.deadline, file: req.body.file, filename: req.body.filename, fileExtension:req.body.fileExtension }},
         function(error, results) {
            if (error) {
                return next(error);
            }
            // Respond with valid data
            res.json(results);
    });
};


//@Author: Hassan Raza [SP20-BCS-035]
exports.updateParticularMaterials =  (req, res, next) => {
    Course.findOneAndUpdate({
        _id: req.params.mid
    },
        {
            $set:
            {
                title: req.body.title,
                file: req.body.file,
                fileName: req.body.fileName,
                fileExtension: req.body.fileExtension,
                uploadDate: new Date()
            }
        },
        function (error, results) {
            if (error) {
                return next(error);
            }
            res.json(results);
        });
};