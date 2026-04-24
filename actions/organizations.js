"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getOrganization(orgId) {
  try {
    return null;
  } catch (error) {
    return null;
  }
}

export async function getOrganizationUsers(orgId) {
  try {
    return [];
  } catch (error) {
    return [];
  }
}

export async function createOrganization(data) {
  try {
    return { success: false, error: "Not implemented yet" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}