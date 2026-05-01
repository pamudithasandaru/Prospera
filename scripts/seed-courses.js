const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { db, isFirestoreEnabled } = require('../server/services/firestore');

const courses = [
  {
    _id: 'course_1',
    title: 'Modern Crop Management Fundamentals',
    category: 'crop-management',
    level: 'beginner',
    description:
      'Learn the essentials of modern crop management, from seed selection to harvest planning. This course covers soil preparation, planting schedules, irrigation timing, and nutrient management for small to mid-scale farms.',
    rating: { average: 4.8, count: 3420 },
    instructor: { name: 'Dr. Anika Perera' },
    duration: 12,
    enrolledStudents: 3420,
    thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Introduction to Modern Crop Management' },
      { videoId: 'dQw4w9WgXcQ', title: 'Soil Preparation Essentials' },
      { videoId: 'dQw4w9WgXcQ', title: 'Seed Selection & Planting' },
      { videoId: 'dQw4w9WgXcQ', title: 'Irrigation Strategies' },
    ],
    materials: [
      { title: 'Crop Management Best Practices Guide', format: 'PDF', size: '2.4 MB' },
      { title: 'Seasonal Planting Calendar', format: 'XLSX', size: '1.1 MB' },
      { title: 'Nutrient Schedule for Common Crops', format: 'PDF', size: '1.8 MB' },
    ],
  },
  {
    _id: 'course_2',
    title: 'Soil Science & Health Optimization',
    category: 'soil-science',
    level: 'intermediate',
    description:
      'Dive deep into soil biology, chemistry, and physics. Learn how to test, amend, and maintain soil health for maximum productivity. Covers composting, microbial activity, pH balancing, and organic matter management.',
    rating: { average: 4.6, count: 2210 },
    instructor: { name: 'Prof. Rajan Nair' },
    duration: 16,
    enrolledStudents: 2210,
    thumbnail: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Soil Biology Fundamentals' },
      { videoId: 'dQw4w9WgXcQ', title: 'Testing & Analysis' },
      { videoId: 'dQw4w9WgXcQ', title: 'Organic Matter Management' },
    ],
    materials: [
      { title: 'Soil Testing Standards', format: 'PDF', size: '3.2 MB' },
      { title: 'Soil Amendment Calculator', format: 'XLSX', size: '0.9 MB' },
    ],
  },
  {
    _id: 'course_3',
    title: 'Integrated Pest Management (IPM)',
    category: 'pest-control',
    level: 'intermediate',
    description:
      'Master the art of keeping crops safe using Integrated Pest Management techniques. Learn to identify common agricultural pests, use biological controls, apply targeted pesticides, and monitor pest cycles for minimum chemical intervention.',
    rating: { average: 4.7, count: 1875 },
    instructor: { name: 'Dr. Suresh Kumara' },
    duration: 10,
    enrolledStudents: 1875,
    thumbnail: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c0694?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Introduction to IPM' },
      { videoId: 'dQw4w9WgXcQ', title: 'Pest Identification' },
      { videoId: 'dQw4w9WgXcQ', title: 'Biological Controls' },
    ],
    materials: [
      { title: 'Integrated Pest Management Handbook', format: 'PDF', size: '4.1 MB' },
      { title: 'Pest Identification Chart', format: 'PDF', size: '2.5 MB' },
    ],
  },
  {
    _id: 'course_4',
    title: 'Smart Irrigation & Water Management',
    category: 'irrigation',
    level: 'beginner',
    description:
      'Understand water requirements for different crops and design efficient irrigation systems. Topics include drip irrigation, sprinkler systems, rainwater harvesting, soil moisture sensors, and water conservation strategies.',
    rating: { average: 4.5, count: 2640 },
    instructor: { name: 'Eng. Malika Fernando' },
    duration: 8,
    enrolledStudents: 2640,
    thumbnail: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Introduction to Smart Irrigation' },
      { videoId: 'dQw4w9WgXcQ', title: 'Drip Irrigation Systems' },
      { videoId: 'dQw4w9WgXcQ', title: 'Rainwater Harvesting Methods' },
      { videoId: 'dQw4w9WgXcQ', title: 'Soil Moisture Sensors' },
    ],
    materials: [
      { title: 'Irrigation System Design Guide', format: 'PDF', size: '3.5 MB' },
      { title: 'Water Conservation Best Practices', format: 'PDF', size: '2.1 MB' },
    ],
  },
  {
    _id: 'course_5',
    title: 'Certified Organic Farming Practices',
    category: 'organic-farming',
    level: 'beginner',
    description:
      'Start your journey into organic farming with this comprehensive certification-prep course. Learn organic certification requirements, natural fertilizers, companion planting, cover cropping, and sustainable land management.',
    rating: { average: 4.9, count: 4100 },
    instructor: { name: 'Ms. Priya Shankar' },
    duration: 20,
    enrolledStudents: 4100,
    thumbnail: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Organic Certification Requirements' },
      { videoId: 'dQw4w9WgXcQ', title: 'Natural Fertilizers' },
      { videoId: 'dQw4w9WgXcQ', title: 'Companion Planting Basics' },
      { videoId: 'dQw4w9WgXcQ', title: 'Cover Cropping Techniques' },
    ],
    materials: [
      { title: 'Organic Farming Certification Checklist', format: 'PDF', size: '1.5 MB' },
      { title: 'Approved Organic Fertilizer List', format: 'XLSX', size: '0.8 MB' },
    ],
  },
  {
    _id: 'course_6',
    title: 'Agri-Business & Farm Profitability',
    category: 'business',
    level: 'advanced',
    description:
      'Turn your farm into a profitable business. This advanced course covers farm financial planning, marketing strategies, value chain development, cooperative management, agri-tourism, and government grant applications.',
    rating: { average: 4.4, count: 1550 },
    instructor: { name: 'Mr. Dinesh Weerasinghe' },
    duration: 14,
    enrolledStudents: 1550,
    thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Farm Financial Planning' },
      { videoId: 'dQw4w9WgXcQ', title: 'Marketing Your Produce' },
      { videoId: 'dQw4w9WgXcQ', title: 'Government Grant Applications' },
    ],
    materials: [
      { title: 'Farm Business Plan Template', format: 'PDF', size: '2.0 MB' },
      { title: 'Profit & Loss Calculator', format: 'XLSX', size: '1.3 MB' },
    ],
  },
  {
    _id: 'course_7',
    title: 'Advanced Crop Disease Diagnosis',
    category: 'crop-management',
    level: 'advanced',
    description:
      'Learn to identify, diagnose, and treat over 50 common crop diseases using visual inspection and digital tools. Understand disease cycles, fungal vs bacterial infections, and develop treatment and prevention protocols.',
    rating: { average: 4.7, count: 980 },
    instructor: { name: 'Dr. Anika Perera' },
    duration: 18,
    enrolledStudents: 980,
    thumbnail: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Understanding Plant Diseases' },
      { videoId: 'dQw4w9WgXcQ', title: 'Fungal vs Bacterial Infections' },
      { videoId: 'dQw4w9WgXcQ', title: 'Digital Diagnosis Tools' },
    ],
    materials: [
      { title: 'Disease Identification Field Guide', format: 'PDF', size: '5.2 MB' },
      { title: 'Treatment Protocol Templates', format: 'PDF', size: '2.8 MB' },
    ],
  },
  {
    _id: 'course_8',
    title: 'Composting & Natural Fertilizer Production',
    category: 'organic-farming',
    level: 'beginner',
    description:
      'Transform farm waste into black gold! This hands-on course teaches vermicomposting, aerobic composting, liquid fertilizer production (Bokashi, bio-slurry), and how to apply them for different crops.',
    rating: { average: 4.6, count: 3300 },
    instructor: { name: 'Ms. Priya Shankar' },
    duration: 6,
    enrolledStudents: 3300,
    thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Introduction to Composting' },
      { videoId: 'dQw4w9WgXcQ', title: 'Vermicomposting Techniques' },
      { videoId: 'dQw4w9WgXcQ', title: 'Liquid Fertilizer Production' },
    ],
    materials: [
      { title: 'Composting Guide for Beginners', format: 'PDF', size: '1.8 MB' },
    ],
  },
  {
    _id: 'course_9',
    title: 'Precision Agriculture with Technology',
    category: 'crop-management',
    level: 'advanced',
    description:
      'Harness the power of IoT, drones, GPS mapping, and AI-driven analytics for precision farming. Learn to use sensors, satellite imagery, data dashboards, and automated systems to maximize yield and reduce waste.',
    rating: { average: 4.8, count: 760 },
    instructor: { name: 'Dr. Kavinda Jayalath' },
    duration: 22,
    enrolledStudents: 760,
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Introduction to Precision Agriculture' },
      { videoId: 'dQw4w9WgXcQ', title: 'IoT Sensors on the Farm' },
      { videoId: 'dQw4w9WgXcQ', title: 'Drone Mapping & Monitoring' },
      { videoId: 'dQw4w9WgXcQ', title: 'AI-Driven Analytics' },
    ],
    materials: [
      { title: 'Precision Farming Technology Overview', format: 'PDF', size: '4.0 MB' },
      { title: 'IoT Sensor Setup Guide', format: 'PDF', size: '2.5 MB' },
    ],
  },
  {
    _id: 'course_10',
    title: 'Soil pH & Nutrient Cycle Mastery',
    category: 'soil-science',
    level: 'advanced',
    description:
      'An in-depth exploration of macro and micronutrient cycles in agricultural soils. Learn soil testing protocols, deficiency symptom identification, fertilizer calculations, and creating custom soil amendment plans.',
    rating: { average: 4.5, count: 1120 },
    instructor: { name: 'Prof. Rajan Nair' },
    duration: 14,
    enrolledStudents: 1120,
    thumbnail: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Understanding Soil pH' },
      { videoId: 'dQw4w9WgXcQ', title: 'Macro & Micronutrient Cycles' },
      { videoId: 'dQw4w9WgXcQ', title: 'Soil Testing Protocols' },
    ],
    materials: [
      { title: 'Soil pH Testing Kit Guide', format: 'PDF', size: '1.6 MB' },
      { title: 'Fertilizer Calculation Spreadsheet', format: 'XLSX', size: '1.2 MB' },
    ],
  },
  {
    _id: 'course_11',
    title: 'Biological Pest Control Methods',
    category: 'pest-control',
    level: 'beginner',
    description:
      'Explore eco-friendly pest control using beneficial insects, natural predators, traps, and plant-based repellents. Reduce chemical costs and improve ecological balance on your farm with proven biological techniques.',
    rating: { average: 4.3, count: 1650 },
    instructor: { name: 'Dr. Suresh Kumara' },
    duration: 7,
    enrolledStudents: 1650,
    thumbnail: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Intro to Biological Pest Control' },
      { videoId: 'dQw4w9WgXcQ', title: 'Beneficial Insects & Predators' },
      { videoId: 'dQw4w9WgXcQ', title: 'Natural Traps & Repellents' },
    ],
    materials: [
      { title: 'Biological Pest Control Methods Guide', format: 'PDF', size: '2.9 MB' },
    ],
  },
  {
    _id: 'course_12',
    title: 'Farm-to-Market: Supply Chain Management',
    category: 'business',
    level: 'intermediate',
    description:
      'Learn how to efficiently move your produce from farm to end consumer. Topics include post-harvest handling, cold chain logistics, packaging, pricing strategies, direct-to-consumer channels, and digital marketplace integration.',
    rating: { average: 4.6, count: 2080 },
    instructor: { name: 'Mr. Dinesh Weerasinghe' },
    duration: 11,
    enrolledStudents: 2080,
    thumbnail: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80',
    videos: [
      { videoId: 'dQw4w9WgXcQ', title: 'Post-Harvest Handling' },
      { videoId: 'dQw4w9WgXcQ', title: 'Cold Chain Logistics' },
      { videoId: 'dQw4w9WgXcQ', title: 'Pricing & Packaging Strategies' },
      { videoId: 'dQw4w9WgXcQ', title: 'Digital Marketplace Integration' },
    ],
    materials: [
      { title: 'Supply Chain Management Guide', format: 'PDF', size: '3.3 MB' },
      { title: 'Pricing Strategy Worksheet', format: 'XLSX', size: '0.7 MB' },
    ],
  },
];

async function seedCourses() {
  if (!isFirestoreEnabled || !db) {
    console.error('❌ Firestore is not enabled. Please check your credentials.');
    process.exit(1);
  }

  console.log('🚀 Seeding courses into Firestore...\n');

  try {
    // Delete existing courses first
    const existing = await db.collection('courses').get();
    if (!existing.empty) {
      const deleteBatch = db.batch();
      existing.docs.forEach((doc) => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();
      console.log(`🗑️  Deleted ${existing.size} existing courses.`);
    }

    // Add new courses
    const batch = db.batch();
    for (const course of courses) {
      const { _id, ...data } = course;
      const docRef = db.collection('courses').doc(_id);
      batch.set(docRef, data);
      console.log(`   ✅ ${_id}: ${data.title}`);
    }

    await batch.commit();
    console.log(`\n✨ Successfully seeded ${courses.length} courses!`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding courses:', error);
    process.exit(1);
  }
}

seedCourses();
