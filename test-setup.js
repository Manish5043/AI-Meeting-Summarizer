const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

async function testSetup() {
  console.log('🧪 Testing MERN Stack Setup (OpenAI)...\n');

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables:');
  const requiredVars = ['MONGODB_URI', 'HUGGINGFACE_API_KEY', 'EMAIL_USER', 'EMAIL_PASS'];
  let allVarsPresent = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName}: Set`);
    } else {
      console.log(`   ❌ ${varName}: Missing`);
      allVarsPresent = false;
    }
  });

  if (!allVarsPresent) {
    console.log('\n⚠️  Some environment variables are missing. Please check your .env file.');
    return;
  }

  // Test 2: MongoDB Connection
  console.log('\n2. Testing MongoDB Connection:');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('   ✅ MongoDB: Connected successfully');
    await mongoose.connection.close();
  } catch (error) {
    console.log(`   ❌ MongoDB: Connection failed - ${error.message}`);
    return;
  }

  // Test 3: Hugging Face API
  console.log('\n3. Testing Hugging Face API:');
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        inputs: 'Hello, this is a test message for summarization.',
        parameters: {
          max_length: 50,
          min_length: 10,
          do_sample: false
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data[0] && response.data[0].summary_text) {
      console.log('   ✅ Hugging Face API: Working correctly');
    } else {
      console.log('   ❌ Hugging Face API: No response received');
    }
  } catch (error) {
    console.log(`   ❌ Hugging Face API: Test failed - ${error.message}`);
  }

  // Test 4: Dependencies
  console.log('\n4. Checking Dependencies:');
  try {
    const express = require('express');
    const cors = require('cors');
    const nodemailer = require('nodemailer');
    console.log('   ✅ All required packages: Installed');
  } catch (error) {
    console.log(`   ❌ Dependencies: ${error.message}`);
  }

  console.log('\n🎉 Setup test completed!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run install:all');
  console.log('2. Run: npm run dev:full');
  console.log('3. Open: http://localhost:3000');
}

testSetup().catch(console.error);

