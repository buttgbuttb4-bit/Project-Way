import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  roleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  permissions: { type: [String], default: [] },
  icon: { type: String, default: 'verified_user' },
  colorClass: { type: String, default: 'role-avatar-neutral' },
  isSystem: { type: Boolean, default: false },
});

export const Role = mongoose.model('Role', roleSchema);

export async function seedRoles() {
  const existingRoles = await Role.find({});
  if (existingRoles.length > 0) {
    return;
  }

  const initialRoles = [
    {
      roleId: '2',
      name: 'Teacher',
      description: 'Standard access for teaching staff',
      permissions: ['idea.upload', 'progress.track', 'idea.review', 'idea.viewdashboard'],
      icon: 'person_apron',
      colorClass: 'role-avatar-primary',
      isSystem: true,
    },
    {
      roleId: '3',
      name: 'Student',
      description: 'Limited access for students',
      permissions: ['progress.track', 'diagram.create', 'idea.submit', 'help.view'],
      icon: 'school',
      colorClass: 'role-avatar-neutral',
      isSystem: true,
    },
  ];

  await Role.insertMany(initialRoles);
  console.log('Seeded default roles.');
}

export default Role;
