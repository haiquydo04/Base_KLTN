import mongoose from 'mongoose';
import config from './src/config/index.js';

async function cleanAndFix() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('=== Connected to MongoDB ===\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // 1. Kiểm tra tất cả users
    console.log('1. KIỂM TRA TẤT CẢ USERS:');
    const allUsers = await collection.find({}).toArray();
    console.log(`   Tổng users: ${allUsers.length}`);
    
    allUsers.forEach((user, idx) => {
      console.log(`\n   User ${idx + 1}:`);
      console.log(`     _id: ${user._id}`);
      console.log(`     username: ${user.username}`);
      console.log(`     email: ${user.email}`);
      console.log(`     loginMethod: ${user.loginMethod}`);
      console.log(`     facebookId: ${user.facebookId} (type: ${typeof user.facebookId})`);
      console.log(`     googleId: ${user.googleId} (type: ${typeof user.googleId})`);
    });
    
    // 2. Xóa field null
    console.log('\n\n2. XÓA FIELD NULL:');
    
    const update1 = await collection.updateMany(
      { facebookId: null },
      { $unset: { facebookId: "" } }
    );
    console.log(`   ✅ Xóa facebookId=null: ${update1.modifiedCount} users`);
    
    const update2 = await collection.updateMany(
      { googleId: null },
      { $unset: { googleId: "" } }
    );
    console.log(`   ✅ Xóa googleId=null: ${update2.modifiedCount} users`);
    
    const update3 = await collection.updateMany(
      { facebookId: "" },
      { $unset: { facebookId: "" } }
    );
    console.log(`   ✅ Xóa facebookId="": ${update3.modifiedCount} users`);
    
    const update4 = await collection.updateMany(
      { googleId: "" },
      { $unset: { googleId: "" } }
    );
    console.log(`   ✅ Xóa googleId="": ${update4.modifiedCount} users`);
    
    // 3. Verify indexes
    console.log('\n3. VERIFY INDEXES:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      if (idx.name === 'facebookId_1' || idx.name === 'googleId_1') {
        console.log(`   - ${idx.name}: unique=${idx.unique}, partial=${JSON.stringify(idx.partialFilterExpression)}`);
      }
    });
    
    // 4. Test insert user mới
    console.log('\n4. TEST INSERT USER MỚI:');
    try {
      const result = await collection.insertOne({
        username: 'test_' + Date.now(),
        email: 'test_' + Date.now() + '@example.com',
        passwordHash: 'dummy_hash',
        loginMethod: 'email',
        isEmailVerified: false,
        profileCompletion: 0
        // KHÔNG set facebookId/googleId
      });
      console.log(`   ✅ Insert thành công: ${result.insertedId}`);
      
      // Xóa user test
      await collection.deleteOne({ _id: result.insertedId });
      console.log(`   ✅ Đã xóa user test`);
    } catch (e) {
      console.log(`   ❌ Insert thất bại: ${e.message}`);
    }
    
    // 5. Thử đăng ký user mới
    console.log('\n5. TEST REGISTER (sử dụng backend API):');
    const testEmail = 'register_test_' + Date.now() + '@test.com';
    console.log(`   Email test: ${testEmail}`);
    
    await mongoose.disconnect();
    console.log('\n=== HOÀN THÀNH ===');
    
  } catch (e) {
    console.error('❌ Error:', e.message);
    if (e.code === 11000) {
      console.error('   Duplicate key - vẫn còn null trong database');
    }
  }
}

cleanAndFix();
