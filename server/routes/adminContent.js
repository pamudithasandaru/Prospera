/**
 * server/routes/adminContent.js
 * Admin management of platform content: courses, market listings, marketplace
 * products, government schemes (+ applications), support tickets and loans.
 *
 * Mounted by routes/admin.js, which already enforces authenticate + admin role.
 */
const express = require('express');
const { prisma } = require('../services/prisma');
const { pageParams, paginationOf, str, num, dec, isPrismaCode, searchOr } = require('../services/adminHelpers');

const router = express.Router();

const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'];
const SCHEME_TYPES = ['subsidy', 'loan', 'training', 'insurance'];
const APPLICATION_STATUSES = ['pending', 'approved', 'rejected'];
const LOAN_STATUSES = ['pending', 'approved', 'active', 'rejected', 'closed'];
const TICKET_STATUSES = ['open', 'pending', 'resolved', 'closed'];
const LISTING_TYPES = ['export', 'domestic'];

const bad = (res, message) => res.status(400).json({ success: false, message });
const notFound = (res, what) => res.status(404).json({ success: false, message: `${what} not found` });
const fail = (res, tag, err, message) => {
  console.error(`Admin ${tag} error:`, err.message);
  return res.status(500).json({ success: false, message });
};

/** Run a handler that may hit "record not found" (P2025). */
const guard = (tag, what, message, fn) => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (err) {
    if (isPrismaCode(err, 'P2025')) return notFound(res, what);
    return fail(res, tag, err, message);
  }
};

// ═══ Courses ═════════════════════════════════════════════════════════════════

const serializeCourse = (c) => ({
  _id: c.id,
  title: c.title,
  description: c.description,
  category: c.category,
  level: c.level,
  duration: c.duration,
  thumbnail: c.thumbnail || '',
  instructorName: c.instructorName,
  enrolledStudents: c._count?.enrolments ?? c.enrolledStudents,
  createdAt: c.createdAt,
});

/** Validates the editable course fields; returns { data } or { error }. */
const courseFields = (b, { partial }) => {
  const data = {};
  const required = ['title', 'description', 'category', 'instructorName'];
  for (const k of required) {
    if (b[k] !== undefined || !partial) {
      const v = str(b[k], k === 'description' ? 4000 : 200);
      if (!v) return { error: `${k} is required` };
      data[k] = v;
    }
  }
  if (b.level !== undefined || !partial) {
    if (!COURSE_LEVELS.includes(b.level)) return { error: 'Invalid level' };
    data.level = b.level;
  }
  if (b.duration !== undefined || !partial) {
    const d = num(b.duration);
    if (!Number.isInteger(d) || d < 1) return { error: 'Duration must be a whole number of at least 1' };
    data.duration = d;
  }
  if (b.thumbnail !== undefined) data.thumbnail = str(b.thumbnail, 1000) || null;
  return { data };
};

router.get('/courses', async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const where = searchOr(['title', 'category', 'instructorName'], str(req.query.search, 100));
  try {
    const [total, rows] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit,
        include: { _count: { select: { enrolments: true } } },
      }),
    ]);
    return res.json({ success: true, data: rows.map(serializeCourse), pagination: paginationOf(page, limit, total) });
  } catch (err) {
    return fail(res, 'list courses', err, 'Failed to load courses');
  }
});

router.post('/courses', async (req, res) => {
  const { data, error } = courseFields(req.body, { partial: false });
  if (error) return bad(res, error);
  try {
    const c = await prisma.course.create({ data: { ...data, createdById: req.user.id === 'superadmin' ? null : req.user.id } });
    return res.status(201).json({ success: true, data: serializeCourse(c) });
  } catch (err) {
    return fail(res, 'create course', err, 'Failed to create course');
  }
});

router.patch('/courses/:id', guard('update course', 'Course', 'Failed to update course', async (req, res) => {
  const { data, error } = courseFields(req.body, { partial: true });
  if (error) return bad(res, error);
  const c = await prisma.course.update({ where: { id: req.params.id }, data });
  return res.json({ success: true, data: serializeCourse(c) });
}));

router.delete('/courses/:id', guard('delete course', 'Course', 'Failed to delete course', async (req, res) => {
  await prisma.course.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'Course deleted' });
}));

