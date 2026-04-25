"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createIssue(projectId, data) {
  try {
    const { userId, orgId } = auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    const lastIssue = await db.issue.findFirst({
      where: { projectId, status: data.status },
      orderBy: { order: "desc" },
    });
    const newOrder = lastIssue ? lastIssue.order + 1 : 0;
    const issue = await db.issue.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId,
        sprintId: data.sprintId || null,
        reporterId: user.id,
        assigneeId: data.assigneeId || null,
        order: newOrder,
      },
      include: { assignee: true, reporter: true },
    });
    return issue;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getIssuesForSprint(sprintId) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    const issues = await db.issue.findMany({
      where: { sprintId },
      orderBy: [{ status: "asc" }, { order: "asc" }],
      include: { assignee: true, reporter: true },
    });
    return issues;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateIssueOrder(updatedIssues) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    await db.$transaction(
      updatedIssues.map((issue) =>
        db.issue.update({
          where: { id: issue.id },
          data: { status: issue.status, order: issue.order },
        })
      )
    );
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteIssue(issueId) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    const issue = await db.issue.findUnique({ where: { id: issueId } });
    if (!issue || issue.reporterId !== user.id) throw new Error("Unauthorized");
    await db.issue.delete({ where: { id: issueId } });
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateIssue(issueId, data) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    const issue = await db.issue.update({
      where: { id: issueId },
      data: { status: data.status, priority: data.priority },
      include: { assignee: true, reporter: true },
    });
    return issue;
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
