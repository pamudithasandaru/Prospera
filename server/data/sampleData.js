const bcrypt = require('bcryptjs');

const generateId = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const demoPassword = process.env.DEMO_PASSWORD || 'Prospera123!';

const users = [
  {
    _id: 'user_demo',
    name: 'Demo Farmer',
    email: process.env.DEMO_EMAIL || 'demo@prospera.lk',
    role: 'farmer',
    language: 'EN',
    profile: { location: { district: 'Polonnaruwa' }, bio: 'Paddy and vegetable farmer.' },
    avatar: 'https://i.pravatar.cc/150?img=5',
    passwordHash: bcrypt.hashSync(demoPassword, 10),
  },
  {
    _id: 'user_expert',
    name: 'Agri Expert',
    email: 'expert@prospera.lk',
    role: 'consultant',
    language: 'EN',
    profile: { location: { district: 'Colombo' }, bio: 'Agricultural consultant.' },
    avatar: 'https://i.pravatar.cc/150?img=12',
    passwordHash: bcrypt.hashSync('ExpertPass123!', 10),
  },
  {
    _id: 'user_sunil',
    name: 'Sunil Bandara',
    email: 'sunil@prospera.lk',
    role: 'farmer',
    language: 'SI',
    profile: { location: { district: 'Anuradhapura' }, bio: 'Rice farmer, 15 years experience.' },
    avatar: 'https://i.pravatar.cc/150?img=8',
    passwordHash: bcrypt.hashSync('Sunil123!', 10),
  },
  {
    _id: 'user_latha',
    name: 'Latha Fernando',
    email: 'latha@prospera.lk',
    role: 'farmer',
    language: 'SI',
    profile: { location: { district: 'Nuwara Eliya' }, bio: 'Vegetable and tea farmer.' },
    avatar: 'https://i.pravatar.cc/150?img=25',
    passwordHash: bcrypt.hashSync('Latha123!', 10),
  },
  {
    _id: 'user_rajith',
    name: 'Rajith Kumar',
    email: 'rajith@prospera.lk',
    role: 'farmer',
    language: 'EN',
    profile: { location: { district: 'Kurunegala' }, bio: 'Dairy and coconut farmer.' },
    avatar: 'https://i.pravatar.cc/150?img=15',
    passwordHash: bcrypt.hashSync('Rajith123!', 10),
  },
  {
    _id: 'user_kamala',
    name: 'Kamala Jayasinghe',
    email: 'kamala@prospera.lk',
    role: 'farmer',
    language: 'SI',
    profile: { location: { district: 'Kandy' }, bio: 'Spice and fruit farmer.' },
    avatar: 'https://i.pravatar.cc/150?img=20',
    passwordHash: bcrypt.hashSync('Kamala123!', 10),
  },
];