// ═══ Market listings (wholesale) ═════════════════════════════════════════════

router.get('/listings', async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const term = str(req.query.search, 100);
  const type = LISTING_TYPES.includes(req.query.type) ? req.query.type : undefined;
  const where = {
    ...(type ? { type } : {}),
    ...(term
      ? { OR: [
          { productName: { contains: term, mode: 'insensitive' } },
          { productCategory: { contains: term, mode: 'insensitive' } },
          { seller: { name: { contains: term, mode: 'insensitive' } } },
        ] }
      : {}),
  };
  try {
    const [total, rows] = await Promise.all([
      prisma.marketListing.count({ where }),
      prisma.marketListing.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit,
        include: { seller: { select: { id: true, name: true } } },
      }),
    ]);
    return res.json({
      success: true,
      data: rows.map((l) => ({
        _id: l.id,
        productName: l.productName,
        category: l.productCategory,
        type: l.type,
        pricePerUnit: dec(l.pricePerUnit),
        quantity: `${dec(l.quantityAmount)} ${l.quantityUnit}`,
        district: l.district || '',
        sellerName: l.seller?.name || '—',
        sellerVerified: l.sellerVerified,
        createdAt: l.createdAt,
      })),
      pagination: paginationOf(page, limit, total),
    });
  } catch (err) {
    return fail(res, 'list listings', err, 'Failed to load listings');
  }
});

router.patch('/listings/:id', guard('update listing', 'Listing', 'Failed to update listing', async (req, res) => {
  if (typeof req.body.sellerVerified !== 'boolean') return bad(res, 'sellerVerified must be true or false');
  const l = await prisma.marketListing.update({ where: { id: req.params.id }, data: { sellerVerified: req.body.sellerVerified } });
  return res.json({ success: true, data: { _id: l.id, sellerVerified: l.sellerVerified } });
}));

router.delete('/listings/:id', guard('delete listing', 'Listing', 'Failed to delete listing', async (req, res) => {
  await prisma.marketListing.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'Listing deleted' });
}));

// ═══ Marketplace products ════════════════════════════════════════════════════

const serializeProduct = (p) => ({
  _id: p.id,
  name: p.name,
  category: p.category,
  description: p.description,
  image: (p.images || [])[0] || '',
  price: dec(p.price),
  originalPrice: dec(p.originalPrice),
  stock: p.stock,
  freeShipping: p.freeShipping,
  createdAt: p.createdAt,
});

const productFields = (b, { partial }) => {
  const data = {};
  for (const k of ['name', 'category']) {
    if (b[k] !== undefined || !partial) {
      const v = str(b[k], 200);
      if (!v) return { error: `${k} is required` };
      data[k] = v;
    }
  }
  if (b.description !== undefined) data.description = str(b.description, 4000);
  if (b.price !== undefined || !partial) {
    const p = num(b.price);
    if (!(p >= 0)) return { error: 'Price must be 0 or more' };
    data.price = p;
  }
  if (b.originalPrice !== undefined) {
    const o = num(b.originalPrice);
    data.originalPrice = Number.isNaN(o) ? null : o;
    if (data.originalPrice !== null && data.originalPrice < 0) return { error: 'Original price must be 0 or more' };
  }
  if (b.stock !== undefined || !partial) {
    const s = num(b.stock);
    if (!Number.isInteger(s) || s < 0) return { error: 'Stock must be a whole number, 0 or more' };
    data.stock = s;
  }
  if (b.freeShipping !== undefined) data.freeShipping = Boolean(b.freeShipping);
  if (b.image !== undefined) {
    const img = str(b.image, 1000);
    data.images = img ? [img] : [];
  }
  return { data };
};

router.get('/products', async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const where = searchOr(['name', 'category'], str(req.query.search, 100));
  try {
    const [total, rows] = await Promise.all([
      prisma.marketplaceProduct.count({ where }),
      prisma.marketplaceProduct.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    ]);
    return res.json({ success: true, data: rows.map(serializeProduct), pagination: paginationOf(page, limit, total) });
  } catch (err) {
    return fail(res, 'list products', err, 'Failed to load products');
  }
});

