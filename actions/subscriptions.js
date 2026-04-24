"use server";

export async function getSubscription() {
  return { plan: "FREE" };
}

export async function upgradeSubscription() {
  return { success: false };
}

export async function checkProjectLimit() {
  return { success: true };
}

export async function checkMemberLimit() {
  return { success: true };
}