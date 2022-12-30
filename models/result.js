var mongoose = require('mongoose');

var  resultSchema = mongoose.Schema(
    {
        student_id: {
            type: mongoose.Types.ObjectId,
            ref: 'Student'
        },
        course_id: {
            type: mongoose.Types.ObjectId,
            ref: 'Course'
        },
        class_id: {
            type: mongoose.Types.ObjectId,
            ref: 'Class'
        },
        total_marks : {
            type: Number
        },
        obtained_marks : {
            type: Number
        },
        obtained_gpa : {
            type: Number
        },    
    }
);

module.exports=mongoose.model('Result', resultSchema);