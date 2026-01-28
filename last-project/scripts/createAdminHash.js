/**
 * Admin User Creation Utility
 * 
 * This script helps create admin users with properly hashed passwords.
 * Run this script to generate the password hash for your admin user.
 * 
 * Usage:
 * node scripts/createAdminHash.js password123
 */

const bcrypt = require('bcrypt');

async function createAdminUser() {
  const password = process.argv[2] || 'admin123';
  
  console.log('\n🔐 Admin User Hash Generator\n');
  console.log('Password:', password);
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  console.log('\n✅ Password hashed successfully!\n');
  console.log('📋 Copy this MongoDB document to create an admin user:\n');
  
  const adminUser = {
    name: "Admin User",
    email: "admin@seekers.com",
    password: hashedPassword,
    role: "admin",  // ← CRITICAL: Must be "admin" for access
    token: 10000,
    profile: {
      title: "",
      summary: "",
      location: "",
      skills: [],
      resumeUrl: "",
      education: [],
      experience: [],
      aiSummary: "",
      certifications: [],
      email: "",
      fullName: "",
      github: "",
      linkedIn: "",
      phone: "",
      portfolio: ""
    },
    createdAt: new Date(),
    __v: 0
  };
  
  console.log(JSON.stringify(adminUser, null, 2));
  
  console.log('\n📝 MongoDB Insert Command:\n');
  console.log('db.users.insertOne(' + JSON.stringify(adminUser, null, 2) + ')');
  
  console.log('\n🔑 Login Credentials:\n');
  console.log('Email:', adminUser.email);
  console.log('Password:', password);
  console.log('\n✨ Ready to use!\n');
}

createAdminUser().catch(console.error);
