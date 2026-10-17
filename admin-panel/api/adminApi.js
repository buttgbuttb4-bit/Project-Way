import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getDashboard() {
  const res = await api.get('/admin/dashboard');
  return res.data;
}

export async function getTeachers() {
  const res = await api.get('/admin/teachers');
  return res.data;
}

export async function addTeacher(payload) {
  const res = await api.post('/admin/teachers', payload);
  return res.data;
}

export async function getStudents() {
  const res = await api.get('/admin/students');
  return res.data;
}

export async function addStudent(payload) {
  const res = await api.post('/admin/students', payload);
  return res.data;
}

export async function getRoles() {
  const res = await api.get('/admin/roles');
  return res.data;
}

export async function updateRole(roleId, payload) {
  const res = await api.put(`/admin/roles/${roleId}`, payload);
  return res.data;
}

export async function deleteStudent(studentId) {
  const res = await api.delete(`/admin/students/${studentId}`);
  return res.data;
}

export async function updateStudent(studentId, payload) {
  const res = await api.put(`/admin/students/${studentId}`, payload);
  return res.data;
}

export async function deleteTeacher(teacherId) {
  const res = await api.delete(`/admin/teachers/${teacherId}`);
  return res.data;
}

export async function updateTeacher(teacherId, payload) {
  const res = await api.put(`/admin/teachers/${teacherId}`, payload);
  return res.data;
}

export default {
  getDashboard,
  getTeachers,
  addTeacher,
  getStudents,
  addStudent,
  getRoles,
  updateRole,
  deleteStudent,
  updateStudent,
  deleteTeacher,
  updateTeacher,
};