const socialPosts = [
  {
    _id: 'post_1',
    user: {
      _id: 'user_demo',
      name: 'Demo Farmer',
      role: 'farmer',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    content: {
      text: 'Harvested 2 acres of paddy this week with 20% higher yield using organic fertilizers.',
      images: ['https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80'],
    },
    type: 'post',
    category: 'crop-management',
    visibility: 'public',
    likes: [
      { user: 'user_expert', date: new Date('2024-01-10T09:00:00Z') },
      { user: 'user_demo', date: new Date('2024-01-11T11:00:00Z') },
    ],
    comments: [
      {
        _id: 'comment_1',
        user: { _id: 'user_expert', name: 'Agri Expert' },
        text: 'Great job! Try planting GL-11 variety next season for even better results.',
        createdAt: new Date('2024-01-11T10:00:00Z'),
      },
    ],
    createdAt: new Date('2024-01-10T08:00:00Z'),
  },
  {
    _id: 'post_2',
    user: {
      _id: 'user_expert',
      name: 'Agri Expert',
      role: 'consultant',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    content: {
      text: 'Soil moisture alert for Kurunegala district. Keep irrigation on minimal for the next 3 days.',
      images: [],
    },
    type: 'alert',
    category: 'irrigation',
    visibility: 'public',
    likes: [
      { user: 'user_demo', date: new Date('2024-01-12T07:00:00Z') },
    ],
    comments: [],
    createdAt: new Date('2024-01-12T06:00:00Z'),
  },
  {
    _id: 'post_3',
    user: {
      _id: 'user_demo',
      name: 'Demo Farmer',
      role: 'farmer',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    content: {
      text: 'Question: Anyone tried drip irrigation for chilli? Looking for cost-effective setup recommendations.',
      images: [],
    },
    type: 'question',
    category: 'technology',
    visibility: 'public',
    likes: [],
    comments: [],
    createdAt: new Date('2024-01-13T05:00:00Z'),
  },
];

const weatherData = {
  current: {
    temperature: 29,
    condition: 'Partly Cloudy',
    humidity: 74,
    windSpeed: 14,
    rainfall: 1,
    pressure: 1012,
  },
  forecast: [
    { date: '2024-01-16', temp: { max: 32, min: 24 }, condition: 'Sunny', rainfall: 0 },
    { date: '2024-01-17', temp: { max: 31, min: 25 }, condition: 'Partly Cloudy', rainfall: 2 },
    { date: '2024-01-18', temp: { max: 30, min: 24 }, condition: 'Cloudy', rainfall: 5 },
    { date: '2024-01-19', temp: { max: 29, min: 23 }, condition: 'Rainy', rainfall: 15 },
    { date: '2024-01-20', temp: { max: 28, min: 23 }, condition: 'Rainy', rainfall: 20 },
    { date: '2024-01-21', temp: { max: 30, min: 24 }, condition: 'Partly Cloudy', rainfall: 3 },
    { date: '2024-01-22', temp: { max: 31, min: 25 }, condition: 'Sunny', rainfall: 0 },
  ],
  alerts: [
    {
      title: 'Heavy rain expected in Western Province',
      description: 'Reduce irrigation for paddy fields over the next 48 hours.',
      severity: 'medium',
    },
    {
      title: 'High wind advisory',
      description: 'Secure greenhouse covers and shade nets in coastal areas.',
      severity: 'low',
    },
  ],
};

const tickets = [
  {
    _id: 'ticket_1',
    subject: 'Irrigation pump maintenance',
    category: 'equipment',
    status: 'open',
    createdAt: new Date('2024-01-08T09:00:00Z'),
  },
  {
    _id: 'ticket_2',
    subject: 'Fertilizer subsidy application help',
    category: 'government',
    status: 'pending',
    createdAt: new Date('2024-01-06T09:00:00Z'),
  },
  {
    _id: 'ticket_3',
    subject: 'Course access issue',
    category: 'learning',
    status: 'resolved',
    createdAt: new Date('2024-01-04T09:00:00Z'),
  },
];

const marketListings = [
  {
    _id: 'listing_1',
    type: 'export',
    product: {
      name: 'Keeri Samba Rice',
      category: 'grains',
      images: ['https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80'],
      description: 'Freshly harvested Keeri Samba, premium export quality.',
    },
    seller: { verified: true },
    pricing: { pricePerUnit: 180 },
    quantity: { amount: 2500, unit: 'kg' },
    quality: { grade: 'A' },
    location: { district: 'Polonnaruwa' },
  },
  {
    _id: 'listing_2',
    type: 'domestic',
    product: {
      name: 'Red Onions',
      category: 'vegetables',
      images: ['https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80'],
      description: 'Dried and sorted Jaffna red onions.',
    },
    seller: { verified: true },
    pricing: { pricePerUnit: 320 },
    quantity: { amount: 800, unit: 'kg' },
    quality: { grade: 'Premium' },
    location: { district: 'Jaffna' },
  },
  {
    _id: 'listing_3',
    type: 'export',
    product: {
      name: 'Black Pepper',
      category: 'spices',
      images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'],
      description: 'Sun-dried pepper, moisture below 12%.',
    },
    seller: { verified: false },
    pricing: { pricePerUnit: 1450 },
    quantity: { amount: 300, unit: 'kg' },
    quality: { grade: 'A' },
    location: { district: 'Matale' },
  },
  {
    _id: 'listing_4',
    type: 'domestic',
    product: {
      name: 'Fresh Milk',
      category: 'dairy',
      images: ['https://images.unsplash.com/photo-1582719478190-9991e0b2a4d2?auto=format&fit=crop&w=800&q=80'],
      description: 'Chilled fresh cow milk from cooperative.',
    },
    seller: { verified: true },
    pricing: { pricePerUnit: 120 },
    quantity: { amount: 1200, unit: 'liters' },
    quality: { grade: 'Standard' },
    location: { district: 'Kandy' },
  },
];

const marketplaceProducts = [
  {
    _id: 'product_1',
    name: '75HP Tractor - FieldMaster X75',
    category: 'tractors',
    description: 'Fuel efficient 4WD tractor with PTO and cabin.',
    images: ['https://images.unsplash.com/photo-1592982537447-7440770cbfc8?auto=format&fit=crop&w=1200&q=80'],
    price: { amount: 28500, originalPrice: 32000 },
    stock: 4,
    shipping: { freeShipping: true },
  },
  {
    _id: 'product_2',
    name: 'Combine Harvester - AgroCut 360',
    category: 'harvesters',
    description: 'Rice and wheat combine with 3.6m header.',
    images: ['https://images.unsplash.com/photo-1600929907703-1251882b8d57?auto=format&fit=crop&w=1200&q=80'],
    price: { amount: 46500 },
    stock: 2,
    shipping: { freeShipping: false },
  },
  {
    _id: 'product_3',
    name: 'Solar Powered Irrigation Kit',
    category: 'irrigation',
    description: '3HP solar pump with 12 panels and controller.',
    images: ['https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80'],
    price: { amount: 8900, originalPrice: 9500 },
    stock: 6,
    shipping: { freeShipping: true },
  },
  {
    _id: 'product_4',
    name: 'Backpack Sprayer 20L',
    category: 'sprayers',
    description: 'Durable manual sprayer with brass nozzle.',
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80'],
    price: { amount: 120 },
    stock: 0,
    shipping: { freeShipping: false },
  },
];

const schemes = [
  {
    _id: 'scheme_1',
    type: 'subsidy',
    category: 'fertilizer',
    name: 'National Fertilizer Subsidy 2024',
    description: '50% subsidy on urea and TSP for registered paddy farmers.',
    benefits: { amount: 50000, description: 'Per registered hectare' },
    eligibility: { criteria: ['Registered paddy farmer', 'Maximum 5 hectares', 'Updated land records'] },
  },
  {
    _id: 'scheme_2',
    type: 'loan',
    category: 'equipment',
    name: 'Agri Machinery Low Interest Loan',
    description: '4% interest loan for tractors and harvesters with 5-year tenure.',
    benefits: { amount: 2000000, description: '5 year repayment with grace period' },
    eligibility: { criteria: ['Farming income proof', 'Collateral or guarantor', 'Credit score above 650'] },
  },
  {
    _id: 'scheme_3',
    type: 'training',
    category: 'organic-farming',
    name: 'Organic Farming Transition Program',
    description: '12-week training with input grants for farmers moving to organic.',
    benefits: { amount: 150000, description: 'Training stipend and input vouchers' },
    eligibility: { criteria: ['Farm size under 10 acres', 'Commitment to organic standards', 'Soil test reports'] },
  },
];

const applications = [
  {
    _id: 'application_1',
    scheme: { _id: 'scheme_1', name: 'National Fertilizer Subsidy 2024' },
    status: 'approved',
    appliedAt: new Date('2023-12-15T09:00:00Z'),
  },
  {
    _id: 'application_2',
    scheme: { _id: 'scheme_2', name: 'Agri Machinery Low Interest Loan' },
    status: 'pending',
    appliedAt: new Date('2024-01-05T09:00:00Z'),
  },
];

const courses = [
  {
    _id: 'course_1',
    title: 'Precision Farming 101',
    description: 'Use IoT sensors and data to optimize irrigation and fertilizer use.',
    category: 'technology',
    level: 'intermediate',
    duration: 12,
    rating: { average: 4.6, count: 240 },
    instructor: { name: 'Dr. Nimal Perera' },
    enrolledStudents: 8200,
    thumbnail: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'course_2',
    title: 'Organic Pest Management',
    description: 'Natural pest control methods and bio-pesticides for vegetables.',
    category: 'pest-control',
    level: 'beginner',
    duration: 8,
    rating: { average: 4.3, count: 180 },
    instructor: { name: 'Eng. Sajani Silva' },
    enrolledStudents: 5200,
    thumbnail: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'course_3',
    title: 'Smart Irrigation Design',
    description: 'Design efficient drip and sprinkler systems for different crops.',
    category: 'irrigation',
    level: 'advanced',
    duration: 10,
    rating: { average: 4.7, count: 320 },
    instructor: { name: 'Prof. Ruwan Dias' },
    enrolledStudents: 6100,
    thumbnail: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    _id: 'course_4',
    title: 'Agri Business Fundamentals',
    description: 'Pricing, branding, and distribution for farm produce.',
    category: 'business',
    level: 'beginner',
    duration: 6,
    rating: { average: 4.1, count: 140 },
    instructor: { name: 'Chamari Gunasekara' },
    enrolledStudents: 3100,
    thumbnail: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
  },
];

const loans = [
  {
    _id: 'loan_1',
    purpose: 'seeds',
    amount: 250000,
    duration: 12,
    status: 'active',
    appliedAt: new Date('2023-11-10T09:00:00Z'),
  },
  {
    _id: 'loan_2',
    purpose: 'equipment',
    amount: 1200000,
    duration: 36,
    status: 'pending',
    appliedAt: new Date('2024-01-02T09:00:00Z'),
  },
  {
    _id: 'loan_3',
    purpose: 'expansion',
    amount: 750000,
    duration: 24,
    status: 'approved',
    appliedAt: new Date('2023-12-05T09:00:00Z'),
  },
];

const creditScore = {
  score: 720,
  rating: 'Good',
  lastUpdated: new Date('2024-01-12T09:00:00Z'),
};

const farms = [
  {
    _id: 'farm_1',
    name: 'Green Valley Farms',
    landSize: 12,
    location: 'Kegalle',
    createdAt: new Date('2022-06-01T09:00:00Z'),
    currentCrops: [
      { cropName: 'Paddy', variety: 'BG 360', area: 6, plantedDate: new Date('2023-12-15T09:00:00Z'), status: 'growing' },
      { cropName: 'Chilli', variety: 'MI Green', area: 2.5, plantedDate: new Date('2023-11-10T09:00:00Z'), status: 'growing' },
      { cropName: 'Maize', variety: 'Pacific 999', area: 1.5, plantedDate: new Date('2023-10-20T09:00:00Z'), status: 'harvested' },
    ],
    revenue: [
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
  },
];

const groups = [
  {
    _id: 'group_1',
    name: 'Rice Farmers LK',
    description: 'Community for rice farmers across Sri Lanka.',
    category: 'crop-management',
    memberCount: 12500,
    image: '🌾',
    createdAt: new Date('2023-06-01'),
  },
  {
    _id: 'group_2',
    name: 'Organic Farming',
    description: 'Promoting sustainable and organic farming practices.',
    category: 'technology',
    memberCount: 8300,
    image: '🌱',
    createdAt: new Date('2023-07-15'),
  },
  {
    _id: 'group_3',
    name: 'Tea Growers',
    description: 'Network for tea estate owners and workers.',
    category: 'general',
    memberCount: 6700,
    image: '🍵',
    createdAt: new Date('2023-08-20'),
  },
];

// In-memory connection data
// { _id, senderId, senderName, senderAvatar, receiverId, status: 'pending'|'accepted'|'declined', createdAt }
const connectionRequests = [];

// { _id, users: [userId1, userId2], createdAt }
const connections = [];

module.exports = {
  users,
  socialPosts,
  weatherData,
  tickets,
  marketListings,
  marketplaceProducts,
  schemes,
  applications,
  courses,
  loans,
  creditScore,
  farms,
  groups,
  connectionRequests,
  connections,
  generateId,
};
