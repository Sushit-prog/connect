import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing MongoDB connection...');
console.log('URI:', MONGO_URI ? MONGO_URI.replace(/\/\/.*@/, '//<credentials>@') : 'NOT SET');
console.log('---');

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not defined');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', mongoose.connection.host);
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed');
    console.error('---');
    console.error('Error Name:', err.name);
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    console.error('---');
    console.error('FULL ERROR OBJECT:');
    console.error(JSON.stringify(err, null, 2));
    console.error('---');
    console.error('Error Keys:', Object.keys(err));
    console.error('---');
    
    if (err.code === 'ETIMEDOUT') {
      console.error('🔍 Issue: Connection timed out - check network/firewall');
    }
    if (err.code === 'ENOTFOUND') {
      console.error('🔍 Issue: Host not found - check URI hostname');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('🔍 Issue: Connection refused - check if Atlas allows your IP');
    }
    
    mongoose.connection.close();
    process.exit(1);
  });
