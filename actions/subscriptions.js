"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Constants for subscription limits (moved to inside the file scope)
const SUBSCRIPTION_LIMITS = {
  FREE: {
    maxProjects: 2,
    maxMembers: 3
  },
  PRO: {
    maxProjects: Infinity,
    maxMembers: Infinity
  }
};

// Store upgraded organizations in memory (in a real app, this would be in the database)
let upgradedOrgs = new Map();

// List of emails that have PRO subscriptions
const proEmails = ["shubjoshi77@gmail.com"];

// Get subscription limits
export async function getSubscriptionLimits(plan = "FREE") {
  return SUBSCRIPTION_LIMITS[plan] || SUBSCRIPTION_LIMITS.FREE;
}

// Get current subscription for an organization
export async function getSubscription() {
  try {
    const { userId, orgId } = auth();
    const user = await currentUser();
    
    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }
    
    // Check if user's email is in the pro emails list
    if (user && user.emailAddresses) {
      const userEmails = user.emailAddresses.map(email => email.emailAddress.toLowerCase());
      
      // Check if any of the user's emails are in the proEmails list
      const hasPro = userEmails.some(email => 
        proEmails.includes(email.toLowerCase())
      );
      
      if (hasPro) {
        console.log("User has PRO subscription based on email");
        return {
          plan: "PRO",
          billingCycle: "MONTHLY",
          startDate: new Date(),
          endDate: null
        };
      }
    }

    // Check if this organization has been upgraded
    if (upgradedOrgs.has(orgId)) {
      const orgSubscription = upgradedOrgs.get(orgId);
      return orgSubscription;
    }

    // For now, we'll simulate subscription data
    // In a real implementation, you would fetch this from your database
    return {
      plan: "FREE", // Default to FREE plan
      billingCycle: "MONTHLY",
      startDate: new Date(),
      endDate: null
    };
  } catch (error) {
    console.error("Error getting subscription:", error);
    return {
      plan: "FREE", // Default to FREE plan
      billingCycle: "MONTHLY",
      startDate: new Date(),
      endDate: null
    };
  }
}

// Check if organization has reached project limit
export async function checkProjectLimit() {
  try {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }

    // Get current subscription
    const subscription = await getSubscription();
    
    // Get project count for this organization
    const projectCount = await db.project.count({
      where: { organizationId: orgId }
    });

    const limits = await getSubscriptionLimits(subscription.plan);
    const limit = limits.maxProjects;
    
    return {
      currentCount: projectCount,
      limit: limit,
      hasReachedLimit: projectCount >= limit
    };
  } catch (error) {
    console.error("Error checking project limit:", error);
    const freeLimits = await getSubscriptionLimits("FREE");
    return {
      currentCount: 0,
      limit: freeLimits.maxProjects,
      hasReachedLimit: false
    };
  }
}

// Check if organization has reached member limit
export async function checkMemberLimit() {
  try {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }

    // Get current subscription
    const subscription = await getSubscription();
    
    // In a real implementation, you would count members from your database
    // For now, we'll simulate it
    const memberCount = 1; // Default to 1 (the current user)
    
    const limits = await getSubscriptionLimits(subscription.plan);
    const limit = limits.maxMembers;
    
    return {
      currentCount: memberCount,
      limit: limit,
      hasReachedLimit: memberCount >= limit
    };
  } catch (error) {
    console.error("Error checking member limit:", error);
    const freeLimits = await getSubscriptionLimits("FREE");
    return {
      currentCount: 0,
      limit: freeLimits.maxMembers,
      hasReachedLimit: false
    };
  }
}

// Upgrade subscription
export async function upgradeSubscription(plan, billingCycle) {
  try {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
      throw new Error("Unauthorized");
    }

    // In a real implementation, you would update the subscription in your database
    // For now, we'll store it in memory
    const subscription = {
      plan: plan,
      billingCycle: billingCycle,
      startDate: new Date(),
      endDate: null
    };
    
    // Store the upgraded subscription
    upgradedOrgs.set(orgId, subscription);
    
    // Revalidate paths to reflect the changes
    revalidatePath("/");
    revalidatePath("/organization");
    revalidatePath("/project");
    revalidatePath("/project/create");
    
    return {
      success: true,
      message: `Successfully upgraded to ${plan} plan with ${billingCycle} billing cycle.`
    };
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return {
      success: false,
      message: error.message || "Failed to upgrade subscription."
    };
  }
} 