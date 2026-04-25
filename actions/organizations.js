"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getOrganization(slug) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");
    const organization = await db.organization.findUnique({
      where: { clerkOrgId: slug },
    });
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

export async function getUserIssues(userId) {
  try {
    const { userId: clerkUserId, orgId } = auth();
    if (!clerkUserId || !orgId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({ where: { clerkUserId } });
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
