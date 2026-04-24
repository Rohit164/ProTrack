"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createIssue(data) {
  try {
    return { success: false, error: "Not implemented yet" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateIssue(issueId, data) {
  try {
    return { success: false, error: "Not implemented yet" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteIssue(issueId) {
  try {
    return { success: false, error: "Not implemented yet" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getIssues(projectId) {
  try {
    return [];
  } catch (error) {
    return [];
  }
}