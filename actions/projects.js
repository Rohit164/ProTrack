"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createProject(data) {
  try {
    console.log("Starting project creation with data:", data);
    
    const { userId, orgId } = auth();
    console.log("Auth info:", { userId, orgId });

    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!orgId) {
      throw new Error("No Organization Selected");
    }

    // Check if the user is an admin of the organization
    console.log("Checking organization membership");
    let membershipList;
    try {
      const response = await clerkClient().organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });
      membershipList = response.data;
      console.log("Membership list retrieved:", membershipList.length);
    } catch (clerkError) {
      console.error("Error fetching organization memberships:", clerkError);
      throw new Error("Failed to verify organization membership: " + clerkError.message);
    }

    const userMembership = membershipList.find(
      (membership) => membership.publicUserData.userId === userId
    );
    console.log("User membership found:", userMembership ? "Yes" : "No");

    if (!userMembership || userMembership.role !== "org:admin") {
      throw new Error("Only organization admins can create projects");
    }

    console.log("Creating project in database");
    try {
      const project = await db.project.create({
        data: {
          name: data.name,
          key: data.key,
          description: data.description,
          organizationId: orgId,
        },
      });
      
      console.log("Project created successfully:", project.id);
      return project;
    } catch (dbError) {
      console.error("Database error creating project:", dbError);
      
      // Check for common errors
      if (dbError.code === 'P2002') {
        throw new Error("A project with this key already exists in your organization. Please choose a different key.");
      } else if (dbError.code === 'P2003') {
        throw new Error("Organization not found in database. Please refresh and try again.");
      } else {
        throw new Error("Error creating project: " + dbError.message);
      }
    }
  } catch (error) {
    console.error("Error in createProject:", error);
    throw error;
  }
}

export async function getProject(projectId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Find user to verify existence
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get project with sprints and organization
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sprints: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Verify project belongs to the organization
  if (project.organizationId !== orgId) {
    return null;
  }

  return project;
}

export async function deleteProject(projectId) {
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  if (orgRole !== "org:admin") {
    throw new Error("Only organization admins can delete projects");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error(
      "Project not found or you don't have permission to delete it"
    );
  }

  await db.project.delete({
    where: { id: projectId },
  });

  return { success: true };
}
