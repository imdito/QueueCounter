import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createFirstAdmin() {
  try {
    // Check if any admin exists
    const existingAdmin = await prisma.admin.findFirst();
    
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.username);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create the first admin
    const admin = await prisma.admin.create({
      data: {
        username: "admin",
        password: hashedPassword,
        email: "admin@example.com",
        name: "Default Admin",
        isActive: true,
      },
    });

    console.log("First admin created successfully:", {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createFirstAdmin();