import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
  if (!password) throw new Error('Password is required');
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (enteredPassword, hashedPassword) => {
  if (!enteredPassword || !hashedPassword) return false;
  if (hashedPassword.startsWith('SOCIAL_LOGIN_')) return false;
  return bcrypt.compare(enteredPassword, hashedPassword);
};

export default { hashPassword, comparePassword };
