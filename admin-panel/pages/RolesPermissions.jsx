import React, { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import '../styles/RolesPermissions.css';

const INITIAL_ROLES = [
  {
    id: '2',
    name: 'Teacher',
    description: 'Standard access for teaching staff',
    permissions: [
      'idea.upload',
      'progress.track',
      'idea.review',
      'idea.viewdashboard'
    ],
    icon: 'person_apron',
    colorClass: 'role-avatar-primary',
  },
  {
    id: '3',
    name: 'Student',
    description: 'Limited Access',
    permissions: ['progress.track', 'diagram.create', 'idea.submit', 'help.view'],
    icon: 'school',
    colorClass: 'role-avatar-neutral',
  },
];

const PERMISSION_GROUPS = {
  '2': [ // Teacher permissions
    {
      name: 'Teacher Permissions',
      icon: 'school',
      perms: [
        'idea.upload',
        'progress.track',
        'idea.review',
        'idea.viewdashboard'
      ],
    },
  ],
  '3': [ // Student permissions
    {
      name: 'Student Permissions',
      icon: 'person_apron',
      perms: [
        'progress.track',
        'diagram.create',
        'idea.submit',
        'help.view'
      ],
    },
  ],
};

const RolesPermissions = () => {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState('2');
  const [formData, setFormData] = useState(INITIAL_ROLES[0]);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await adminApi.getRoles();
        if (response.roles && response.roles.length > 0) {
          const loadedRoles = response.roles.map((role) => ({
            ...role,
            id: role.roleId || role._id || role.id,
          }));
          setRoles(loadedRoles);
          setSelectedRoleId(loadedRoles[0]?.id || '2');
        }
      } catch (error) {
        console.error('Failed to load roles', error);
      }
    };

    loadRoles();
  }, []);

  useEffect(() => {
    const role = roles.find((r) => r.id === selectedRoleId);
    if (role) {
      setFormData({ ...role });
    }
  }, [selectedRoleId, roles]);

  const handleSave = async () => {
    if (!formData.name) return;
    try {
      const response = await adminApi.updateRole(formData.id, {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      });
      const updatedRole = {
        ...response.role,
        id: response.role.roleId || response.role._id || response.role.id,
      };
      const updatedRoles = roles.map((r) =>
        r.id === updatedRole.id ? updatedRole : r
      );
      setRoles(updatedRoles);
      // Update localStorage with new roles
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
      // Dispatch custom event to notify other tabs/windows
      window.dispatchEvent(new Event('storage'));
      setSaveMessage('Permissions saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save role', error);
      setSaveMessage('Failed to save permissions.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const togglePermission = (perm) => {
    const isChecked = formData.permissions.includes(perm);
    const newPerms = isChecked
      ? formData.permissions.filter((p) => p !== perm)
      : [...formData.permissions, perm];
    setFormData({ ...formData, permissions: newPerms });
  };

  return (
    <div className="rp-root">
      <div className="rp-header-row">
        <div>
          <h2 className="rp-title">Roles & Permissions</h2>
          <p className="rp-subtitle">
            Easily manage all user roles, permissions and access control from here.
          </p>
        </div>
      </div>

      <div className="rp-main-layout">
        {/* Sidebar List */}
        <div className="rp-sidebar-wrap">
          <div className="rp-sidebar-card">
            <div className="rp-sidebar-card-header">
              <h3>All Roles</h3>
            </div>
            <div className="rp-sidebar-list">
              {roles.map((role) => {
                const isActive = selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={
                      'rp-sidebar-item ' +
                      (isActive
                        ? 'rp-sidebar-item-active'
                        : 'rp-sidebar-item-hover')
                    }
                  >
                    <div className="rp-sidebar-item-left">
                      <div
                        className={
                          'rp-avatar ' +
                          (isActive ? 'role-avatar-selected' : role.colorClass)
                        }
                      >
                        <span className="material-symbols-outlined rp-avatar-icon">
                          {role.icon}
                        </span>
                      </div>
                      <div>
                        <div
                          className={
                            'rp-sidebar-name ' +
                            (isActive
                              ? 'rp-sidebar-name-active'
                              : 'rp-sidebar-name-normal')
                          }
                        >
                          {role.name}
                        </div>
                        <div
                          className={
                            'rp-sidebar-perm-count ' +
                            (isActive
                              ? 'rp-sidebar-perm-count-active'
                              : 'rp-sidebar-perm-count-normal')
                          }
                        >
                          {role.permissions.includes('all')
                            ? 'Full Access'
                            : `${role.permissions.length} Permissions`}
                        </div>
                      </div>
                    </div>
                    <div className="rp-sidebar-item-right">
                      {!isActive && (
                        <span className="material-symbols-outlined rp-chevron">
                          chevron_right
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Edit Area */}
        <div className="rp-editor-card">
          <div className="rp-editor-header">
            <div className="rp-editor-header-left">
              <div className="rp-editor-header-icon">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h3 className="rp-editor-title">
                  {formData.name}
                </h3>
                <p className="rp-editor-subtitle">
                  {formData.description}
                </p>
              </div>
            </div>
          </div>

          <div className="rp-editor-body">
            <div className="rp-editor-body-inner">
              {formData.isSystem && (
                <div className="rp-system-alert">
                  <span className="material-symbols-outlined">warning</span>
                  <span>
                    This is a system role. Some permissions cannot be modified
                    to prevent lockout.
                  </span>
                </div>
              )}

              <div>
                <h4 className="rp-perm-heading">
                  Permissions Configuration
                </h4>

                {formData.permissions.includes('all') ? (
                  <div className="rp-full-access-card">
                    <span className="material-symbols-outlined rp-full-access-icon">
                      lock_open
                    </span>
                    <p className="rp-full-access-title">
                      Full Access Granted
                    </p>
                    <p className="rp-full-access-sub">
                      Super Administrators have access to all system modules by
                      default.
                    </p>
                  </div>
                ) : (
                  <div className="rp-perm-list">
                    {PERMISSION_GROUPS[selectedRoleId]?.flatMap((group) => group.perms).map((perm) => (
                      <label
                        key={perm}
                        className="rp-perm-item"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                          className="rp-perm-checkbox"
                        />
                        <span className="rp-perm-code">
                          {perm}
                        </span>
                      </label>
                    ))}
                    <button
                      onClick={handleSave}
                      className="rp-save-btn"
                    >
                      <span className="material-symbols-outlined">save</span>
                      <span>Save Permissions</span>
                    </button>
                    {saveMessage && (
                      <div className="rp-save-message">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span>{saveMessage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
