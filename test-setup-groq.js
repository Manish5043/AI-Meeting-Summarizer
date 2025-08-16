const mongoose = require('mongoose');
const { Groq } = require('groq');
require('dotenv').config();

async function testSetup() {
  console.log('🧪 Testing MERN Stack Setup...\n');

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables:');
  const requiredVars = ['MONGODB_URI', 'GROQ_API_KEY', 'EMAIL_USER', 'EMAIL_PASS'];
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

  // Test 3: Groq API
  console.log('\n3. Testing Groq API:');
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message.'
        }
      ],
      model: 'llama3-8b-8192',
      max_tokens: 10,
    });
    
    if (completion.choices && completion.choices[0]) {
      console.log('   ✅ Groq API: Working correctly');
    } else {
      console.log('   ❌ Groq API: No response received');
    }
  } catch (error) {
    console.log(`   ❌ Groq API: Test failed - ${error.message}`);
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

