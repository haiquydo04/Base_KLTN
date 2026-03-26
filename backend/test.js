// test-env.js - Chạy riêng
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('❌ GOOGLE_CLIENT_ID chưa được set!');
  console.log('Current .env content:', process.env);
  process.exit(1);
} else {
  console.log('✅ GOOGLE_CLIENT_ID đã được load');
}