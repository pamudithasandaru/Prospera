
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { db, isFirestoreEnabled } = require('../server/services/firestore');
const sampleData = require('../server/data/sampleData');

async function seed() {
  if (!isFirestoreEnabled || !db) {
    console.error('❌ Firestore is not enabled. Please check your credentials.');
    process.exit(1);
  }

  console.log('🚀 Starting Firestore seeding...');

  try {
    const collections = [
      { name: 'users', data: sampleData.users },
      { name: 'socialPosts', data: sampleData.socialPosts },
      { name: 'marketListings', data: sampleData.marketListings },
      { name: 'marketplaceProducts', data: sampleData.marketplaceProducts },
      { name: 'schemes', data: sampleData.schemes },
      { name: 'courses', data: sampleData.courses },
      { name: 'farms', data: sampleData.farms },
    ];

    for (const collection of collections) {
      console.log(`\n📦 Seeding collection: ${collection.name}...`);
      const batch = db.batch();
      
      for (const item of collection.data) {
        // Remove _id from data as it will be used as the document ID
        const { _id, ...data } = item;
        const docRef = db.collection(collection.name).doc(_id || sampleData.generateId(collection.name));
        batch.set(docRef, data);
        console.log(`   - Added document: ${docRef.id}`);
      }
      
      await batch.commit();
      console.log(`✅ ${collection.name} seeded successfully.`);
    }

    console.log('\n✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

seed();