router.post('/products', async (req, res) => {
  const { data, error } = productFields(req.body, { partial: false });
  if (error) return bad(res, error);
  try {
    const p = await prisma.marketplaceProduct.create({ data });
    return res.status(201).json({ success: true, data: serializeProduct(p) });
  } catch (err) {
    return fail(res, 'create product', err, 'Failed to create product');
  }
});

router.patch('/products/:id', guard('update product', 'Product', 'Failed to update product', async (req, res) => {
  const { data, error } = productFields(req.body, { partial: true });
  if (error) return bad(res, error);
  const p = await prisma.marketplaceProduct.update({ where: { id: req.params.id }, data });
  return res.json({ success: true, data: serializeProduct(p) });
}));

router.delete('/products/:id', guard('delete product', 'Product', 'Failed to delete product', async (req, res) => {
  await prisma.marketplaceProduct.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'Product deleted' });
}));

// ═══ Government schemes + applications ═══════════════════════════════════════

const serializeScheme = (s) => ({
  _id: s.id,
  type: s.type,
  category: s.category,
  name: s.name,
  description: s.description,
  benefitAmount: dec(s.benefitAmount),
  benefitDescription: s.benefitDescription || '',
  eligibility: s.eligibility || [],
  applicationsCount: s._count?.applications ?? 0,
  createdAt: s.createdAt,
});

/** Eligibility arrives as an array or a newline-separated string. */
const toList = (v) =>
  (Array.isArray(v) ? v : String(v || '').split(/\r?\n/)).map((x) => str(x, 300)).filter(Boolean).slice(0, 30);

const schemeFields = (b, { partial }) => {
  const data = {};
  for (const k of ['category', 'name']) {
    if (b[k] !== undefined || !partial) {
      const v = str(b[k], 200);
      if (!v) return { error: `${k} is required` };
      data[k] = v;
    }
  }
  if (b.description !== undefined || !partial) {
    const v = str(b.description, 4000);
    if (!v) return { error: 'description is required' };
    data.description = v;
  }
  if (b.type !== undefined || !partial) {
    if (!SCHEME_TYPES.includes(b.type)) return { error: 'Invalid scheme type' };
    data.type = b.type;
  }
  if (b.benefitAmount !== undefined) {
    const a = num(b.benefitAmount);
    data.benefitAmount = Number.isNaN(a) ? null : a;
    if (data.benefitAmount !== null && data.benefitAmount < 0) return { error: 'Benefit amount must be 0 or more' };
  }
  if (b.benefitDescription !== undefined) data.benefitDescription = str(b.benefitDescription, 1000) || null;
  if (b.eligibility !== undefined) data.eligibility = toList(b.eligibility);
  return { data };
};

router.get('/schemes', async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const where = searchOr(['name', 'category'], str(req.query.search, 100));
  try {
    const [total, rows] = await Promise.all([
      prisma.scheme.count({ where }),
      prisma.scheme.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit,
        include: { _count: { select: { applications: true } } },
      }),
    ]);
    return res.json({ success: true, data: rows.map(serializeScheme), pagination: paginationOf(page, limit, total) });
  } catch (err) {
    return fail(res, 'list schemes', err, 'Failed to load schemes');
  }
});

router.post('/schemes', async (req, res) => {
  const { data, error } = schemeFields(req.body, { partial: false });
  if (error) return bad(res, error);
  try {
    const s = await prisma.scheme.create({ data });
    return res.status(201).json({ success: true, data: serializeScheme(s) });
  } catch (err) {
    return fail(res, 'create scheme', err, 'Failed to create scheme');
  }
});

router.patch('/schemes/:id', guard('update scheme', 'Scheme', 'Failed to update scheme', async (req, res) => {
  const { data, error } = schemeFields(req.body, { partial: true });
  if (error) return bad(res, error);
  const s = await prisma.scheme.update({ where: { id: req.params.id }, data });
  return res.json({ success: true, data: serializeScheme(s) });
}));

router.delete('/schemes/:id', guard('delete scheme', 'Scheme', 'Failed to delete scheme', async (req, res) => {
  await prisma.scheme.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'Scheme deleted' });
}));

