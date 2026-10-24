/**
 * server/services/adminHelpers.js
 * Small helpers shared by the admin routers.
 */
const { Prisma } = require('@prisma/client');

/** page / limit / skip from the query string, with sane bounds. */
const pageParams = (req, maxLimit = 50) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

const paginationOf = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: Math.max(Math.ceil(total / limit), 1),
});

/** Trimmed, length-capped string ('' when not a string). */
const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Number, or NaN when blank / not numeric. */
const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));

/** Prisma Decimal -> plain number (null stays null). */
const dec = (v) => (v === null || v === undefined ? v : Number(v));

const isPrismaCode = (err, code) =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === code;

/** Case-insensitive "contains" filter over several fields. */
const searchOr = (fields, term) =>
  term ? { OR: fields.map((f) => ({ [f]: { contains: term, mode: 'insensitive' } })) } : {};

module.exports = { pageParams, paginationOf, str, num, dec, isPrismaCode, searchOr };
