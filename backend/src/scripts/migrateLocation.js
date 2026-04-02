/**
 * Migration Script: Fix location field for GeoJSON
 * - Convert string location to GeoJSON format
 * - Fix empty string location to default [0, 0]
 * - Ensure 2dsphere index exists
 *
 * Run: node src/scripts/migrateLocation.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from '../config/index.js';

dotenv.config();

// Sample coordinates mapping for Vietnamese cities
const CITY_COORDINATES = {
  'can tho': [105.7872, 10.0341],
  'cần thơ': [105.7872, 10.0341],
  'ho chi minh': [106.6297, 10.8231],
  'hồ chí minh': [106.6297, 10.8231],
  'hcm': [106.6297, 10.8231],
  'hanoi': [105.8412, 21.0285],
  'hà nội': [105.8412, 21.0285],
  'đà nẵng': [108.2060, 16.0541],
  'da nang': [108.2060, 16.0541],
  'hải phòng': [106.6661, 20.8449],
  'hai phong': [106.6661, 20.8449],
  'quảng ninh': [107.0264, 21.0116],
  'thái nguyên': [105.8444, 21.5940],
  'hai duong': [106.3170, 20.8659],
  'hưng yên': [105.9722, 20.6464],
  'bắc ninh': [106.0766, 21.1864],
  'vĩnh phúc': [105.6049, 21.3065],
  'nam định': [106.1651, 20.4191],
  'ninh bình': [105.9741, 20.2508],
  'thanh hóa': [105.7850, 19.8107],
  'nghệ an': [104.9174, 18.6926],
  'hà tĩnh': [105.9009, 18.3358],
  'đà lạt': [108.4612, 11.9404],
  'da lat': [108.4612, 11.9404],
  'khánh hòa': [109.1937, 12.2388],
  'bình định': [109.2433, 13.7829],
  'quảng nam': [108.0677, 15.5755],
  'quảng ngãi': [108.7924, 15.1201],
  'bình dương': [106.6659, 11.0694],
  'đồng nai': [107.0173, 10.8226],
  'bà rịa': [107.1841, 10.3730],
  'vũng tàu': [107.0828, 10.4109],
  'tiền giang': [106.2420, 10.4492],
  'bến tre': [106.3751, 10.2343],
  'trà vinh': [106.3387, 9.9380],
  'vĩnh long': [105.9725, 10.2417],
  'an giang': [105.1537, 10.5109],
  'kiên giang': [105.1843, 10.3552],
  'cà mau': [105.1851, 9.1769],
  'bạc liêu': [105.7268, 9.2951],
  'sóc trăng': [105.9719, 9.6021],
  'hậu giang': [105.4893, 10.1933],
  'long an': [106.6882, 10.5386],
  'tây ninh': [106.0789, 11.3340],
  'bình phước': [106.9197, 11.7517],
  'lâm đồng': [108.4612, 11.9404],
  'phú yên': [109.2204, 13.0889],
  'yên bái': [104.8209, 21.7208],
  'lào cai': [103.9702, 22.3376],
  'sơn la': [103.9183, 21.1148],
  'lai châu': [103.3573, 22.3956],
  'hà giang': [104.9833, 22.8232],
  'tuyên quang': [105.2149, 21.7748],
  'phú thọ': [105.2057, 21.3731],
  'bắc kạn': [105.8389, 22.1473],
  'thái bình': [106.3401, 20.4491],
  'hải dương': [106.3333, 20.9409],
  'quảng bình': [106.6025, 17.6108],
  'quảng trị': [107.1001, 16.7420],
  'thừa thiên huế': [107.5111, 16.4619],
  'bắc giang': [106.2384, 21.2777],
  'hòa bình': [105.3902, 20.8147],
  'sắk lắk': [108.0372, 12.8797],
  'đắk lắk': [108.0372, 12.8797],
  'gia lai': [108.1094, 13.8181],
  'kon tum': [108.0078, 14.3505],
  'đắk nông': [107.8274, 12.2597],
  'bình thuận': [108.0681, 10.9264],
  'ninh thuận': [108.8377, 11.5644],
};

async function migrateLocation() {
  try {
    console.log('===========================================');
    console.log('   LOCATION MIGRATION SCRIPT');
    console.log('===========================================\n');

    await mongoose.connect(config.mongodbUri);
    console.log('✓ Connected to MongoDB\n');

    const User = (await import('../models/User.js')).default;

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    // === FIX 1: Fix empty string location ("") ===
    console.log('[STEP 1] Fixing users with empty string location...');
    const usersWithEmptyString = await User.find({
      $or: [
        { location: '' },
        { location: { $type: 'string', $eq: '' } }
      ]
    });

    console.log(`  Found ${usersWithEmptyString.length} users with empty string location`);

    for (const user of usersWithEmptyString) {
      try {
        // Must $unset first, then let schema default take over
        await User.collection.updateOne(
          { _id: user._id },
          [
            { $unset: 'location' },
            { $set: { location: { type: 'Point', coordinates: [0, 0] } } }
          ]
        );
        migrated++;
        console.log(`    ✓ ${user.username}: "" → default [0, 0]`);
      } catch (err) {
        errors++;
        console.log(`    ✗ ${user.username}: Error - ${err.message}`);
      }
    }

    // === FIX 2: Convert old string location to GeoJSON ===
    console.log('\n[STEP 2] Converting old string locations to GeoJSON...');
    const usersWithOldLocation = await User.find({
      location: { $type: 'string', $ne: '' },
      $or: [
        { 'location.type': { $exists: false } },
        { location: { $not: { $type: 'object' } } }
      ]
    });

    console.log(`  Found ${usersWithOldLocation.length} users with old string location`);

    for (const user of usersWithOldLocation) {
      const locationStr = user.location?.toLowerCase?.()?.trim() || '';

      if (CITY_COORDINATES[locationStr]) {
        try {
          const [lng, lat] = CITY_COORDINATES[locationStr];
          // CRITICAL: Must $unset first, then $set full object
          // Using aggregation pipeline ($set with full object) to avoid
          // "Cannot create field 'coordinates'" error
          await User.collection.updateOne(
            { _id: user._id },
            [
              { $unset: 'location' },
              { $set: { location: { type: 'Point', coordinates: [lng, lat] } } }
            ]
          );
          migrated++;
          console.log(`    ✓ ${user.username}: "${user.location}" → [${lng}, ${lat}]`);
        } catch (err) {
          errors++;
          console.log(`    ✗ ${user.username}: Error - ${err.message}`);
        }
      } else {
        // No mapping found - set to default [0, 0]
        try {
          await User.collection.updateOne(
            { _id: user._id },
            [
              { $unset: 'location' },
              { $set: { location: { type: 'Point', coordinates: [0, 0] } } }
            ]
          );
          skipped++;
          console.log(`    - ${user.username}: "${user.location}" → [0, 0] (no mapping)`);
        } catch (err) {
          errors++;
          console.log(`    ✗ ${user.username}: Error - ${err.message}`);
        }
      }
    }

    // === FIX 3: Fix users with invalid GeoJSON (missing type or coordinates) ===
    console.log('\n[STEP 3] Fixing users with invalid GeoJSON...');
    const usersWithInvalidGeoJSON = await User.find({
      location: { $type: 'object' },
      $or: [
        { 'location.type': { $nin: ['Point', 'LineString', 'Polygon'] } },
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': { $not: { $type: 'array' } } }
      ]
    });

    console.log(`  Found ${usersWithInvalidGeoJSON.length} users with invalid GeoJSON`);

    for (const user of usersWithInvalidGeoJSON) {
      try {
        await User.collection.updateOne(
          { _id: user._id },
          [
            { $unset: 'location' },
            { $set: { location: { type: 'Point', coordinates: [0, 0] } } }
          ]
        );
        migrated++;
        console.log(`    ✓ ${user.username}: invalid → [0, 0]`);
      } catch (err) {
        errors++;
        console.log(`    ✗ ${user.username}: Error - ${err.message}`);
      }
    }

    // === FIX 4: Ensure 2dsphere index exists ===
    console.log('\n[STEP 4] Ensuring 2dsphere index exists...');
    try {
      await User.collection.createIndex({ location: '2dsphere' }, { background: true });
      console.log('  ✓ 2dsphere index is ready\n');
    } catch (err) {
      if (err.code === 85 || err.code === 86) {
        console.log('  ⚠ Index already exists with different options, trying to drop and recreate...');
        try {
          await User.collection.dropIndex('location_2dsphere');
          await User.collection.createIndex({ location: '2dsphere' }, { background: true });
          console.log('  ✓ Index recreated successfully\n');
        } catch (dropErr) {
          console.log(`  ✗ Could not recreate index: ${dropErr.message}\n`);
        }
      } else {
        console.log(`  ⚠ Index creation note: ${err.message}\n`);
      }
    }

    // === SUMMARY ===
    console.log('===========================================');
    console.log('   MIGRATION COMPLETE');
    console.log('===========================================');
    console.log(`  Migrated: ${migrated}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Errors:   ${errors}`);
    console.log('===========================================\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateLocation();
