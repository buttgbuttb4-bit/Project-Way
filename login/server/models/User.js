import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'teacher', 'student'],
  },
  password: { type: String },
  session: { type: String },
  roll: { type: String },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createJWT = function () {
  const secret = process.env.JWT_SECRET || 'change-me';
  return jwt.sign({ id: this._id, role: this.role }, secret, {
    expiresIn: '8h',
  });
};

export const User = mongoose.model('User', userSchema);

export async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin user.');
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase(), role: 'admin' });
  if (!existingAdmin) {
    await User.create({
      name: 'ProjectWay Admin',
      email: adminEmail.toLowerCase(),
      role: 'admin',
      password: adminPassword,
    });
    console.log('Admin user seeded.');
  }
}

export default User;
