/**
 * Test script for all errors
 */

const BASE_URL = 'http://localhost:5000/api';

async function test() {
  console.log('🧪 Bắt đầu test...\n');

  // Test 1: Update location với user có location là string
  console.log('=== TEST 1: Update Location (MongoDB location error) ===');
  try {
    // Tạo user test trước
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testloc_' + Date.now(),
        email: 'testloc_' + Date.now() + '@test.com',
        password: 'Test123!',
        confirmPassword: 'Test123!'
      })
    });
    const registerData = await registerRes.json();
    
    if (!registerData.token) {
      console.log('❌ Register failed:', registerData);
      return;
    }
    
    const token = registerData.token;
    console.log('✅ User registered:', registerData.user?.username);

    // Thử update location (đây là nơi lỗi xảy ra)
    const locRes = await fetch(`${BASE_URL}/discovery/update-location`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        latitude: 10.0452,
        longitude: 105.7469,
        locationText: 'Can Tho, Vietnam'
      })
    });
    const locData = await locRes.json();
    console.log('📍 Update location response:', locData.success ? '✅ SUCCESS' : '❌ FAILED', locData.message || '');
    
  } catch (err) {
    console.log('❌ Test 1 error:', err.message);
  }

  // Test 2: Google OAuth
  console.log('\n=== TEST 2: Google OAuth (Bad Request) ===');
  console.log('⚠️  Cần OAuth flow - test thủ công qua browser:');
  console.log(`   1. Mở: http://localhost:5000/api/auth/google`);
  console.log('   2. Hoặc kiểm tra Google Console credentials\n');

  // Test 3: Google Token Login (alternative method)
  console.log('=== TEST 3: Google Token Login ===');
  try {
    const googleTokenRes = await fetch(`${BASE_URL}/auth/google/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'invalid-test-token'
      })
    });
    const googleData = await googleTokenRes.json();
    console.log('📮 Google token login response:', googleData.success ? '✅ SUCCESS' : '❌ FAILED (expected)');
    if (!googleData.success) {
      console.log('   Message:', googleData.message);
    }
  } catch (err) {
    console.log('❌ Test 3 error:', err.message);
  }

  console.log('\n🧪 Test hoàn tất!');
}

test();
