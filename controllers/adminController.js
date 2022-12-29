var express = require('express');
var Class = require('../models/class');
var Course = require('../models/course')
var Teacher = require('../models/teacher');
var Student = require('../models/student');
var Quiz = require('../models/quiz');
var User = require('../models/user')
var Assignment = require('../models/assignment')


exports.index = function (req, res, next) {
    res.render('index', { title: 'Admin Page' });
}

exports.assignTeacher = (req, res, next) => {


}

exports.modifyStudent = (req, res, next) => {
    Student.findOneAndUpdate(req.body)
        .then((student) => {
            console.log('Student has been Updated ', student);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(student);
        }, (err) => next(err))
        .catch((err) => next(err));
}
exports.modifyTeacher = (req, res, next) => {
    Teacher.findOneAndUpdate(req.body)
        .then((teacher) => {
            console.log('Teacher has been Updated ', teacher);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(teacher);
        }, (err) => next(err))
        .catch((err) => next(err));
}
exports.addStudent = (req, res, next) => {
    Student.create(req.body)
        .then((student) => {
            console.log("Student has been Added", student)
            res.sendCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(student)
        }, (err) => next(err))
        .catch((err) => next(err))

}
exports.deleteStudent = (req, res, next) => {
    Student.deleteOne({ _id: req.params.sid }, function (error, results) {
        if (error) {
            return next(error);
        }
        // Respond with valid data
        res.json(results);
    });
}

exports.deleteTeacher = (req, res, next) => {
    Teacher.deleteOne({ _id: req.params.tid }, function (error, results) {
        if (error) {
            return next(error);
        }
        res.json(results);
    });
}

