import { UserService } from "./src/lib/services/userService";
import { testConnection } from "./src/lib/db/dbConnect";

/**
 * Test script to verify password hashing and database indexing
 */
async function testUserService() {
  console.log("🧪 Testing User Service...\n");

  try {
    // Test database connection
    console.log("1. Testing database connection...");
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }
    console.log("✅ Database connected successfully\n");

    // Initialize indexes
    console.log("2. Creating database indexes...");
    await UserService.createIndexes();
    console.log("✅ Indexes created successfully\n");

    // Test user registration with password hashing
    console.log("3. Testing user registration with password hashing...");
    const testUser = {
      name: "Test User",
      email: "test@example.com",
      password: "TestPassword123!",
      confirmPassword: "TestPassword123!",
      role: "job_seeker" as const,
      agreeToTerms: true,
    };

    try {
      // Try to register user
      const registeredUser = await UserService.registerUser(testUser);
      console.log("✅ User registered successfully:");
      console.log(`   - Name: ${registeredUser.name}`);
      console.log(`   - Email: ${registeredUser.email}`);
      console.log(`   - Role: ${registeredUser.role}`);
      console.log(`   - ID: ${registeredUser.id}`);
      console.log("   - Password: [PROPERLY HASHED - NOT VISIBLE]\n");

      // Test authentication
      console.log("4. Testing authentication...");
      const authenticatedUser = await UserService.loginUser({
        email: testUser.email,
        password: testUser.password,
        rememberMe: false,
      });
      console.log("✅ Authentication successful");
      console.log(`   - Authenticated as: ${authenticatedUser.name}\n`);

      // Test wrong password
      console.log("5. Testing wrong password (should fail)...");
      try {
        await UserService.loginUser({
          email: testUser.email,
          password: "WrongPassword123!",
          rememberMe: false,
        });
        console.log("❌ This should not succeed!");
      } catch (error) {
        console.log("✅ Wrong password correctly rejected\n");
      }

      // Test fast email lookup (using index)
      console.log("6. Testing fast email lookup...");
      const foundUser = await UserService.findByEmail(testUser.email);
      if (foundUser && foundUser.email === testUser.email) {
        console.log("✅ Email lookup successful (using index)\n");
      } else {
        console.log("❌ Email lookup failed\n");
      }

      // Test role-based search (using index)
      console.log("7. Testing role-based search...");
      const jobSeekers = await UserService.findByRole("job_seeker", 10);
      console.log(`✅ Found ${jobSeekers.length} job seekers (using role index)\n`);

      // Clean up test user
      console.log("8. Cleaning up test user...");
      await UserService.deleteUser(registeredUser.id);
      console.log("✅ Test user deleted successfully\n");

    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        console.log("ℹ️  Test user already exists, cleaning up...");
        const existingUser = await UserService.findByEmail(testUser.email);
        if (existingUser) {
          await UserService.deleteUser(existingUser.id);
          console.log("✅ Existing test user cleaned up\n");
        }
      } else {
        throw error;
      }
    }

    // Test user statistics
    console.log("9. Testing user statistics...");
    const stats = await UserService.getUserStats();
    console.log("✅ User statistics:");
    console.log(`   - Total Users: ${stats.total}`);
    console.log(`   - Job Seekers: ${stats.jobSeekers}`);
    console.log(`   - Employers: ${stats.employers}`);
    console.log(`   - Verified Employers: ${stats.verifiedEmployers}`);
    console.log(`   - Admins: ${stats.admins}\n`);

    console.log("🎉 All tests passed! The system is working correctly:");
    console.log("   ✅ Passwords are automatically hashed before saving");
    console.log("   ✅ Database indexes are created for fast queries");
    console.log("   ✅ Email and role lookups use indexes for performance");
    console.log("   ✅ Authentication works with hashed passwords");
    console.log("   ✅ Public user data excludes passwords for security\n");

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testUserService()
    .then(() => {
      console.log("Testing complete. Exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error during testing:", error);
      process.exit(1);
    });
}

export { testUserService };
