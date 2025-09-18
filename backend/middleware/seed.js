// backend/middleware/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";

dotenv.config();

async function main() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ MONGO_URI not set in environment variables!");
      process.exit(1);
    }

    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log("✅ Connected to MongoDB");

    // Create tenants
    const tenantsData = [
      { name: "Acme", slug: "acme", plan: "FREE" },
      { name: "Globex", slug: "globex", plan: "FREE" },
    ];

    const tenants = {};

    for (const t of tenantsData) {
      const tenant = await Tenant.findOneAndUpdate(
        { slug: t.slug },
        t,
        { upsert: true, new: true }
      );
      tenants[t.slug] = tenant;
      console.log(`✅ Tenant created/updated: ${tenant.name}`);
    }

    // Hash password for all users
    const passwordHash = await bcrypt.hash("password", 10);

    // Create users
    const usersData = [
      { email: "admin@acme.test", role: "ADMIN", tenantSlug: "acme" },
      { email: "user@acme.test", role: "MEMBER", tenantSlug: "acme" },
      { email: "admin@globex.test", role: "ADMIN", tenantSlug: "globex" },
      { email: "user@globex.test", role: "MEMBER", tenantSlug: "globex" },
    ];

    for (const u of usersData) {
      const tenant = tenants[u.tenantSlug];
      if (!tenant) {
        console.error(`❌ Tenant not found for ${u.email}`);
        continue;
      }

      const user = await User.findOneAndUpdate(
        { email: u.email },
        {
          email: u.email,
          passwordHash,
          role: u.role,
          tenantId: tenant._id,
        },
        { upsert: true, new: true }
      );

      console.log(`✅ User created/updated: ${user.email} (${user.role})`);
    }

    console.log("🎉 Seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

main();
