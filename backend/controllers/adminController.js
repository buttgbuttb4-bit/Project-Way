import { User } from '../models/User.js';
import { Role } from '../models/Role.js';

export async function getDashboard(req, res, next) {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const roleCount = await Role.countDocuments();

    res.json({ studentCount, teacherCount, roleCount });
  } catch (error) {
    next(error);
  }
}

export async function getTeachers(req, res, next) {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('_id name email role session roll createdAt');
    res.json({ teachers });
  } catch (error) {
    next(error);
  }
}

export async function addTeacher(req, res, next) {
  try {
    const { name, email } = req.body;
    console.log(`\n=== ADD TEACHER ATTEMPT ===`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);

    if (!name || !email) {
      console.log(`❌ Failed: Name and email are required`);
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail, role: 'teacher' });
    if (existing) {
      console.log(`❌ Failed: Teacher with email ${normalizedEmail} already exists`);
      return res.status(409).json({ message: 'Teacher with that email already exists' });
    }

    const teacher = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      role: 'teacher',
    });

    console.log(`✅ Teacher Added Successfully!`);
    console.log(`  - Name: ${teacher.name}`);
    console.log(`  - Email: ${teacher.email}`);
    console.log(`  - Role: ${teacher.role}`);
    console.log(`========================\n`);

    res.status(201).json({ teacher: { id: teacher._id?.toString() || teacher._id, name: teacher.name, email: teacher.email, role: teacher.role } });
  } catch (error) {
    console.log(`❌ Add Teacher Error: ${error.message}`);
    next(error);
  }
}

export async function getStudents(req, res, next) {
  try {
    const students = await User.find({ role: 'student' }).select('_id name email role session roll createdAt');
    res.json({ students });
  } catch (error) {
    next(error);
  }
}

export async function addStudent(req, res, next) {
  try {
    const { name, email, session } = req.body;
    console.log(`\n=== ADD STUDENT ATTEMPT ===`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Session: ${session}`);

    if (!name || !email || !session) {
      console.log(`❌ Failed: Name, email, and session are required`);
      return res.status(400).json({ message: 'Name, email, and session are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail, role: 'student' });
    if (existing) {
      console.log(`❌ Failed: Student with email ${normalizedEmail} already exists`);
      return res.status(409).json({ message: 'Student with that email already exists' });
    }

    const roll = `EDU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      role: 'student',
      session: session === 'morning' ? 'Morning' : 'Evening',
      roll,
    });

    console.log(`✅ Student Added Successfully!`);
    console.log(`  - Name: ${student.name}`);
    console.log(`  - Email: ${student.email}`);
    console.log(`  - Role: ${student.role}`);
    console.log(`  - Session: ${student.session}`);
    console.log(`  - Roll: ${student.roll}`);
    console.log(`========================\n`);

    res.status(201).json({
      student: {
        id: student._id?.toString() || student._id,
        name: student.name,
        email: student.email,
        session: student.session,
        roll: student.roll,
      },
    });
  } catch (error) {
    console.log(`❌ Add Student Error: ${error.message}`);
    next(error);
  }
}

export async function getRoles(req, res, next) {
  try {
    const roles = await Role.find({});
    res.json({ roles });
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req, res, next) {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    console.log(`\n=== UPDATE ROLE ATTEMPT ===`);
    console.log(`Role ID: ${roleId}`);
    console.log(`Name: ${name}`);
    console.log(`Description: ${description}`);
    console.log(`Permissions: ${JSON.stringify(permissions)}`);

    const role = await Role.findOne({ roleId });
    if (!role) {
      console.log(`❌ Failed: Role not found with ID: ${roleId}`);
      return res.status(404).json({ message: 'Role not found' });
    }

    console.log(`Current Role Data:`);
    console.log(`  - Name: ${role.name}`);
    console.log(`  - Description: ${role.description}`);
    console.log(`  - Permissions: ${JSON.stringify(role.permissions)}`);

    if (name) role.name = name;
    if (description) role.description = description;
    if (Array.isArray(permissions)) role.permissions = permissions;

    await role.save();

    console.log(`✅ Role Updated Successfully!`);
    console.log(`  - Name: ${role.name}`);
    console.log(`  - Description: ${role.description}`);
    console.log(`  - Permissions: ${JSON.stringify(role.permissions)}`);
    console.log(`==========================\n`);

    res.json({ role });
  } catch (error) {
    console.log(`❌ Update Role Error: ${error.message}`);
    next(error);
  }
}

