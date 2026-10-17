const crypto = require('crypto');

const SUPER_ADMIN_ID = 'superadmin';

// Credentials live in server config (env), never in the users collection.
// If either value is unset the super admin login is disabled.
const getCredentials = () => ({
  email: (process.env.SUPERADMIN_EMAIL || '').trim().toLowerCase(),
  password: process.env.SUPERADMIN_PASSWORD || '',
});

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const getSuperAdminUser = () => {
  const { email } = getCredentials();
  return {
    _id: SUPER_ADMIN_ID,
    name: 'Super Admin',
    email,
    role: 'superadmin',
    language: 'EN',
    avatar: 'https://i.pravatar.cc/150?img=14',
  };
};

const isSuperAdminCredentials = (email, password) => {
  const creds = getCredentials();
  if (!creds.email || !creds.password) return false;
  const emailOk = safeEqual((email || '').trim().toLowerCase(), creds.email);
  const passOk = safeEqual(password || '', creds.password);
  return emailOk && passOk;
};

const isSuperAdminId = (id) => id === SUPER_ADMIN_ID && !!getCredentials().email;

module.exports = { SUPER_ADMIN_ID, getSuperAdminUser, isSuperAdminCredentials, isSuperAdminId };
