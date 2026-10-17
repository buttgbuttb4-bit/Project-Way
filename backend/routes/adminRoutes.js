import express from 'express';
import {
  getDashboard,
  getTeachers,
  addTeacher,
  getStudents,
  addStudent,
  getRoles,
  updateRole,
  getRolesPublic,
  deleteStudent,
  updateStudent,
  deleteTeacher,
  updateTeacher,
} from '../controllers/adminController.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.get('/roles/public', getRolesPublic);
router.use(authenticateJWT, requireAdmin);
router.get('/dashboard', getDashboard);
router.get('/teachers', getTeachers);
router.post('/teachers', addTeacher);
router.delete('/teachers/:teacherId', deleteTeacher);
router.put('/teachers/:teacherId', updateTeacher);
router.get('/students', getStudents);
router.post('/students', addStudent);
router.delete('/students/:studentId', deleteStudent);
router.put('/students/:studentId', updateStudent);
router.get('/roles', getRoles);
router.put('/roles/:roleId', updateRole);

export default router;
