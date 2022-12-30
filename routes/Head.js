var express = require('express');
var router = express.Router();

var Class = require('../models/class');
var Course = require('../models/course');
var Student = require('../models/student');
var Result = require('../models/result');


// @Author: Farasat Khan [SP20-BCS-025]
/* 
    Method: POST	
    Route: /results/submit	
    Description: Submit Student's Marks

    Returns: Status 201
*/
router.post('/results/submit', (req, res, next) => {
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
});

// @Author: Farasat Khan [SP20-BCS-025]
/* 
    Method: GET	
    Route: /results/
    Description: View All Results

    Returns: Result Collections
*/
router.get('/results', (req, res, next) => {
    Result.find({}).exec((error, data) => {
        if (error) throw error;

        res.send(data);
    });
});

// @Author: Farasat Khan [SP20-BCS-025]
/* 
    Method: GET	
    Route: /results/student/:id
    Description: View Results of student

    Returns: Result Collections
*/
router.get('/results/student/:id', (req, res, next) => {
    const student_id = req.params.id;

    Result.find({student_id: student_id}).exec((error, data) => {
        if (error) throw error;

        res.status(200).send(data);
    });
})

// @Author: Farasat Khan [SP20-BCS-025]
/* 
    Method: GET	
    Route: /materials	
    Description: View Materials

    Returns: course_id, courseName, materialList
*/
router.get('/materials', (req, res, next) => {
    Course.find({}).select({_id: 1, courseName: 1, materialList: 1}).exec((error, data) => {
        if (error) throw error;

        res.status(200).send(data);
    })
});


// @Author: Maria Javed [SP20-BCS-???]
/* 
    Method: GET	
    Route: /results/class/:id
    Description: View Results of Class

    Returns: Result Collection
*/
router.get('/results/class/:id', (req, res, next) => {
    const class_id = req.params.id;

    Result.find({class_id: class_id}).exec((error, data) => {
        if (error) throw error;

        res.status(200).send(data);
    });
});


// @Author: Sammi Gul [SP20-BCS-006]
/* 
    Method: GET	
    Route: /class
    Description: View Classes

    Returns: _id, className, studentsList
*/
router.get('/class', (req, res, next) => {
    Class.find({}).populate({path: 'studentsList.studentID'}).exec((error, data) => {
        if (error) throw error;

        res.status(200).send(data);
    })
});


// @Author: Farasat Khan [SP20-BCS-025]
/*
    [Note:- Old Version: Works without Result Schema]
    Method: GET	
    Route: /old/alt_1/results/student/:id
    Description: View Results (GPA) of student

    Returns: _id, username, name, student_regNo, Gpa
*/
router.get('/old/alt_1/results/student/:id', (req, res, next) => {
    const student_id = req.params.id;

    Student.find({_id: student_id}).populate('userid').select({_id: 1, Gpa: 1, userid: 1, student_regNo: 1})
    .exec((error, data) => {
        if (error) throw error;

        const result = {
            _id: data[0]._id,
            username: data[0].userid.username,
            name: data[0].userid.name,
            student_regNo: data[0].student_regNo,
            Gpa: data[0].Gpa
        }

        res.status(200).send(result);
    })
});

// @Author: Farasat Khan [SP20-BCS-025]
/*
    [Note:- Old Version: Works without Result Schema]
    Method: GET	
    Route: /old/alt_2/results/student/:id
    Description: View Results of student

    Returns: Returns a document with by applying aggregate method to calculate individual student's marks based 
    on numbers in quizzes and assignments. Returns Total number in assignments and quizzes.
*/
router.get('/old/alt_2/results/student/:id', (req, res, next) => {
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
            $project: {courseID: 1, courseName: 1, studentsList: 1, quizList: 1, assignmentList: 1}
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
            $unwind: "$quizzes"
        },
        {
            $unwind: "$quizzes.attempted"
        },
        {
            $unwind: "$assignments"
        },
        {
            $unwind: "$assignments.attempted"
        },
        {
            $project: {courseID: 1, courseName: 1, studentsList: 1, quizzes: 1, assignments: 1}
        },
        {
            $match: {
                "quizzes.attempted.sid": ObjectId(student_id)
            }
        },
        {
            $set: {
                quiz_total_marks: "$quizzes.totalMarks",
                quiz_obtained_marks: "$quizzes.attempted.obtainedMarks",
                
                assignment_total_marks: "$assignments.totalMarks",
                assignment_obtained_marks: "$assignments.attempted.obtainedMarks",
            }
        },
        {
            $group: {
                _id: null,
                sum_quiz_total_marks: {
                    $sum: "$quiz_total_marks"
                },
                sum_quiz_obtained_marks: {
                    $sum: "$quiz_obtained_marks"
                },
                sum_assignment_total_marks: {
                    $sum: "$assignment_total_marks"
                },
                sum_assignment_obtained_marks: {
                    $sum: "$assignment_obtained_marks"
                }
            }
        },
    ]).exec((error, data) => {
        if (error) throw error;

        res.send(data);
    })

});


// @Author: Waleed Abdullah [FA18-BCS-128]
router.get('/students', function(req, res, next) {
    Student.find().sort('name').exec(function(error, results) {
        if (error) {
            return next(error);
        }
        // Respond with valid data
        res.json(results);
    });
});


// @Author: Kumail Raza
router.put('/quiz/:qid', function(req, res, next) {
    quiz.findOneAndUpdate({ _id: req.params.qid },{$set:{quizNumber: req.body.quizNumber, 
        title: req.body.title, uploadDate: req.body.uploadDate, totalMarks: req.body.totalMarks}}, function(error, results) {
        if (error) {
            return next(error);
        }
        // Respond with valid data
        res.json(results);
    });
});

// @Author: Hassan Shahzad
router.put('/assigment/:id',function(req,res,next){
    assignment.findOneAndUpdate({_id:req.params.qid},{$set:{assignmentNumber:req.body.assignmentNumber,
        title: req.body.title, uploadDate: req.body.uploadDate, totalMarks: req.body.totalMarks, deadline: req.body.deadline, file: req.body.file, filename: req.body.filename, fileExtension:req.body.fileExtension }},
         function(error, results) {
            if (error) {
                return next(error);
            }
            // Respond with valid data
            res.json(results);
    });
});


//@Author: Hassan Raza [SP20-BCS-035]
router.put('/materials/:mid', function (req, res, next) {
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
});


module.exports = router;
