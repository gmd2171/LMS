var express = require('express');
var router = express.Router();
var adminController = require ('../controllers/adminController')

/* GET home page. */
router.get('/', adminController.index);
/*FAAIZ Assign Teacher*/
router.put('/assignteacher/:tid/course/:cid', adminController.assignTeacher)
/*FAAIZ Modify Teacher */
router.put('/modifyteacher/:tid', adminController.modifyTeacher)
/*FAAIZ Modify Student */
router.put('/modifystudent/:sid', adminController.modifyStudent)
/*MIFRA Add Student*/
router.post('/addstudent', adminController.addStudent)
/*Esha Delete Teacher by ID*/
router.delete('/deleteteacher/:tid', adminController.deleteTeacher)
/*Alishba Delete Student by ID*/
router.delete('/deletestudent/:sid',adminController.deleteStudent)

module.exports = router;
