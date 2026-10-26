/**
 * prisma/seed.js
 * Idempotent development seed — safe to re-run.
 *
 * Fixed ids (user_demo, farm_1, …) are used throughout so repeated runs upsert
 * the same rows instead of piling up duplicates.
 *
 *   npm run db:seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const demoPassword = process.env.DEMO_PASSWORD || 'Prospera123!';

const USERS = [
  {
    id: 'user_demo',
    name: 'Demo Farmer',
    email: (process.env.DEMO_EMAIL || 'demo@prospera.lk').toLowerCase(),
    password: demoPassword,
    role: 'farmer',
    language: 'EN',
    district: 'Polonnaruwa',
    bio: 'Paddy and vegetable farmer.',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'user_expert',
    name: 'Agri Expert',
    email: 'expert@prospera.lk',
    password: 'ExpertPass123!',
    role: 'expert',
    language: 'EN',
    district: 'Colombo',
    bio: 'Agricultural consultant.',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'user_sunil',
    name: 'Sunil Bandara',
    email: 'sunil@prospera.lk',
    password: 'Sunil123!',
    role: 'farmer',
    language: 'SI',
    district: 'Anuradhapura',
    bio: 'Rice farmer, 15 years experience.',
    avatar: 'https://i.pravatar.cc/150?img=8',
  },
  {
    id: 'user_latha',
    name: 'Latha Fernando',
    email: 'latha@prospera.lk',
    password: 'Latha123!',
    role: 'farmer',
    language: 'SI',
    district: 'Nuwara Eliya',
    bio: 'Vegetable and tea farmer.',
    avatar: 'https://i.pravatar.cc/150?img=25',
  },
  {
    id: 'user_rajith',
    name: 'Rajith Kumar',
    email: 'rajith@prospera.lk',
    password: 'Rajith123!',
    role: 'farmer',
    language: 'EN',
    district: 'Kurunegala',
    bio: 'Dairy and coconut farmer.',
    avatar: 'https://i.pravatar.cc/150?img=15',
  },
  {
    id: 'user_kamala',
    name: 'Kamala Jayasinghe',
    email: 'kamala@prospera.lk',
    password: 'Kamala123!',
    role: 'farmer',
    language: 'SI',
    district: 'Kandy',
    bio: 'Spice and fruit farmer.',
    avatar: 'https://i.pravatar.cc/150?img=20',
  },
];

const POSTS = [
  {
    id: 'post_1',
    authorId: 'user_demo',
    text: 'Harvested 2 acres of paddy this week with 20% higher yield using organic fertilizers.',
    images: ['https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80'],
    type: 'post',
    category: 'crop-management',
    createdAt: new Date('2024-01-10T08:00:00Z'),
    likes: ['user_expert', 'user_sunil'],
    comments: [
      {
        id: 'comment_1',
        authorId: 'user_expert',
        text: 'Great job! Try planting GL-11 variety next season for even better results.',
        createdAt: new Date('2024-01-11T10:00:00Z'),
      },
    ],
  },
  {
    id: 'post_2',
    authorId: 'user_expert',
    text: 'Soil moisture alert for Kurunegala district. Keep irrigation on minimal for the next 3 days.',
    images: [],
    type: 'alert',
    category: 'irrigation',
    createdAt: new Date('2024-01-12T06:00:00Z'),
    likes: ['user_demo'],
    comments: [],
  },
  {
    id: 'post_3',
    authorId: 'user_demo',
    text: 'Question: Anyone tried drip irrigation for chilli? Looking for cost-effective setup recommendations.',
    images: [],
    type: 'question',
    category: 'technology',
    createdAt: new Date('2024-01-13T05:00:00Z'),
    likes: [],
    comments: [],
  },
];

const GROUPS = [
  { id: 'group_1', name: 'Rice Farmers LK', description: 'Community for rice farmers across Sri Lanka.', category: 'crop-management', memberCount: 12500, image: '🌾', createdAt: new Date('2023-06-01') },
  { id: 'group_2', name: 'Organic Farming', description: 'Promoting sustainable and organic farming practices.', category: 'technology', memberCount: 8300, image: '🌱', createdAt: new Date('2023-07-15') },
  { id: 'group_3', name: 'Tea Growers', description: 'Network for tea estate owners and workers.', category: 'general', memberCount: 6700, image: '🍵', createdAt: new Date('2023-08-20') },
];

const LISTINGS = [
  { id: 'listing_1', type: 'export', productName: 'Keeri Samba Rice', productCategory: 'grains', productDescription: 'Freshly harvested Keeri Samba, premium export quality.', images: ['https://images.pexels.com/photos/11789292/pexels-photo-11789292.jpeg?auto=compress&cs=tinysrgb&w=800'], sellerVerified: true, pricePerUnit: 180, quantityAmount: 2500, quantityUnit: 'kg', qualityGrade: 'A', district: 'Polonnaruwa', sellerId: 'user_demo' },
  { id: 'listing_2', type: 'domestic', productName: 'Red Onions', productCategory: 'vegetables', productDescription: 'Dried and sorted Jaffna red onions.', images: ['https://images.pexels.com/photos/12999831/pexels-photo-12999831.jpeg?auto=compress&cs=tinysrgb&w=800'], sellerVerified: true, pricePerUnit: 320, quantityAmount: 800, quantityUnit: 'kg', qualityGrade: 'Premium', district: 'Jaffna', sellerId: 'user_sunil' },
  { id: 'listing_3', type: 'export', productName: 'Black Pepper', productCategory: 'spices', productDescription: 'Sun-dried pepper, moisture below 12%.', images: ['https://images.pexels.com/photos/10433518/pexels-photo-10433518.jpeg?auto=compress&cs=tinysrgb&w=800'], sellerVerified: false, pricePerUnit: 1450, quantityAmount: 300, quantityUnit: 'kg', qualityGrade: 'A', district: 'Matale', sellerId: 'user_kamala' },
  { id: 'listing_4', type: 'domestic', productName: 'Fresh Milk', productCategory: 'dairy', productDescription: 'Chilled fresh cow milk from cooperative.', images: ['https://images.pexels.com/photos/12776422/pexels-photo-12776422.jpeg?auto=compress&cs=tinysrgb&w=800'], sellerVerified: true, pricePerUnit: 120, quantityAmount: 1200, quantityUnit: 'liters', qualityGrade: 'Standard', district: 'Kandy', sellerId: 'user_rajith' },
];

const PRODUCTS = [
  { id: 'product_1', name: '75HP Tractor - FieldMaster X75', category: 'tractors', description: 'Fuel efficient 4WD tractor with PTO and cabin.', images: ['https://images.pexels.com/photos/11530543/pexels-photo-11530543.jpeg?auto=compress&cs=tinysrgb&w=1200'], price: 28500, originalPrice: 32000, stock: 4, freeShipping: true },
  { id: 'product_2', name: 'Combine Harvester - AgroCut 360', category: 'harvesters', description: 'Rice and wheat combine with 3.6m header.', images: ['https://images.pexels.com/photos/12982187/pexels-photo-12982187.jpeg?auto=compress&cs=tinysrgb&w=1200'], price: 46500, originalPrice: null, stock: 2, freeShipping: false },
  { id: 'product_3', name: 'Solar Powered Irrigation Kit', category: 'irrigation', description: '3HP solar pump with 12 panels and controller.', images: ['https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=1200'], price: 8900, originalPrice: 9500, stock: 6, freeShipping: true },
  { id: 'product_4', name: 'Backpack Sprayer 20L', category: 'sprayers', description: 'Durable manual sprayer with brass nozzle.', images: ['https://images.pexels.com/photos/10697911/pexels-photo-10697911.jpeg?auto=compress&cs=tinysrgb&w=1200'], price: 120, originalPrice: null, stock: 0, freeShipping: false },
];

const SCHEMES = [
  { id: 'scheme_1', type: 'subsidy', category: 'fertilizer', name: 'National Fertilizer Subsidy 2024', description: '50% subsidy on urea and TSP for registered paddy farmers.', benefitAmount: 50000, benefitDescription: 'Per registered hectare', eligibility: ['Registered paddy farmer', 'Maximum 5 hectares', 'Updated land records'] },
  { id: 'scheme_2', type: 'loan', category: 'equipment', name: 'Agri Machinery Low Interest Loan', description: '4% interest loan for tractors and harvesters with 5-year tenure.', benefitAmount: 2000000, benefitDescription: '5 year repayment with grace period', eligibility: ['Farming income proof', 'Collateral or guarantor', 'Credit score above 650'] },
  { id: 'scheme_3', type: 'training', category: 'organic-farming', name: 'Organic Farming Transition Program', description: '12-week training with input grants for farmers moving to organic.', benefitAmount: 150000, benefitDescription: 'Training stipend and input vouchers', eligibility: ['Farm size under 10 acres', 'Commitment to organic standards', 'Soil test reports'] },
];

const APPLICATIONS = [
  { id: 'application_1', schemeId: 'scheme_1', userId: 'user_demo', status: 'approved', appliedAt: new Date('2023-12-15T09:00:00Z') },
  { id: 'application_2', schemeId: 'scheme_2', userId: 'user_demo', status: 'pending', appliedAt: new Date('2024-01-05T09:00:00Z') },
];

const COURSES = [
  { id: 'course_1', title: 'Precision Farming 101', description: 'Use IoT sensors and data to optimize irrigation and fertilizer use.', category: 'technology', level: 'intermediate', duration: 12, ratingAverage: 4.6, ratingCount: 240, instructorName: 'Dr. Nimal Perera', enrolledStudents: 8200 },
  { id: 'course_2', title: 'Organic Pest Management', description: 'Natural pest control methods and bio-pesticides for vegetables.', category: 'pest-control', level: 'beginner', duration: 8, ratingAverage: 4.3, ratingCount: 180, instructorName: 'Eng. Sajani Silva', enrolledStudents: 5200 },
  { id: 'course_3', title: 'Smart Irrigation Design', description: 'Design efficient drip and sprinkler systems for different crops.', category: 'irrigation', level: 'advanced', duration: 10, ratingAverage: 4.7, ratingCount: 320, instructorName: 'Prof. Ruwan Dias', enrolledStudents: 6100 },
  { id: 'course_4', title: 'Agri Business Fundamentals', description: 'Pricing, branding, and distribution for farm produce.', category: 'business', level: 'beginner', duration: 6, ratingAverage: 4.1, ratingCount: 140, instructorName: 'Chamari Gunasekara', enrolledStudents: 3100 },
].map((c) => ({
  ...c,
  thumbnail: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
}));

const LOANS = [
  { id: 'loan_1', userId: 'user_demo', purpose: 'seeds', amount: 250000, duration: 12, status: 'active', appliedAt: new Date('2023-11-10T09:00:00Z') },
  { id: 'loan_2', userId: 'user_demo', purpose: 'equipment', amount: 1200000, duration: 36, status: 'pending', appliedAt: new Date('2024-01-02T09:00:00Z') },
  { id: 'loan_3', userId: 'user_demo', purpose: 'expansion', amount: 750000, duration: 24, status: 'approved', appliedAt: new Date('2023-12-05T09:00:00Z') },
];

const TICKETS = [
  { id: 'ticket_1', userId: 'user_demo', subject: 'Irrigation pump maintenance', category: 'equipment', status: 'open', createdAt: new Date('2024-01-08T09:00:00Z') },
  { id: 'ticket_2', userId: 'user_demo', subject: 'Fertilizer subsidy application help', category: 'government', status: 'pending', createdAt: new Date('2024-01-06T09:00:00Z') },
  { id: 'ticket_3', userId: 'user_demo', subject: 'Course access issue', category: 'learning', status: 'resolved', createdAt: new Date('2024-01-04T09:00:00Z') },
];

const FARM = {
  id: 'farm_1',
  ownerId: 'user_demo',
  name: 'Green Valley Farms',
  location: 'Kegalle',
  landSize: 12,
  createdAt: new Date('2022-06-01T09:00:00Z'),
  crops: [
    { cropName: 'Paddy', variety: 'BG 360', area: 6, plantedDate: new Date('2023-12-15T09:00:00Z'), status: 'growing' },
    { cropName: 'Chilli', variety: 'MI Green', area: 2.5, plantedDate: new Date('2023-11-10T09:00:00Z'), status: 'growing' },
    { cropName: 'Maize', variety: 'Pacific 999', area: 1.5, plantedDate: new Date('2023-10-20T09:00:00Z'), status: 'harvested' },
  ],
  revenues: [
    { label: 'Paddy', totalAmount: 185000 },
    { label: 'Maize', totalAmount: 92000 },
  ],
  expenses: [
    { category: 'Fertilizer', amount: 35000 },
    { category: 'Labor', amount: 42000 },
    { category: 'Irrigation', amount: 18000 },
    { category: 'Machinery', amount: 52000 },
    { category: 'Pesticides', amount: 14000 },
  ],
};

async function main() {
  console.log('Seeding Prospera database…');

  // ── Users ──────────────────────────────────────────────────────────────────
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const { password, ...rest } = u;
    await prisma.user.upsert({
      where: { id: u.id },
      update: { ...rest, passwordHash },
      create: { ...rest, passwordHash },
    });
  }
  console.log(`  users: ${USERS.length}`);

  // ── Posts, with their likes and comments ───────────────────────────────────
  for (const p of POSTS) {
    const { likes, comments, ...post } = p;
    await prisma.socialPost.upsert({
      where: { id: p.id },
      update: { text: post.text, images: post.images, type: post.type, category: post.category },
      create: post,
    });

    // Replace children so re-running does not duplicate them.
    await prisma.postLike.deleteMany({ where: { postId: p.id } });
    if (likes.length) {
      await prisma.postLike.createMany({
        data: likes.map((userId) => ({ postId: p.id, userId })),
      });
    }

    for (const c of comments) {
      await prisma.comment.upsert({
        where: { id: c.id },
        update: { text: c.text },
        create: { ...c, postId: p.id },
      });
    }
  }
  console.log(`  posts: ${POSTS.length}`);

  // ── Simple reference tables ────────────────────────────────────────────────
  const upsertAll = async (model, rows, label) => {
    for (const row of rows) {
      await prisma[model].upsert({ where: { id: row.id }, update: row, create: row });
    }
    console.log(`  ${label}: ${rows.length}`);
  };

  await upsertAll('group', GROUPS, 'groups');
  await upsertAll('marketListing', LISTINGS, 'market listings');
  await upsertAll('marketplaceProduct', PRODUCTS, 'marketplace products');
  await upsertAll('scheme', SCHEMES, 'schemes');
  await upsertAll('course', COURSES, 'courses');
  await upsertAll('schemeApplication', APPLICATIONS, 'scheme applications');
  await upsertAll('loan', LOANS, 'loans');
  await upsertAll('ticket', TICKETS, 'tickets');

  // ── Credit score for the demo user ─────────────────────────────────────────
  await prisma.creditScore.upsert({
    where: { userId: 'user_demo' },
    update: { score: 720, rating: 'Good', lastUpdated: new Date('2024-01-12T09:00:00Z') },
    create: { userId: 'user_demo', score: 720, rating: 'Good', lastUpdated: new Date('2024-01-12T09:00:00Z') },
  });
  console.log('  credit scores: 1');

  // ── Farm with its crops, revenue and expenses ──────────────────────────────
  const { crops, revenues, expenses, ...farm } = FARM;
  await prisma.farm.upsert({ where: { id: farm.id }, update: farm, create: farm });

  await prisma.farmCrop.deleteMany({ where: { farmId: farm.id } });
  await prisma.farmCrop.createMany({ data: crops.map((c) => ({ ...c, farmId: farm.id })) });

  await prisma.farmRevenue.deleteMany({ where: { farmId: farm.id } });
  await prisma.farmRevenue.createMany({ data: revenues.map((r) => ({ ...r, farmId: farm.id })) });

  await prisma.farmExpense.deleteMany({ where: { farmId: farm.id } });
  await prisma.farmExpense.createMany({ data: expenses.map((e) => ({ ...e, farmId: farm.id })) });
  console.log('  farms: 1');

  console.log('\nSeed complete.');
  console.log(`Demo login: ${USERS[0].email} / ${demoPassword}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
