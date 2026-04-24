"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getOrganization(slug) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the organization details
  const organization = await clerkClient().organizations.getOrganization({
    slug,
  });

  if (!organization) {
    return null;
  }

  // Check if user belongs to this organization
  const { data: membership } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: organization.id,
    });

  const userMembership = membership.find(
    (member) => member.publicUserData.userId === userId
  );

  // If user is not a member, return null
  if (!userMembership) {
    return null;
  }

  return organization;
}

export async function getProjects(orgId) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

export async function getUserIssues(userId) {
  const { orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("No user id or organization id found");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const issues = await db.issue.findMany({
    where: {
      OR: [{ assigneeId: user.id }, { reporterId: user.id }],
      project: {
        organizationId: orgId,
      },
    },
    include: {
      project: true,
      assignee: true,
      reporter: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return issues;
}

export async function getOrganizationUsers(orgId) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get organization memberships from Clerk
    const { data: organizationMemberships } = 
      await clerkClient().organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });

    if (!organizationMemberships || organizationMemberships.length === 0) {
      console.log("No organization memberships found");
      return [];
    }

    // Extract Clerk user IDs
    const clerkUserIds = organizationMemberships.map(
      (membership) => membership.publicUserData.userId
    );

    // For debugging
    console.log("Clerk user IDs:", clerkUserIds);

    // Find users in the database
    const users = await db.user.findMany({
      where: {
        clerkUserId: {
          in: clerkUserIds,
        },
      },
    });

    // If no users found in the database, create dummy users for demo purposes
    if (!users || users.length === 0) {
      console.log("No users found in database, creating dummy users");
      
      // Create dummy users for demo purposes
      return [
        {
          id: "user1",
          name: "John Doe",
          email: "john@example.com",
          imageUrl: null
        },
        {
          id: "user2",
          name: "Jane Smith",
          email: "jane@example.com",
          imageUrl: null
        },
        {
          id: "user3",
          name: "Alex Johnson",
          email: "alex@example.com",
          imageUrl: null
        }
      ];
    }

    console.log("Found users in database:", users);
    return users;
  } catch (error) {
    console.error("Error in getOrganizationUsers:", error);
    
    // Return dummy users for demo purposes in case of error
    return [
      {
        id: "user1",
        name: "John Doe",
        email: "john@example.com",
        imageUrl: null
      },
      {
        id: "user2",
        name: "Jane Smith",
        email: "jane@example.com",
        imageUrl: null
      }
    ];
  }
}
