import React, { useState, useMemo, useEffect } from 'react';
import adminApi from '../api/adminApi';
import '../styles/ManageStudents.css';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    session: '',
  });
  const [activeSession, setActiveSession] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormState, setEditFormState] = useState({
    name: '',
    email: '',
  });
  const [editNameError, setEditNameError] = useState('');
  const [editEmailError, setEditEmailError] = useState('');
  const [editErrorMessage, setEditErrorMessage] = useState('');

  // Validate Full Name
  const validateFullName = (value) => {
    // Only alphabets (A-Z, a-z) and spaces allowed
    if (!/^[a-zA-Z\s]*$/.test(value)) {
      return "Only alphabets and spaces are allowed";
    }
    
    // Check if length exceeds 20 characters
    if (value.length > 20) {
      return "Name must be 20 characters or less";
    }
    
    return "";
  };

  // Validate Email
  const validateEmail = (value) => {
    // Check if email is empty
    if (!value) {
      return "Email is required";
    }

    // Check for multiple @ symbols
    const atCount = (value.match(/@/g) || []).length;
    if (atCount !== 1) {
      return "Email must contain exactly one '@' symbol";
    }

    // Check if @ is at the beginning or end
    if (value.startsWith('@') || value.endsWith('@')) {
      return "'@' symbol cannot be at the beginning or end";
    }

    // Split email into local part and domain
    const [localPart, domain] = value.split('@');

    // Validate local part (before @)
    if (!localPart) {
      return "Missing name before '@' symbol";
    }

    // Local part should only contain alphanumeric characters, dots, hyphens, and underscores
    if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
      return "Name can only contain letters, numbers, dots, hyphens, and underscores";
    }

    // Local part should not start or end with dot, hyphen, or underscore
    if (/^[._-]|[._-]$/.test(localPart)) {
      return "Name cannot start or end with dot, hyphen, or underscore";
    }

    // Local part should not have consecutive dots
    if (/\.\./.test(localPart)) {
      return "Name cannot have consecutive dots";
    }

    // Local part length check
    if (localPart.length < 2) {
      return "Name must be at least 2 characters before '@'";
    }

    if (localPart.length > 64) {
      return "Name is too long (max 64 characters)";
    }

    // Validate domain part (after @)
    if (!domain) {
      return "Missing domain after '@' symbol";
    }

    // Check if domain contains exactly one dot
    const domainDotCount = (domain.match(/\./g) || []).length;
    if (domainDotCount !== 1) {
      return "Domain must contain exactly one '.' (e.g., gmail.com)";
    }

    // Split domain into domain name and TLD
    const [domainName, tld] = domain.split('.');

    // Validate domain name
    if (!domainName) {
      return "Missing domain name before '.'";
    }

    // Domain name should only contain alphanumeric characters and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(domainName)) {
      return "Domain name can only contain letters, numbers, and hyphens";
    }

    // Domain name should not start or end with hyphen
    if (/^-|-$/.test(domainName)) {
      return "Domain name cannot start or end with hyphen";
    }

    // Domain name length check
    if (domainName.length < 3) {
      return "Domain name must be at least 3 characters (e.g., gmail)";
    }

    if (domainName.length > 63) {
      return "Domain name is too long (max 63 characters)";
    }

    // Validate TLD
    if (!tld) {
      return "Missing top-level domain after '.' (e.g., .com)";
    }

    // TLD should only contain letters
    if (!/^[a-zA-Z]+$/.test(tld)) {
      return "Top-level domain can only contain letters";
    }

    // TLD length check
    if (tld.length < 2) {
      return "Top-level domain must be at least 2 characters (e.g., .com)";
    }

    if (tld.length > 63) {
      return "Top-level domain is too long (max 63 characters)";
    }

    // Valid TLDs list - only .com allowed
    const validTLDs = ['com'];

    if (!validTLDs.includes(tld.toLowerCase())) {
      return "Invalid top-level domain. Only .com domain is allowed";
    }

    return "";
  };

  const handleNameChange = (e) => {
    let value = e.target.value;
    
    // Auto-capitalize first character
    if (value.length > 0) {
      value = value[0].toUpperCase() + value.slice(1);
    }
    
    setFormState({ ...formState, name: value });
    setNameError(validateFullName(value));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormState({ ...formState, email: value });
    setEmailError(validateEmail(value));
  };

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await adminApi.getStudents();
        const studentsWithId = (response.students || []).map(student => ({
          ...student,
          id: student._id?.toString() || student.id // Map _id to id for frontend use
        }));
        setStudents(studentsWithId);
      } catch (error) {
        setErrorMessage('Unable to load student list.');
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    if (activeSession === 'all') return students;
    return students.filter((student) => student.session === activeSession);
  }, [students, activeSession]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setNameError('');
    setEmailError('');

    if (!formState.name || !formState.email || !formState.session) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Validate name
    const nameValidationError = validateFullName(formState.name);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    // Validate email
    const emailValidationError = validateEmail(formState.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    try {
      const response = await adminApi.addStudent({
        name: formState.name,
        email: formState.email,
        session: formState.session,
      });

      const createdStudent = response.student;
      const initials = createdStudent.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      const colorClasses = [
        'avatar-indigo',
        'avatar-pink',
        'avatar-teal',
        'avatar-blue',
      ];
      const randomColorClass =
        colorClasses[Math.floor(Math.random() * colorClasses.length)];

      const isMorning = createdStudent.session === 'Morning';
      const sessionClass = isMorning ? 'badge-amber' : 'badge-purple';
      const dotClass = isMorning ? 'dot-amber' : 'dot-purple';

      const newStudent = {
        id: createdStudent._id?.toString() || createdStudent._id, // Ensure ID is properly set
        name: createdStudent.name,
        email: createdStudent.email,
        session: createdStudent.session,
        roll: createdStudent.roll,
        initials,
        colorClass: randomColorClass,
        sessionClass,
        dotClass,
      };

      setStudents((prev) => [newStudent, ...prev]);
      setFormState({ name: '', email: '', session: '' });
      setEmailError('');
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || 'Unable to add student. Please try again.'
      );
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await adminApi.deleteStudent(studentId);
      setStudents((prev) => prev.filter((student) => student.id !== studentId));
    } catch (error) {
      // Don't show user not found error here - that's for login page
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && errorMessage.toLowerCase().includes('not found')) {
        setErrorMessage('Unable to delete student. Student may have been already removed.');
      } else {
        setErrorMessage(errorMessage || 'Unable to delete student. Please try again.');
      }
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student.id);
    setEditFormState({
      name: student.name,
      email: student.email,
    });
    setEditNameError('');
    setEditEmailError('');
    setEditErrorMessage('');
  };

  const handleEditNameChange = (e) => {
    let value = e.target.value;
    
    // Auto-capitalize first character
    if (value.length > 0) {
      value = value[0].toUpperCase() + value.slice(1);
    }
    
    setEditFormState({ ...editFormState, name: value });
    setEditNameError(validateFullName(value));
  };

  const handleEditEmailChange = (e) => {
    const value = e.target.value;
    setEditFormState({ ...editFormState, email: value });
    setEditEmailError(validateEmail(value));
  };

  const handleUpdateStudent = async (studentId) => {
    setEditErrorMessage('');
    setEditNameError('');
    setEditEmailError('');

    if (!editFormState.name || !editFormState.email) {
      setEditErrorMessage('Please fill in all fields');
      return;
    }

    // Validate name
    const nameValidationError = validateFullName(editFormState.name);
    if (nameValidationError) {
      setEditNameError(nameValidationError);
      return;
    }

    // Validate email
    const emailValidationError = validateEmail(editFormState.email);
    if (emailValidationError) {
      setEditEmailError(emailValidationError);
      return;
    }

    try {
      const response = await adminApi.updateStudent(studentId, {
        name: editFormState.name,
        email: editFormState.email,
      });

      const updatedStudent = response.student;
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? {
                ...student,
                name: updatedStudent.name,
                email: updatedStudent.email,
                initials: updatedStudent.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase(),
              }
            : student
        )
      );
      setEditingStudent(null);
      setEditFormState({ name: '', email: '' });
    } catch (error) {
      setEditErrorMessage(
        error?.response?.data?.message || 'Unable to update student. Please try again.'
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormState({ name: '', email: '' });
    setEditNameError('');
    setEditEmailError('');
    setEditErrorMessage('');
  };

  return (
    <div className="ms-root">
      <div className="ms-header-row">
        <div>
          <h2 className="ms-title">Manage Students</h2>
          <p className="ms-subtitle">
            Easily add, manage and view all student information here.
          </p>
        </div>
      </div>

      {/* Add New Student */}
      <section className="ms-card">
        <div className="ms-card-h">
          <h3 className="ms-card-t">
            Add New Student
          </h3>
        </div>
        <div className="ms-card-b">
          <form
            className="ms-f-grid"
            onSubmit={handleAddStudent}
          >
            <div className="ms-f-col">
              <label className="ms-lbl">Full Name</label>
              <input
                value={formState.name}
                onChange={handleNameChange}
                className="ms-inp"
                placeholder="Enter student name"
                type="text"
                maxLength="20"
              />
              {nameError && (
                <div className="ms-err">
                  <span className="material-symbols-outlined">error</span>
                  <span>{nameError}</span>
                </div>
              )}
            </div>
            <div className="ms-f-col">
              <label className="ms-lbl">Email Address</label>
              <input
                value={formState.email}
                onChange={handleEmailChange}
                className="ms-inp"
                placeholder="Enter student email"
                type="email"
              />
              {emailError && (
                <div className="ms-err">
                  <span className="material-symbols-outlined">error</span>
                  <span>{emailError}</span>
                </div>
              )}
            </div>
            <div className="ms-f-col">
              <label className="ms-lbl">Session</label>
              <div className="ms-sel-wrap">
                <select
                  value={formState.session}
                  onChange={(e) =>
                    setFormState({ ...formState, session: e.target.value })
                  }
                  className="ms-sel"
                >
                  <option disabled value="">
                    Select Session
                  </option>
                  <option value="morning">Morning Session</option>
                  <option value="evening">Evening Session</option>
                </select>
                <span className="ms-sel-icon">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </div>
            </div>
            <div className="ms-f-col">
              <button
                className="ms-sub-btn"
                type="submit"
              >
                <span className="material-symbols-outlined">add</span>
                <span>Add Student</span>
              </button>
            </div>
            {errorMessage && (
              <div className="ms-err-msg">
                <span className="material-symbols-outlined">error</span>
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Student Directory */}
      <section className="ms-card">
        <div className="ms-card-h ms-tbl-header">
          <h3 className="ms-card-t">Students List</h3>
          <div className="ms-filters">
            <div className="ms-ses-toggle">
              <button
                type="button"
                onClick={() => setActiveSession('all')}
                className={
                  'ms-ses-btn ' +
                  (activeSession === 'all'
                    ? 'ms-ses-btn-active-all'
                    : 'ms-ses-btn-inactive')
                }
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveSession('Morning')}
                className={
                  'ms-ses-btn ' +
                  (activeSession === 'Morning'
                    ? 'ms-ses-btn-active-morning'
                    : 'ms-ses-btn-hover')
                }
              >
                Morning
              </button>
              <button
                type="button"
                onClick={() => setActiveSession('Evening')}
                className={
                  'ms-ses-btn ' +
                  (activeSession === 'Evening'
                    ? 'ms-ses-btn-active-evening'
                    : 'ms-ses-btn-hover')
                }
              >
                Evening
              </button>
            </div>
          </div>
        </div>

        <div className="ms-tbl-wrapper">
          <table className="ms-tbl">
            <thead className="ms-tbl-head">
              <tr>
                <th className="ms-tbl-th">Name</th>
                <th className="ms-tbl-th">Email</th>
                <th className="ms-tbl-th">Session</th>
                <th className="ms-tbl-th">Actions</th>
              </tr>
            </thead>
            <tbody className="ms-tbl-body">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="ms-tbl-row">
                    <td className="ms-tbl-td">
                      {editingStudent === student.id ? (
                        <div className="ms-edit-wrap">
                          <input
                            value={editFormState.name}
                            onChange={handleEditNameChange}
                            className="ms-edit-inp"
                            placeholder="Enter student name"
                            type="text"
                            maxLength="20"
                          />
                          {editNameError && (
                            <div className="ms-edit-err">
                              <span className="material-symbols-outlined">error</span>
                              <span>{editNameError}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="ms-st-cell">
                          <div
                            className={
                              'ms-st-avatar ' + student.colorClass
                            }
                          >
                            {student.initials}
                          </div>
                          <div className="ms-st-name">
                            {student.name}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="ms-tbl-td">
                      {editingStudent === student.id ? (
                        <div className="ms-edit-wrap">
                          <input
                            value={editFormState.email}
                            onChange={handleEditEmailChange}
                            className="ms-edit-inp"
                            placeholder="Enter student email"
                            type="email"
                          />
                          {editEmailError && (
                            <div className="ms-edit-err">
                              <span className="material-symbols-outlined">error</span>
                              <span>{editEmailError}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        student.email
                      )}
                    </td>
                    <td className="ms-tbl-td">
                      <span
                        className={
                          'ms-badge ' + student.sessionClass
                        }
                      >
                        <span
                          className={
                            'ms-dot ' + student.dotClass
                          }
                        />
                        {student.session}
                      </span>
                    </td>
                    <td className="ms-tbl-td">
                      {editingStudent === student.id ? (
                        <div className="ms-act-btns">
                          <button
                            onClick={() => handleUpdateStudent(student.id)}
                            className="ms-sv-btn"
                            title="Save changes"
                          >
                            <span className="material-symbols-outlined">check</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="ms-cel-btn"
                            title="Cancel edit"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="ms-act-btns">
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="ms-ed-btn"
                            title="Edit student"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="ms-del-btn"
                            title="Delete student"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="ms-tbl-empty"
                  >
                    {activeSession === 'all'
                      ? 'No students found. Add one above.'
                      : `No ${activeSession.toLowerCase()} session students found.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ms-tbl-footer">
          <p>
            Showing{' '}
            <span className="ms-ft-count">
              {activeSession === 'all'
                ? students.length
                : filteredStudents.length}
            </span>{' '}
            {activeSession === 'all'
              ? 'students'
              : `${activeSession} session students`}
          </p>
        </div>
        {editErrorMessage && (
          <div className="ms-err-msg">
            <span className="material-symbols-outlined">error</span>
            <span>{editErrorMessage}</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageStudents;