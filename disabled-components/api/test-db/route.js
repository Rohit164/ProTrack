import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // Try to query the database
    const userCount = await db.user.count();
    const projectCount = await db.project.count();
    const organizationCount = await db.organization.count();
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      counts: {
        users: userCount,
        projects: projectCount,
        organizations: organizationCount
      }
    });
  } catch (error) {
    console.error("Database connection error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error.message
    }, { status: 500 });
  }
} 