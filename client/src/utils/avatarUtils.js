/**
 * src/utils/avatarUtils.js
 *
 * Single source of truth for resolving a user's display avatar.
 *
 * Supported input shapes:
 *  - Standard user: { profile: { profilePicture }, avatar, photoURL }
 *  - Notification:  { senderAvatar, ... }
 *  - Post embed:    { user: { avatar, profile: { profilePicture } } }
 *
 * Priority (highest → lowest):
 *  1. profile.profilePicture  — user-uploaded photo via profile edit
 *  2. profile.avatar          — some OAuth flows store it here
 *  3. photoURL                — Google/Firebase Auth field
 *  4. senderAvatar            — used in notification objects
 *  5. avatar                  — system-assigned default (pravatar placeholder)
 *
 * Falls back to '' which causes MUI Avatar to show the initials letter.
 */
export const resolveAvatar = (userObj) => {
  if (!userObj) return '';
  return (
    userObj?.profile?.profilePicture ||
    userObj?.profile?.avatar ||
    userObj?.photoURL ||
    userObj?.senderAvatar ||
    userObj?.avatar ||
    ''
  );
};

/**
 * Normalise a post's embedded author object to the canonical shape.
 * Posts may use post.user OR post.author depending on when they were created.
 * Returns the user object with a resolvedAvatar convenience field.
 */
export const resolvePostUser = (post) => {
  const u = post?.user || post?.author || {};
  return {
    ...u,
    resolvedAvatar: resolveAvatar(u),
  };
};
