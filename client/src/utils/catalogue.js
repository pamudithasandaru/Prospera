/**
 * src/utils/catalogue.js
 *
 * Formatting and image fallbacks shared by the two catalogues — the wholesale
 * market (`pages/market`) and the equipment marketplace (`pages/marketplace`).
 *
 * Both used to carry their own copy: the marketplace printed prices with a `$`
 * while every other screen said LKR, and both pointed their missing-image
 * fallback at via.placeholder.com, which no longer resolves.
 */

/** The platform trades in Sri Lankan rupees — one helper, one format. */
export const money = (n) => `LKR ${Number(n || 0).toLocaleString()}`;

/**
 * Inline fallback for an item with no usable photo.
 *
 * A data URI cannot fail the way a remote placeholder host can, and
 * `onImageError` covers the other case: an item whose stored image URL is
 * itself dead.
 */
export const NO_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#d8dee9"/>
      <path d="M110 108l22-26 18 21 14-16 26 31z" fill="#a9b4c8"/>
      <circle cx="118" cy="74" r="10" fill="#a9b4c8"/>
      <text x="150" y="150" font-family="sans-serif" font-size="13" fill="#5b667a" text-anchor="middle">No image</text>
    </svg>`
  );

/** Swap in the inline fallback when a remote image 404s. */
export const onImageError = (e) => {
  e.currentTarget.src = NO_IMAGE;
};
