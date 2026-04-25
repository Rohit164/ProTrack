"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getSubscription() {
  try {
    const { orgId } = auth();
    if (!orgId) return { plan: "FREE" };
    const org = await db.organization.findUnique({
      where: { clerkOrgId: orgId },
      include: { subscription: true },
    });
    if (!org || !org.subscription) return { plan: "FREE" };
    return { plan: org.subscription.plan };
  } catch {
    return { plan: "FREE" };
  }
}

export async function checkProjectLimit() {
  try {
    const { orgId } = auth();
    if (!orgId) return { currentCount: 0, limit: 3, hasReachedLimit: false };
    const org = await db.organization.findUnique({
      where: { clerkOrgId: orgId },
      include: { subscription: true, projects: true },
    });
    if (!org) return { currentCount: 0, limit: 3, hasReachedLimit: false };
    const isPro = org.subscription?.plan === "PRO";
    const limit = isPro ? Infinity : 3;
    const currentCount = org.projects.length;
    return { currentCount, limit: isPro ? 999 : 3, hasReachedLimit: !isPro && currentCount >= 3 };
  } catch {
    return { currentCount: 0, limit: 3, hasReachedLimit: false };
  }
}

export async function checkMemberLimit() {
  try {
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function upgradeSubscription() {
  try {
    return { success: false };
  } catch {
    return { success: false };
  }
}
