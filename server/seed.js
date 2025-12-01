const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Farm = require('./models/Farm');
const { MarketListing, PriceTracking } = require('./models/Market');
const { Post, Group, Article } = require('./models/Social');
const { Course } = require('./models/Learning');
const { Product } = require('./models/Marketplace');
const { Scheme } = require('./models/Government');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prospera';

mongoose.connect(mongoUri)
.then(() => console.log('✅ MongoDB Connected for Seeding'))
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Seed data
const seedData = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Farm.deleteMany({});
    await MarketListing.deleteMany({});
    await PriceTracking.deleteMany({});
    await Post.deleteMany({});
    await Group.deleteMany({});
    await Article.deleteMany({});
    await Course.deleteMany({});
    await Product.deleteMany({});
    await Scheme.deleteMany({});

    console.log('👥 Creating users...');

    // Create users with hashed passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.create([
      {
        name: 'Sunil Perera',
        email: 'sunil@farmer.lk',
        phone: '+94771234567',
        password: hashedPassword,
        role: 'farmer',
        language: 'SI',
        profile: {
          bio: 'Experienced rice farmer from Anuradhapura',
          location: {
            district: 'Anuradhapura',
            province: 'North Central Province',
            coordinates: [80.4037, 8.3114]
          },
          profilePicture: 'https://i.pravatar.cc/150?img=12'
        },
        farmDetails: {
          farmSize: 5.5,
          mainCrops: ['Rice', 'Vegetables'],
          farmingExperience: 15
        }
      },
      {
        name: 'Kamala Silva',
        email: 'kamala@farmer.lk',
        phone: '+94772345678',
        password: hashedPassword,
        role: 'farmer',
        language: 'SI',
        profile: {
          bio: 'Organic tea plantation owner',
          location: {
            district: 'Nuwara Eliya',
            province: 'Central Province',
            coordinates: [80.7891, 6.9497]
          },
          profilePicture: 'https://i.pravatar.cc/150?img=47'
        },
        farmDetails: {
          farmSize: 10.2,
          mainCrops: ['Tea', 'Vegetables'],
          farmingExperience: 20
        }
      },
      {
        name: 'Raj Kumar',
        email: 'raj@buyer.lk',
        phone: '+94773456789',
        password: hashedPassword,
        role: 'buyer',
        language: 'TA',
        profile: {
          bio: 'Wholesale buyer for export markets',
          location: {
            district: 'Colombo',
            province: 'Western Province',
            coordinates: [79.8612, 6.9271]
          },
          profilePicture: 'https://i.pravatar.cc/150?img=33'
        }
      },
      {
        name: 'Dr. Nimal Fernando',
        email: 'nimal@expert.lk',
        phone: '+94774567890',
        password: hashedPassword,
        role: 'expert',
        language: 'EN',
        profile: {
          bio: 'Agricultural scientist specializing in crop diseases',
          location: {
            district: 'Kandy',
            province: 'Central Province',
            coordinates: [80.6337, 7.2906]
          },
          profilePicture: 'https://i.pravatar.cc/150?img=68',
          expertise: ['Plant Pathology', 'Integrated Pest Management', 'Soil Science']
        }
      },
      {
        name: 'Admin User',
        email: 'admin@prospera.lk',
        phone: '+94775678901',
        password: hashedPassword,
        role: 'admin',
        language: 'EN',
        profile: {
          bio: 'Platform administrator',
          location: {
            district: 'Colombo',
            province: 'Western Province',
            coordinates: [79.8612, 6.9271]
          }
        }
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Get farmer users for farm creation
    const farmers = users.filter(u => u.role === 'farmer');

    console.log('🌾 Creating farms...');

    const farms = await Farm.create([
      {
        owner: farmers[0]._id,
        name: 'Perera Rice Farm',
        landSize: 5.5,
        location: {
          type: 'Point',
          coordinates: [80.4037, 8.3114],
          address: 'Mihintale Road, Anuradhapura',
          district: 'Anuradhapura',
          region: 'North Central Province'
        },
        soilData: {
          pH: 6.5,
          nitrogen: 45,
          phosphorus: 30,
          potassium: 38
        },
        currentCrops: [
          {
            cropName: 'Rice',
            variety: 'BG 352',
            plantedDate: new Date('2024-10-15'),
            expectedHarvestDate: new Date('2025-02-15'),
            area: 4.0,
            status: 'growing'
          },
          {
            cropName: 'Vegetables',
            variety: 'Green Beans',
            plantedDate: new Date('2024-11-01'),
            expectedHarvestDate: new Date('2025-01-15'),
            area: 1.5,
            status: 'growing'
          }
        ],
        expenses: [
          {
            category: 'seeds',
            amount: 15000,
            description: 'BG 352 rice seeds',
            date: new Date('2024-10-10')
          },
          {
            category: 'fertilizer',
            amount: 25000,
            description: 'NPK fertilizer',
            date: new Date('2024-11-01')
          },
          {
            category: 'pesticides',
            amount: 8000,
            description: 'Organic pesticide',
            date: new Date('2024-11-15')
          }
        ],
        revenue: [
          {
            cropName: 'Rice',
            quantity: 2000,
            pricePerUnit: 75,
            totalAmount: 150000,
            saleDate: new Date('2024-08-20'),
            buyer: 'Local Mill'
          }
        ]
      },
      {
        owner: farmers[1]._id,
        name: 'Silva Tea Estate',
        landSize: 10.2,
        location: {
          type: 'Point',
          coordinates: [80.7891, 6.9497],
          address: 'Pedro Estate, Nuwara Eliya',
          district: 'Nuwara Eliya',
          region: 'Central Province'
        },
        soilData: {
          pH: 5.8,
          nitrogen: 50,
          phosphorus: 35,
          potassium: 42
        },
        currentCrops: [
          {
            cropName: 'Tea',
            variety: 'Ceylon Black Tea',
            plantedDate: new Date('2020-03-01'),
            area: 8.0,
            status: 'growing'
          },
          {
            cropName: 'Vegetables',
            variety: 'Cabbage',
            plantedDate: new Date('2024-10-20'),
            expectedHarvestDate: new Date('2025-01-20'),
            area: 2.2,
            status: 'growing'
          }
        ],
        expenses: [
          {
            category: 'labor',
            amount: 45000,
            description: 'Tea plucking labor',
            date: new Date('2024-11-01')
          },
          {
            category: 'fertilizer',
            amount: 35000,
            description: 'Tea fertilizer',
            date: new Date('2024-10-15')
          }
        ],
        revenue: [
          {
            cropName: 'Tea',
            quantity: 500,
            pricePerUnit: 450,
            totalAmount: 225000,
            saleDate: new Date('2024-10-30'),
            buyer: 'Ceylon Tea Exporters'
          }
        ]
      }
    ]);

    console.log(`✅ Created ${farms.length} farms`);

    console.log('🛒 Creating market listings...');

    const marketListings = await MarketListing.create([
      {
        seller: farmers[0]._id,
        productName: 'Premium Rice',
        category: 'grains',
        variety: 'BG 352',
        quantity: 1000,
        unit: 'kg',
        pricePerUnit: 80,
        qualityGrade: 'A',
        listingType: 'wholesale',
        location: {
          district: 'Anuradhapura',
          province: 'North Central Province',
          coordinates: [80.4037, 8.3114]
        },
        harvestDate: new Date('2024-11-20'),
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
        status: 'active'
      },
      {
        seller: farmers[1]._id,
        productName: 'Organic Ceylon Tea',
        category: 'tea',
        variety: 'Black Tea',
        quantity: 200,
        unit: 'kg',
        pricePerUnit: 500,
        qualityGrade: 'Premium',
        listingType: 'export',
        certifications: ['Organic', 'Fair Trade'],
        location: {
          district: 'Nuwara Eliya',
          province: 'Central Province',
          coordinates: [80.7891, 6.9497]
        },
        harvestDate: new Date('2024-11-25'),
        images: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400'],
        status: 'active'
      }
    ]);

    console.log(`✅ Created ${marketListings.length} market listings`);

    console.log('📊 Creating price tracking data...');

    await PriceTracking.create([
      {
        productName: 'Rice',
        category: 'grains',
        market: 'Colombo Manning Market',
        pricePerUnit: 85,
        unit: 'kg',
        date: new Date('2024-11-28')
      },
      {
        productName: 'Rice',
        category: 'grains',
        market: 'Colombo Manning Market',
        pricePerUnit: 82,
        unit: 'kg',
        date: new Date('2024-11-25')
      },
      {
        productName: 'Tea',
        category: 'tea',
        market: 'Colombo Tea Auction',
        pricePerUnit: 520,
        unit: 'kg',
        date: new Date('2024-11-28')
      }
    ]);

    console.log('📱 Creating social posts...');

    const posts = await Post.create([
      {
        author: farmers[0]._id,
        content: 'Just harvested my first batch of BG 352 rice! The yield is excellent this season. 🌾',
        images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'],
        likes: [farmers[1]._id, users[3]._id],
        comments: [
          {
            user: users[3]._id,
            text: 'Congratulations! That variety performs well in your region.',
            createdAt: new Date('2024-11-29')
          }
        ]
      },
      {
        author: users[3]._id,
        content: 'Farmers: Watch out for brown spot disease in paddy fields during this rainy season. Early detection is key!',
        tags: ['disease-alert', 'rice', 'tips'],
        likes: [farmers[0]._id, farmers[1]._id]
      }
    ]);

    console.log(`✅ Created ${posts.length} social posts`);

    console.log('👥 Creating groups...');

    const groups = await Group.create([
      {
        name: 'Rice Farmers Sri Lanka',
        description: 'Community for rice farmers to share experiences and tips',
        category: 'crop-specific',
        createdBy: farmers[0]._id,
        members: [
          { user: farmers[0]._id, role: 'admin', joinedAt: new Date('2024-10-01') },
          { user: farmers[1]._id, role: 'member', joinedAt: new Date('2024-10-15') },
          { user: users[3]._id, role: 'moderator', joinedAt: new Date('2024-10-05') }
        ],
        privacy: 'public'
      },
      {
        name: 'Organic Farming Practices',
        description: 'Learn and share organic farming techniques',
        category: 'farming-practice',
        createdBy: farmers[1]._id,
        members: [
          { user: farmers[1]._id, role: 'admin', joinedAt: new Date('2024-09-15') },
          { user: farmers[0]._id, role: 'member', joinedAt: new Date('2024-10-01') }
        ],
        privacy: 'public'
      }
    ]);

    console.log(`✅ Created ${groups.length} groups`);

    console.log('📚 Creating courses...');

    const courses = await Course.create([
      {
        title: 'Modern Rice Cultivation Techniques',
        instructor: users[3]._id,
        description: 'Comprehensive course on modern rice farming methods for Sri Lankan farmers',
        category: 'crop-management',
        language: 'SI',
        level: 'intermediate',
        duration: 8,
        thumbnail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
        syllabus: [
          {
            title: 'Introduction to Modern Rice Farming',
            duration: 60,
            videoUrl: 'https://example.com/video1',
            resources: ['lecture_notes.pdf'],
            order: 1
          },
          {
            title: 'Seed Selection and Preparation',
            duration: 45,
            videoUrl: 'https://example.com/video2',
            resources: ['seed_guide.pdf'],
            order: 2
          },
          {
            title: 'Water Management',
            duration: 50,
            videoUrl: 'https://example.com/video3',
            order: 3
          }
        ],
        enrolledStudents: [
          {
            user: farmers[0]._id,
            enrolledAt: new Date('2024-11-01'),
            progress: 60,
            completedModules: [1, 2],
            certificateIssued: false
          }
        ],
        rating: 4.8,
        totalRatings: 45,
        price: 0,
        isPaid: false,
        status: 'published'
      },
      {
        title: 'Organic Pest Management',
        instructor: users[3]._id,
        description: 'Learn organic methods to control pests without harmful chemicals',
        category: 'pest-management',
        language: 'EN',
        level: 'beginner',
        duration: 5,
        thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
        syllabus: [
          {
            title: 'Understanding Common Pests',
            duration: 40,
            videoUrl: 'https://example.com/pest1',
            order: 1
          },
          {
            title: 'Natural Pest Control Methods',
            duration: 55,
            videoUrl: 'https://example.com/pest2',
            order: 2
          }
        ],
        enrolledStudents: [
          {
            user: farmers[1]._id,
            enrolledAt: new Date('2024-11-10'),
            progress: 100,
            completedModules: [1, 2],
            certificateIssued: true,
            completedAt: new Date('2024-11-20')
          }
        ],
        rating: 4.9,
        totalRatings: 67,
        price: 0,
        isPaid: false,
        status: 'published'
      }
    ]);

    console.log(`✅ Created ${courses.length} courses`);

    console.log('🛍️ Creating marketplace products...');

    const products = await Product.create([
      {
        seller: users[2]._id,
        name: 'Japanese Rice Transplanter',
        description: 'High-efficiency rice transplanting machine, suitable for 2-5 acre farms',
        category: 'machinery',
        brand: 'Kubota',
        price: 450000,
        saleType: 'sale',
        condition: 'new',
        specifications: {
          model: 'NSP-68',
          year: 2024,
          warranty: '2 years'
        },
        images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'],
        stock: 5,
        location: {
          district: 'Colombo',
          province: 'Western Province'
        },
        rating: 4.7,
        totalReviews: 12,
        status: 'active'
      },
      {
        seller: users[2]._id,
        name: 'Organic NPK Fertilizer - 50kg',
        description: 'Premium organic fertilizer suitable for all crops',
        category: 'fertilizers',
        brand: 'CIC Agro',
        price: 3500,
        saleType: 'sale',
        condition: 'new',
        images: ['https://images.unsplash.com/photo-1625246296958-e6e1f8c8f534?w=400'],
        stock: 500,
        location: {
          district: 'Colombo',
          province: 'Western Province'
        },
        rating: 4.5,
        totalReviews: 89,
        status: 'active'
      },
      {
        seller: users[2]._id,
        name: 'Agricultural Drone - DJI Agras',
        description: 'Professional spraying drone for large farms',
        category: 'drones',
        brand: 'DJI',
        price: 850000,
        saleType: 'rent',
        rentalPrice: 15000,
        rentalPeriod: 'daily',
        condition: 'new',
        specifications: {
          model: 'T30',
          sprayCapacity: '30L',
          coverage: '16 hectares/hour'
        },
        images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400'],
        stock: 2,
        location: {
          district: 'Colombo',
          province: 'Western Province'
        },
        rating: 4.9,
        totalReviews: 23,
        status: 'active'
      }
    ]);

    console.log(`✅ Created ${products.length} marketplace products`);

    console.log('🏛️ Creating government schemes...');

    await Scheme.create([
      {
        title: 'Fertilizer Subsidy Program 2025',
        description: 'Government subsidy for organic fertilizer purchase',
        type: 'subsidy',
        eligibility: ['Farmers with less than 10 acres', 'Valid farmer ID required'],
        benefits: ['50% subsidy on organic fertilizer', 'Maximum LKR 25,000 per season'],
        applicationDeadline: new Date('2025-03-31'),
        documents: ['National ID', 'Farmer Registration Certificate', 'Land Ownership Proof'],
        contactInfo: {
          phone: '+94112345678',
          email: 'subsidy@agrimin.gov.lk'
        },
        status: 'active',
        targetRegions: ['All Districts']
      },
      {
        title: 'Agricultural Insurance Scheme',
        description: 'Crop insurance for weather-related losses',
        type: 'insurance',
        eligibility: ['Registered farmers', 'Farms above 1 acre'],
        benefits: ['Coverage up to LKR 100,000 per acre', 'Weather-indexed insurance'],
        applicationDeadline: new Date('2025-12-31'),
        documents: ['National ID', 'Farmer Registration', 'Farm Survey Report'],
        contactInfo: {
          phone: '+94112345679',
          email: 'insurance@agrimin.gov.lk'
        },
        status: 'active',
        targetRegions: ['Anuradhapura', 'Polonnaruwa', 'Kurunegala', 'Hambantota']
      }
    ]);

    console.log('📝 Creating knowledge articles...');

    await Article.create([
      {
        author: users[3]._id,
        title: 'Best Practices for Rice Cultivation in Sri Lanka',
        content: `Rice is the staple food crop of Sri Lanka. Here are the best practices:
        
1. **Seed Selection**: Use certified seeds of recommended varieties like BG 352, BG 300, or BG 94-1
2. **Land Preparation**: Proper leveling ensures uniform water distribution
3. **Water Management**: Maintain 2-5 cm water depth during growing season
4. **Fertilizer Application**: Apply based on soil test results
5. **Pest Control**: Use integrated pest management techniques

Remember to monitor your crop regularly and seek expert advice when needed.`,
        category: 'farming-tips',
        tags: ['rice', 'cultivation', 'best-practices'],
        language: 'EN',
        featuredImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
        views: 245,
        likes: [farmers[0]._id, farmers[1]._id],
        status: 'published'
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Farms: ${farms.length}`);
    console.log(`   Market Listings: ${marketListings.length}`);
    console.log(`   Social Posts: ${posts.length}`);
    console.log(`   Groups: ${groups.length}`);
    console.log(`   Courses: ${courses.length}`);
    console.log(`   Products: ${products.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Farmer: sunil@farmer.lk / password123');
    console.log('   Farmer: kamala@farmer.lk / password123');
    console.log('   Buyer: raj@buyer.lk / password123');
    console.log('   Expert: nimal@expert.lk / password123');
    console.log('   Admin: admin@prospera.lk / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
