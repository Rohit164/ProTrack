"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createProject(data) {
  try {
    return { success: false, error: "Not implemented yet" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteProject(projectId) {
  try {
    return { success: false, error: "Not implemented yet" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getProjects() {
  try {
    return [];
  } catch (error) {
    return [];
  }
}