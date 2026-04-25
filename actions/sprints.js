"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createSprint(projectId, data) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    const sprint = await db.sprint.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "PLANNED",
        projectId,
      },
    });
    return sprint;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateSprintStatus(sprintId, status) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    const sprint = await db.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) throw new Error("Sprint not found");
    if (status === "ACTIVE") {
      const activeSprintExists = await db.sprint.findFirst({
        where: { projectId: sprint.projectId, status: "ACTIVE" },
      });
      if (activeSprintExists) throw new Error("An active sprint already exists");
    }
    const updatedSprint = await db.sprint.update({
      where: { id: sprintId },
      data: { status },
    });
    return { success: true, sprint: updatedSprint };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteSprint(sprintId) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) throw new Error("Unauthorized");
    await db.sprint.delete({ where: { id: sprintId } });
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}
