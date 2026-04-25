"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getOrganization(slug) {
  try {
    const { userId, orgId } = auth();
    if (!userId) throw new Error("Unauthorized");

    // Find user in DB, create if not exists
    let user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          imageUrl: clerkUser.imageUrl,
          email: clerkUser.emailAddresses[0].emailAddress,
        },
      });
    }

    // Find org in DB, create if not exists
    let organization = await db.organization.findUnique({
      where: { clerkOrgId: slug },
    });

    if (!organization && orgId) {
      const clerkOrg = await clerkClient.organizations.getOrganization({ organizationId: orgId });
      organization = await db.organization.create({
        data: {
          clerkOrgId: orgId,
          name: clerkOrg.name,
        },
      });
    }

    return organization;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getProjects(orgId) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");
    const projects = await db.project.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
    return projects;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getOrganizationUsers(orgId) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");
    const users = await db.user.findMany({
      where: {
        assignedIssues: { some: { project: { organizationId: orgId } } },
      },
    });
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserIssues() {
  try {
    const { userId: clerkUserId, orgId } = auth();
    if (!clerkUserId || !orgId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) return [];
    const issues = await db.issue.findMany({
      where: {
        OR: [{ assigneeId: user.id }, { reporterId: user.id }],
        project: { organizationId: orgId },
      },
      include: { project: true, assignee: true, reporter: true, sprint: true },
      orderBy: { updatedAt: "desc" },
    });
    return issues;
  } catch (error) {
    throw new Error(error.message);
  }
}
