"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createSprint(data) {
  try {
    return { success: false, error: "Not implemented yet" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateSprint(sprintId, data) {
  try {
    return { success: false, error: "Not implemented yet" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteSprint(sprintId) {
  try {
    return { success: false, error: "Not implemented yet" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getSprints(projectId) {
  try {
    return [];
  } catch (error) {
    return [];
  }
}