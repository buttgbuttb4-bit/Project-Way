import { User } from '../models/User.js';

export async function checkUser(req, res, next) {
  try {
    const { name } = req.params;
    const user = await User.findOne({ name });
    if (user) {
      return res.json({ exists: true, name: user.name });
    }
    return res.json({ exists: false, name });
  } catch (error) {
    console.log(`❌ Check User Error: ${error.message}`);
    next(error);
  }
}

export async function getUserGroup(req, res, next) {
  try {
    const { name } = req.params;
    const user = await User.findOne({ name });
    if (user) {
      return res.json({ groupId: user.groupId });
    }
    return res.json({ groupId: null });
  } catch (error) {
    console.log(`❌ Get User Group Error: ${error.message}`);
    next(error);
  }
}

export async function getUserSession(req, res, next) {
  try {
    const { name } = req.params;
    const user = await User.findOne({ name });
    if (user) {
      return res.json({ session: user.session });
    }
    return res.json({ session: null });
  } catch (error) {
    console.log(`❌ Get User Session Error: ${error.message}`);
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    console.log(`\n=== LOGIN ATTEMPT ===`);
    console.log(`Email: ${email}`);
    console.log(`Selected Role: ${role}`);

    if (!email || !role) {
      console.log(`❌ Login Failed: Email and role are required`);
      return res.status(400).json({ message: 'Email and role are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    // Find by email first so we can give a clear role-mismatch message
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`❌ Login Failed: User not found with email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'User not found with this email. Please contact your administrator.' });
    }

    console.log(`User Found in Database:`);
    console.log(`  - Name: ${user.name}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Role: ${user.role}`);

    if (user.role !== role) {
      console.log(`❌ Login Failed: Role mismatch - User role is '${user.role}' but selected '${role}'`);
      return res.status(401).json({ message: 'Selected role does not match this email' });
    }

    // Role matches — validate password when required
    if (role === 'admin') {
      if (!password) {
        console.log(`❌ Login Failed: Password required for admin login`);
        return res.status(400).json({ message: 'Password is required for admin login' });
      }
      console.log(`Comparing passwords for admin:`);
      console.log(`  - Input password: "${password}"`);
      console.log(`  - Stored password hash: "${user.password}"`);
      const isValid = await user.comparePassword(password);
      console.log(`  - Password comparison result: ${isValid}`);
      if (!isValid) {
        console.log(`❌ Login Failed: Invalid password for admin`);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else if (user.password) {
      const isValid = await user.comparePassword(password || '');
      if (!isValid) {
        console.log(`❌ Login Failed: Invalid password`);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    const token = user.createJWT();
    console.log(`✅ Login Successful!`);
    console.log(`  - Name: ${user.name}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Role: ${user.role}`);
    console.log(`====================\n`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(`❌ Login Error: ${error.message}`);
    next(error);
  }
}
