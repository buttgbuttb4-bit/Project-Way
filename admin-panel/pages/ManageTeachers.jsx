import React, { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import '../styles/ManageTeachers.css';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState(teachers);
  const [errorMessage, setErrorMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [editingTeacher, setEditingTeacher] = useState(null);
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
    
    setNewName(value);
    setNameError(validateFullName(value));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setNewEmail(value);
    setEmailError(validateEmail(value));
  };

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await adminApi.getTeachers();
        const teachersWithId = (response.teachers || []).map(teacher => ({
          ...teacher,
          id: teacher._id // Map _id to id for frontend use
        }));
        setTeachers(teachersWithId);
        setFilteredTeachers(teachersWithId);
      } catch (error) {
        setErrorMessage('Unable to load teacher list.');
      }
    };
    loadTeachers();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setNameError("");
    setEmailError("");

    if (!newName || !newEmail) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    // Validate name
    const nameValidationError = validateFullName(newName);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    // Validate email
    const emailValidationError = validateEmail(newEmail);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    try {
      const response = await adminApi.addTeacher({
        name: newName,
        email: newEmail,
      });
      const createdTeacher = response.teacher;
      const initials = createdTeacher.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      const colorClasses = [
        'tch-avatar-blue',
        'tch-avatar-amber',
        'tch-avatar-emerald',
        'tch-avatar-purple',
        'tch-avatar-pink',
        'tch-avatar-indigo',
      ];
      const randomColorClass =
        colorClasses[Math.floor(Math.random() * colorClasses.length)];

      const newTeacher = {
        id: createdTeacher._id?.toString() || createdTeacher._id, // Ensure ID is properly set
        name: createdTeacher.name,
        email: createdTeacher.email,
        initials,
        colorClass: randomColorClass,
      };

      setTeachers((prev) => [newTeacher, ...prev]);
      setFilteredTeachers((prev) => [newTeacher, ...prev]);
      setNewName('');
      setNewEmail('');
      setEmailError('');
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || 'Unable to add teacher. Please try again.'
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteTeacher(id);
      const updatedTeachers = teachers.filter((t) => t.id !== id);
      setTeachers(updatedTeachers);
      
      // Also update filtered teachers
      const updatedFiltered = filteredTeachers.filter((t) => t.id !== id);
      setFilteredTeachers(updatedFiltered);
    } catch (error) {
      // Don't show user not found error here - that's for login page
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && errorMessage.toLowerCase().includes('not found')) {
        setErrorMessage('Unable to delete teacher. Teacher may have been already removed.');
      } else {
        setErrorMessage(errorMessage || 'Unable to delete teacher. Please try again.');
      }
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher.id);
    setEditFormState({
      name: teacher.name,
      email: teacher.email,
    });
    setEditNameError('');
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

  const handleUpdateTeacher = async (teacherId) => {
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
      const response = await adminApi.updateTeacher(teacherId, {
        name: editFormState.name,
        email: editFormState.email,
      });

      const updatedTeacher = response.teacher;
      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === teacherId
            ? {
                ...teacher,
                name: updatedTeacher.name,
                email: updatedTeacher.email,
                initials: updatedTeacher.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase(),
              }
            : teacher
        )
      );
      setFilteredTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === teacherId
            ? {
                ...teacher,
                name: updatedTeacher.name,
                email: updatedTeacher.email,
                initials: updatedTeacher.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase(),
              }
            : teacher
        )
      );
      setEditingTeacher(null);
      setEditFormState({ name: '', email: '' });
    } catch (error) {
      setEditErrorMessage(
        error?.response?.data?.message || 'Unable to update teacher. Please try again.'
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingTeacher(null);
    setEditFormState({ name: '', email: '' });
    setEditNameError('');
    setEditEmailError('');
    setEditErrorMessage('');
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Auto-filter as user types
    const filtered = teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTeachers(filtered);
  };

  return (
    <div className="mt-root">
      <div className="mt-header-row">
        <div>
          <h2 className="mt-title">Manage Teachers</h2>
          <p className="mt-subtitle">
            Easily add, manage and view all teacher information here.
          </p>
        </div>
      </div>

      {/* Add New Teacher */}
      <section className="mt-card">
        <div className="mt-card-header">
          <h3 className="mt-card-title">Add New Teacher</h3>
        </div>
        <div className="mt-card-body">
          <form
            className="mt-form"
            onSubmit={handleAddTeacher}
          >
            <div className="mt-form-col">
              <label className="mt-label">Full Name</label>
              <input
                value={newName}
                onChange={handleNameChange}
                className="mt-input"
                placeholder="Enter teacher full name"
                type="text"
                maxLength="20"
              />
              {nameError && (
                <div className="mt-err">
                  <span className="material-symbols-outlined">error</span>
                  <span>{nameError}</span>
                </div>
              )}
            </div>
            <div className="mt-form-col">
              <label className="mt-label">Email</label>
              <input
                value={newEmail}
                onChange={handleEmailChange}
                className="mt-input"
                placeholder="Enter teacher email"
                type="email"
              />
              {emailError && (
                <div className="mt-err">
                  <span className="material-symbols-outlined">error</span>
                  <span>{emailError}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="mt-add-btn"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Add Teacher</span>
            </button>
            {errorMessage && (
              <div className="mt-err-msg">
                <span className="material-symbols-outlined">error</span>
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Existing Teachers */}
      <section className="mt-table-card">
        <div className="mt-table-header">
          <h3 className="mt-card-title">Teachers List</h3>
          <div className="mt-search-wrapper">
            <span className="mt-search-icon">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="mt-search-input"
              placeholder="Search teachers..."
              type="text"
            />
          </div>
        </div>

        <div className="mt-table-wrapper">
          <table className="mt-table">
            <thead className="mt-thead">
              <tr>
                <th className="mt-th">Name</th>
                <th className="mt-th">Email</th>
                <th className="mt-th">Actions</th>
              </tr>
            </thead>
            <tbody className="mt-tbody">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="mt-row"
                  >
                    <td className="mt-td">
                      {editingTeacher === teacher.id ? (
                        <div className="mt-edit-wrap">
                          <input
                            value={editFormState.name}
                            onChange={handleEditNameChange}
                            className="mt-edit-inp"
                            placeholder="Enter teacher name"
                            type="text"
                            maxLength="20"
                          />
                          {editNameError && (
                            <div className="mt-edit-err">
                              <span className="material-symbols-outlined">error</span>
                              <span>{editNameError}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-name-cell">
                          <div
                            className={
                              "mt-avatar " + teacher.colorClass
                            }
                          >
                            {teacher.initials}
                          </div>
                          <span className="mt-name">
                            {teacher.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="mt-td">
                      {editingTeacher === teacher.id ? (
                        <div className="mt-edit-wrap">
                          <input
                            value={editFormState.email}
                            onChange={handleEditEmailChange}
                            className="mt-edit-inp"
                            placeholder="Enter teacher email"
                            type="email"
                          />
                          {editEmailError && (
                            <div className="mt-edit-err">
                              <span className="material-symbols-outlined">error</span>
                              <span>{editEmailError}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        teacher.email
                      )}
                    </td>
                    <td className="mt-td">
                      {editingTeacher === teacher.id ? (
                        <div className="mt-act-btns">
                          <button
                            onClick={() => handleUpdateTeacher(teacher.id)}
                            className="mt-sv-btn"
                            title="Save changes"
                          >
                            <span className="material-symbols-outlined">check</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="mt-cel-btn"
                            title="Cancel edit"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="mt-act-btns">
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            className="mt-ed-btn"
                            title="Edit teacher"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="mt-del-btn"
                            title="Delete teacher"
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
                    colSpan={3}
                    className="mt-empty"
                  >
                    No teachers found. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-footer">
          <span className="mt-footer-text">
            Showing {filteredTeachers.length} teachers
          </span>
        </div>
        {editErrorMessage && (
          <div className="mt-err-msg">
            <span className="material-symbols-outlined">error</span>
            <span>{editErrorMessage}</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageTeachers;