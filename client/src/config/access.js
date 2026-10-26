/**
 * client/src/config/access.js
 *
 * Single source of truth for "who can open what".
 *
 * Before this existed the same rules were written three times — in the
 * <ProtectedRoute> props in App.js, in Navbar's `menuItems`, and in
 * Dashboard's `quickActions` — and they had already drifted apart. Every
 * consumer now reads this table instead, so a rule changes in one place.
 *
 * The table is deliberately plain data (no JSX): Navbar maps `icon` keys to
 * MUI elements itself, which keeps this module importable from anywhere.
 *
 * NOTE: this is UX only. It decides what the browser offers, never what the
 * data layer hands out — the server re-checks every request. See
 * server/middleware/auth.js.
 */

/** The role a visitor carries before they sign in. Never a real account role. */
export const GUEST_ROLE = 'guest';

/** Account roles, matching the `Role` enum in prisma/schema.prisma. */
export const ROLES = ['farmer', 'buyer', 'consultant', 'expert', 'admin'];

/** Open to everyone, signed in or not. */
export const PUBLIC = 'public';

/** Any signed-in account, whatever its role. */
export const AUTH = 'auth';

/**
 * `access` is one of PUBLIC, AUTH, or an array of roles.
 * `nav` marks the entries that belong in the main navigation, in this order.
 */
export const ROUTES = [
  { path: '/',            access: PUBLIC },
  { path: '/login',       access: PUBLIC },
  { path: '/register',    access: PUBLIC },
  { path: '/unauthorized',access: PUBLIC },

  { path: '/dashboard',   access: AUTH,                   nav: true, title: 'Dashboard',         icon: 'dashboard' },
  { path: '/admin',       access: ['admin'],              nav: true, title: 'Admin Panel',       icon: 'admin' },
  { path: '/farm',        access: ['farmer'],             nav: true, title: 'Farm Management',   icon: 'farm' },
  { path: '/farm/expert', access: ['expert', 'consultant'] },

  // Browsing is open; posting, trading, enrolling and applying all need an
  // account — those checks live in the pages and on the server, not here.
  { path: '/market',      access: PUBLIC,                 nav: true, title: 'Wholesale Market',  icon: 'market' },
  { path: '/social',      access: PUBLIC,                 nav: true, title: 'AgriLink Social',   icon: 'social' },
  { path: '/learning',    access: PUBLIC,                 nav: true, title: 'Learning Hub',      icon: 'learning' },
  { path: '/marketplace', access: PUBLIC,                 nav: true, title: 'Marketplace',       icon: 'marketplace' },
  { path: '/government',  access: PUBLIC,                 nav: true, title: 'Government Portal', icon: 'government' },
  { path: '/weather',     access: PUBLIC,                 nav: true, title: 'Weather',           icon: 'weather' },
  { path: '/learning/course/:courseId', access: PUBLIC },
  { path: '/learning/courses/:id',      access: PUBLIC },

  { path: '/ai-tools',    access: ['farmer', 'expert', 'consultant'], nav: true, title: 'AI Tools Lab', icon: 'ai' },
  { path: '/fintech',     access: ['farmer'],             nav: true, title: 'AgriFinTech',       icon: 'fintech' },
  { path: '/support',     access: AUTH,                   nav: true, title: 'Support',           icon: 'support' },

  { path: '/profile',       access: AUTH },
  { path: '/messages',      access: AUTH },
  { path: '/notifications', access: AUTH },
  { path: '/search',        access: AUTH },
];

const BY_PATH = ROUTES.reduce((acc, r) => ({ ...acc, [r.path]: r }), {});

/** The access rule for a path, or AUTH when the path is unknown (fail closed). */
export const accessFor = (path) => BY_PATH[path]?.access ?? AUTH;

/**
 * Can a visitor with this role open a route?
 *
 * `role` is GUEST_ROLE for signed-out visitors, so a guest satisfies PUBLIC
 * and nothing else. Admins pass every role list — the server agrees, see
 * `requireRole` in server/middleware/auth.js.
 */
export const canAccess = (access, role) => {
  if (access === PUBLIC) return true;
  if (!role || role === GUEST_ROLE) return false;
  if (access === AUTH) return true;
  if (role === 'admin') return true;
  return Array.isArray(access) && access.includes(role);
};

/** Nav entries this role may open, in table order. */
export const navItemsFor = (role) =>
  ROUTES.filter((r) => r.nav && canAccess(r.access, role));