export async function getRolesPublic(req, res, next) {
  try {
    const roles = await Role.find({});
    res.json({ roles });
  } catch (error) {
    next(error);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    console.log(`\n=== DELETE STUDENT ATTEMPT ===`);
    console.log(`Student ID: ${studentId}`);

    const student = await User.findByIdAndDelete(studentId);
    if (!student) {
      console.log(`❌ Failed: Student not found with ID: ${studentId}`);
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log(`✅ Student Deleted Successfully!`);
    console.log(`  - Name: ${student.name}`);
    console.log(`  - Email: ${student.email}`);
    console.log(`  - Role: ${student.role}`);
    console.log(`===========================\n`);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.log(`❌ Delete Student Error: ${error.message}`);
    next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    const { name, email } = req.body;
    console.log(`\n=== UPDATE STUDENT ATTEMPT ===`);
    console.log(`Student ID: ${studentId}`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);

    const student = await User.findById(studentId);
    if (!student) {
      console.log(`❌ Failed: Student not found with ID: ${studentId}`);
      return res.status(404).json({ message: 'Student not found' });
    }

    if (name) student.name = name.trim();
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      student.email = normalizedEmail;
    }

    await student.save();

    console.log(`✅ Student Updated Successfully!`);
    console.log(`  - Name: ${student.name}`);
    console.log(`  - Email: ${student.email}`);
    console.log(`  - Role: ${student.role}`);
    console.log(`===========================\n`);

    res.json({ student: { id: student._id?.toString() || student._id, name: student.name, email: student.email, role: student.role, session: student.session } });
  } catch (error) {
    console.log(`❌ Update Student Error: ${error.message}`);
    next(error);
  }
}

export async function deleteTeacher(req, res, next) {
  try {
    const { teacherId } = req.params;
    console.log(`\n=== DELETE TEACHER ATTEMPT ===`);
    console.log(`Teacher ID: ${teacherId}`);

    const teacher = await User.findByIdAndDelete(teacherId);
    if (!teacher) {
      console.log(`❌ Failed: Teacher not found with ID: ${teacherId}`);
      return res.status(404).json({ message: 'Teacher not found' });
    }

    console.log(`✅ Teacher Deleted Successfully!`);
    console.log(`  - Name: ${teacher.name}`);
    console.log(`  - Email: ${teacher.email}`);
    console.log(`  - Role: ${teacher.role}`);
    console.log(`===========================\n`);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.log(`❌ Delete Teacher Error: ${error.message}`);
    next(error);
  }
}

export async function updateTeacher(req, res, next) {
  try {
    const { teacherId } = req.params;
    const { name, email } = req.body;
    console.log(`\n=== UPDATE TEACHER ATTEMPT ===`);
    console.log(`Teacher ID: ${teacherId}`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      console.log(`❌ Failed: Teacher not found with ID: ${teacherId}`);
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (name) teacher.name = name.trim();
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      teacher.email = normalizedEmail;
    }

    await teacher.save();

    console.log(`✅ Teacher Updated Successfully!`);
    console.log(`  - Name: ${teacher.name}`);
    console.log(`  - Email: ${teacher.email}`);
    console.log(`  - Role: ${teacher.role}`);
    console.log(`===========================\n`);

    res.json({ teacher: { id: teacher._id, name: teacher.name, email: teacher.email, role: teacher.role } });
  } catch (error) {
    console.log(`❌ Update Teacher Error: ${error.message}`);
    next(error);
  }
}
