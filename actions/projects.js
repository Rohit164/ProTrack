"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createProject(data) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    const project = await db.project.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        organizationId: orgId,
      },
    });
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getProject(projectId) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        sprints: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project || project.organizationId !== orgId) throw new Error("Project not found");
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteProject(projectId) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project || project.organizationId !== orgId) throw new Error("Unauthorized");
    await db.project.delete({ where: { id: projectId } });
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}
