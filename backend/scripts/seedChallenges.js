console.log("📦 Seeding script loaded...");

const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Challenge = require('../models/Challenge');
const challenges = require('../data/challenges.json');

console.log(`🔢 Loaded ${challenges.length} challenges from JSON`);
console.log(`🌍 Mongo URI: ${process.env.MONGO_URI}`);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Challenge.deleteMany();
    console.log('🧹 Cleared old challenges');

    const result = await Challenge.insertMany(challenges);
    console.log(`✅ Inserted ${result.length} challenges`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding challenges:', err);
    process.exit(1);
  }
};

seed();
