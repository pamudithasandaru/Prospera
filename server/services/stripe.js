/**
 * server/services/stripe.js
 * Single shared Stripe client, plus the money conversions the rest of the
 * server should never have to think about.
 *
 * The key is optional on purpose: the marketplace is browsable without one, so
 * a missing key disables checkout with a clear message rather than crashing the
 * whole API at boot.
 */
const Stripe = require('stripe');

const SECRET = process.env.STRIPE_SECRET_KEY || '';
const PUBLISHABLE = process.env.STRIPE_PUBLISHABLE_KEY || '';

const stripe = SECRET ? new Stripe(SECRET, { apiVersion: '2023-10-16' }) : null;

if (!stripe) {
  console.warn('Stripe is not configured (STRIPE_SECRET_KEY missing) — checkout is disabled.');
}

/** The currency the platform prices in. Stripe wants it lowercase. */
const CURRENCY = 'lkr';

/**
 * LKR has two decimal places, so Stripe counts it in cents. Rounding happens
 * once, here, on the already-summed total — rounding each line first would let
 * half-cents drift away from what the customer was shown.
 */
const toMinorUnits = (amount) => Math.round(Number(amount) * 100);

const fromMinorUnits = (minor) => Number(minor) / 100;

/** True when the key is a test-mode key — the success page says so. */
const isTestMode = () => SECRET.startsWith('sk_test_');

module.exports = {
  stripe,
  CURRENCY,
  toMinorUnits,
  fromMinorUnits,
  isTestMode,
  publishableKey: PUBLISHABLE,
  isConfigured: () => Boolean(stripe),
};