router.get('/scheme-applications', async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const status = APPLICATION_STATUSES.includes(req.query.status) ? req.query.status : undefined;
  const term = str(req.query.search, 100);
  const where = {
    ...(status ? { status } : {}),
    ...(term
      ? { OR: [
          { user: { name: { contains: term, mode: 'insensitive' } } },
          { user: { email: { contains: term, mode: 'insensitive' } } },
          { scheme: { name: { contains: term, mode: 'insensitive' } } },
        ] }
      : {}),
  };
  try {
    const [total, rows] = await Promise.all([
      prisma.schemeApplication.count({ where }),
      prisma.schemeApplication.findMany({
        where, orderBy: { appliedAt: 'desc' }, skip, take: limit,
        include: { user: { select: { name: true, email: true } }, scheme: { select: { name: true } } },
      }),
    ]);
    return res.json({
      success: true,
      data: rows.map((a) => ({
        _id: a.id,
        schemeName: a.scheme.name,
        userName: a.user.name,
        userEmail: a.user.email,
        status: a.status,
        appliedAt: a.appliedAt,
      })),
      pagination: paginationOf(page, limit, total),
    });
  } catch (err) {
    return fail(res, 'list applications', err, 'Failed to load applications');
  }
});

router.patch('/scheme-applications/:id', guard('update application', 'Application', 'Failed to update application', async (req, res) => {
  if (!APPLICATION_STATUSES.includes(req.body.status)) return bad(res, 'Invalid status');
  const a = await prisma.schemeApplication.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  return res.json({ success: true, data: { _id: a.id, status: a.status } });
}));

// ═══ Support tickets ═════════════════════════════════════════════════════════

router.get('/tickets', async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const status = TICKET_STATUSES.includes(req.query.status) ? req.query.status : undefined;
  const term = str(req.query.search, 100);
  const where = {
    ...(status ? { status } : {}),
    ...(term
      ? { OR: [
          { subject: { contains: term, mode: 'insensitive' } },
          { user: { name: { contains: term, mode: 'insensitive' } } },
          { user: { email: { contains: term, mode: 'insensitive' } } },
        ] }
      : {}),
  };
  try {
    const [total, rows] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);
    return res.json({
      success: true,
      data: rows.map((t) => ({
        _id: t.id,
        subject: t.subject,
        category: t.category,
        description: t.description,
        status: t.status,
        userName: t.user.name,
        userEmail: t.user.email,
        createdAt: t.createdAt,
      })),
      pagination: paginationOf(page, limit, total),
    });
  } catch (err) {
    return fail(res, 'list tickets', err, 'Failed to load tickets');
  }
});

router.patch('/tickets/:id', guard('update ticket', 'Ticket', 'Failed to update ticket', async (req, res) => {
  if (!TICKET_STATUSES.includes(req.body.status)) return bad(res, 'Invalid status');
  const t = await prisma.ticket.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  return res.json({ success: true, data: { _id: t.id, status: t.status } });
}));

// ═══ Loans ═══════════════════════════════════════════════════════════════════

router.get('/loans', async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const status = LOAN_STATUSES.includes(req.query.status) ? req.query.status : undefined;
  const term = str(req.query.search, 100);
  const where = {
    ...(status ? { status } : {}),
    ...(term
      ? { OR: [
          { purpose: { contains: term, mode: 'insensitive' } },
          { user: { name: { contains: term, mode: 'insensitive' } } },
          { user: { email: { contains: term, mode: 'insensitive' } } },
        ] }
      : {}),
  };
  try {
    const [total, rows] = await Promise.all([
      prisma.loan.count({ where }),
      prisma.loan.findMany({
        where, orderBy: { appliedAt: 'desc' }, skip, take: limit,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);
    return res.json({
      success: true,
      data: rows.map((l) => ({
        _id: l.id,
        purpose: l.purpose,
        amount: dec(l.amount),
        duration: l.duration,
        status: l.status,
        userName: l.user.name,
        userEmail: l.user.email,
        appliedAt: l.appliedAt,
      })),
      pagination: paginationOf(page, limit, total),
    });
  } catch (err) {
    return fail(res, 'list loans', err, 'Failed to load loans');
  }
});

router.patch('/loans/:id', guard('update loan', 'Loan', 'Failed to update loan', async (req, res) => {
  if (!LOAN_STATUSES.includes(req.body.status)) return bad(res, 'Invalid status');
  const l = await prisma.loan.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  return res.json({ success: true, data: { _id: l.id, status: l.status } });
}));

module.exports = router;
