var express = require('express');
var router = express.Router();
var adminController = require ('../controllers/adminController')

/* GET home page. */
router.get('/', adminController.index);
/*KHEZAR View Students */
router.get('/viewstudents', adminController.viewStudents)
/*ASFAND View Classes */
router.get('/viewclasses', adminController.viewClasses)
/*FAAIZ Assign Teacher*/
router.put('/assignteacher/:tid/course/:cid', adminController.assignTeacher)
/* MAHNOOR assign Student */
router.put('/assignstudent/:sid:cid', adminController.assignStudent)
/*FAAIZ Modify Teacher */
router.put('/modifyteacher/:tid', adminController.modifyTeacher)
/*FAAIZ Modify Student */
router.put('/modifystudent/:sid', adminController.modifyStudent)
/* MAHNOOR Modify Class by class id */
router.put('/modifyclass/:cid', adminController.modifyClass)
/*MIFRA Add Student*/
router.post('/addstudent', adminController.addStudent)
/*JUNAID Add Teacher*/
router.post('/addteacher', adminController.addTeacher)
/*Esha Delete Teacher by ID*/
router.delete('/deleteteacher/:tid', adminController.deleteTeacher)
/*Alishba Delete Student by ID*/
router.delete('/deletestudent/:sid',adminController.deleteStudent)
/* MAHNOOR delete class by class id */
router.delete('/deleteclass/:cid', adminController.deleteClass)
module.exports = router;