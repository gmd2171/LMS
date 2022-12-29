var mongoose = require("mongoose");

var courseSchema = mongoose.Schema({
  courseID: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  materialList: {
    type: [
      {
        title: {
          type: String,
          required: true,
        },
        file: {
          type: Buffer,
        },
        fileName: {
          type: String,
        },
        fileExtension: {
          type: String,
        },
        uploadedDate: {
          type: Date,
        },
      },
    ],
  },

  studentsList: {
    type: [
      {
        studentID: {
          type: mongoose.Types.ObjectId,
          ref: "Student",
        },
      },
    ],
  },
  teacher: {
    type: mongoose.Types.ObjectId,
    ref: "Teacher",
  },
  quizList: {
    type: [
      {
        quizID: {
          type: mongoose.Types.ObjectId,
          ref: "Quiz",
        },
      },
    ],
  },
  assignmentList: {
    type: [
      {
        assignmentID: {
          type: mongoose.Types.ObjectId,
          ref: "Assignment",
        },
      },
    ],
  },
});
module.exports = mongoose.model("Course", courseSchema);
