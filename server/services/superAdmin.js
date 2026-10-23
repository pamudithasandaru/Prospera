const crypto = require('crypto');

const SUPER_ADMIN_ID = 'superadmin';

// Credentials live in server config (env), never in the users table.
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
    id: SUPER_ADMIN_ID,
    _id: SUPER_ADMIN_ID,
    name: 'Super Admin',
    email,
    role: 'admin',
    language: 'EN',
    avatar: 'https://i.pravatar.cc/150?img=14',
    connectionCount: 0,
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

/**
 * Foreign keys mean the super admin needs a real row before it can own posts,
 * tickets or anything else. The row exists purely for referential integrity:
 * its password hash is random and never compared, so the only way in stays the
 * env-based credential check in isSuperAdminCredentials().
 */
async function ensureSuperAdminRow(prisma) {
  const { email } = getCredentials();
  if (!email) return; // super admin disabled

  const unusableHash = `disabled:${crypto.randomBytes(32).toString('hex')}`;
  try {
    await prisma.user.upsert({
      where: { id: SUPER_ADMIN_ID },
      update: { email, name: 'Super Admin', role: 'admin' },
      create: {
        id: SUPER_ADMIN_ID,
        email,
        name: 'Super Admin',
        role: 'admin',
        language: 'EN',
        avatar: 'https://i.pravatar.cc/150?img=14',
        passwordHash: unusableHash,
      },
    });
  } catch (err) {
    // P2002: SUPERADMIN_EMAIL collides with a regular account's address.
    // Warn rather than refusing to boot — env-based admin login still works,
    // but writes made as the super admin would fail on the missing row.
    if (err.code === 'P2002') {
      console.warn(
        `SUPERADMIN_EMAIL (${email}) is already used by another account. ` +
        'Change it so the super admin can own records.'
      );
      return;
    }
    throw err;
  }
}

module.exports = {
  SUPER_ADMIN_ID,
  getSuperAdminUser,
  isSuperAdminCredentials,
  isSuperAdminId,
  ensureSuperAdminRow,
};
