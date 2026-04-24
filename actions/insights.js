"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get issues by status for a specific organization or project
export async function getIssuesByStatus(projectId) {
  try {
    const { userId, orgId } = auth();

    // If authentication is not fully set up, use sample data
    if (!userId || !orgId) {
      console.warn("Authentication incomplete in getIssuesByStatus, using sample data");
      return [
        { name: "To Do", value: 12, color: "#3b82f6" },
        { name: "In Progress", value: 8, color: "#f59e0b" },
        { name: "Done", value: 15, color: "#10b981" },
        { name: "Backlog", value: 20, color: "#6b7280" },
      ];
    }

    // Define where clause based on whether projectId is provided
    let whereClause = {};
    
    if (projectId) {
      // Filter by specific project
      whereClause = { projectId: projectId };
    } else {
      // Filter by organization (all projects)
      const projects = await db.project.findMany({
        where: { organizationId: orgId },
        select: { id: true },
      });
      
      const projectIds = projects.map(project => project.id);
      
      whereClause = {
        projectId: {
          in: projectIds
        }
      };
    }

    // Count issues by status
    const issuesByStatus = await db.issue.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: whereClause
    });

    // Map to the format needed for charts
    const statusColors = {
      "TODO": "#3b82f6",
      "IN_PROGRESS": "#f59e0b",
      "DONE": "#10b981",
      "BACKLOG": "#6b7280"
    };

    const statusLabels = {
      "TODO": "To Do",
      "IN_PROGRESS": "In Progress",
      "DONE": "Done",
      "BACKLOG": "Backlog"
    };

    return issuesByStatus.map(item => ({
      name: statusLabels[item.status] || item.status,
      value: item._count.id,
      color: statusColors[item.status] || "#6b7280"
    }));
  } catch (error) {
    console.error("Error getting issues by status:", error);
    return [
      { name: "To Do", value: 12, color: "#3b82f6" },
      { name: "In Progress", value: 8, color: "#f59e0b" },
      { name: "Done", value: 15, color: "#10b981" },
      { name: "Backlog", value: 20, color: "#6b7280" },
    ];
  }
}

// Get issues by priority for a specific organization or project
export async function getIssuesByPriority(projectId) {
  try {
    const { userId, orgId } = auth();

    // If authentication is not fully set up, use sample data
    if (!userId || !orgId) {
      console.warn("Authentication incomplete in getIssuesByPriority, using sample data");
      return [
        { name: "Low", value: 10, color: "#10b981" },
        { name: "Medium", value: 18, color: "#f59e0b" },
        { name: "High", value: 12, color: "#ef4444" },
        { name: "Critical", value: 5, color: "#7f1d1d" },
      ];
    }

    // Define where clause based on whether projectId is provided
    let whereClause = {};
    
    if (projectId) {
      // Filter by specific project
      whereClause = { projectId: projectId };
    } else {
      // Filter by organization (all projects)
      const projects = await db.project.findMany({
        where: { organizationId: orgId },
        select: { id: true },
      });
      
      const projectIds = projects.map(project => project.id);
      
      whereClause = {
        projectId: {
          in: projectIds
        }
      };
    }

    // Count issues by priority
    const issuesByPriority = await db.issue.groupBy({
      by: ['priority'],
      _count: {
        id: true
      },
      where: whereClause
    });

    // Map to the format needed for charts
    const priorityColors = {
      "LOW": "#10b981",
      "MEDIUM": "#f59e0b",
      "HIGH": "#ef4444",
      "CRITICAL": "#7f1d1d"
    };

    return issuesByPriority.map(item => ({
      name: item.priority.charAt(0) + item.priority.slice(1).toLowerCase(),
      value: item._count.id,
      color: priorityColors[item.priority] || "#6b7280"
    }));
  } catch (error) {
    console.error("Error getting issues by priority:", error);
    return [
      { name: "Low", value: 10, color: "#10b981" },
      { name: "Medium", value: 18, color: "#f59e0b" },
      { name: "High", value: 12, color: "#ef4444" },
      { name: "Critical", value: 5, color: "#7f1d1d" },
    ];
  }
}

// Get sprint progress data for a specific organization or project
export async function getSprintProgress(projectId) {
  try {
    const { userId, orgId } = auth();

    // If authentication is not fully set up, use sample data
    if (!userId || !orgId) {
      console.warn("Authentication incomplete in getSprintProgress, using sample data");
      return [
        { name: "Sprint 1", completed: 15, total: 20 },
        { name: "Sprint 2", completed: 18, total: 22 },
        { name: "Sprint 3", completed: 12, total: 18 },
        { name: "Sprint 4", completed: 20, total: 25 },
        { name: "Sprint 5", completed: 8, total: 15 },
      ];
    }

    // Define where clause based on whether projectId is provided
    let whereClause = {};
    
    if (projectId) {
      // Filter by specific project
      whereClause = { projectId: projectId };
    } else {
      // Filter by organization (all projects)
      const projects = await db.project.findMany({
        where: { organizationId: orgId },
        select: { id: true },
      });
      
      const projectIds = projects.map(project => project.id);
      
      whereClause = {
        projectId: {
          in: projectIds
        }
      };
    }

    // Get all sprints for the specified project(s)
    const sprints = await db.sprint.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        issues: true
      }
    });

    // Calculate completed vs total issues for each sprint
    return sprints.map(sprint => {
      const totalIssues = sprint.issues.length;
      const completedIssues = sprint.issues.filter(issue => issue.status === "DONE").length;
      
      return {
        name: sprint.name,
        completed: completedIssues,
        total: totalIssues
      };
    });
  } catch (error) {
    console.error("Error getting sprint progress:", error);
    return [
      { name: "Sprint 1", completed: 15, total: 20 },
      { name: "Sprint 2", completed: 18, total: 22 },
      { name: "Sprint 3", completed: 12, total: 18 },
      { name: "Sprint 4", completed: 20, total: 25 },
      { name: "Sprint 5", completed: 8, total: 15 },
    ];
  }
}

// Get issues trend data (created vs resolved over time) for a specific organization or project
export async function getIssuesTrend(projectId) {
  try {
    const { userId, orgId } = auth();

    // If authentication is not fully set up, use sample data
    if (!userId || !orgId) {
      console.warn("Authentication incomplete in getIssuesTrend, using sample data");
      return [
        { name: "Jan", created: 12, resolved: 8 },
        { name: "Feb", created: 15, resolved: 12 },
        { name: "Mar", created: 18, resolved: 14 },
        { name: "Apr", created: 10, resolved: 15 },
        { name: "May", created: 14, resolved: 13 },
        { name: "Jun", created: 20, resolved: 16 },
      ];
    }

    // In a real implementation, you would query your database based on projectId
    // This would require tracking issue creation and resolution dates
    
    // For now, return sample data
    return [
      { name: "Jan", created: 12, resolved: 8 },
      { name: "Feb", created: 15, resolved: 12 },
      { name: "Mar", created: 18, resolved: 14 },
      { name: "Apr", created: 10, resolved: 15 },
      { name: "May", created: 14, resolved: 13 },
      { name: "Jun", created: 20, resolved: 16 },
    ];
  } catch (error) {
    console.error("Error getting issues trend:", error);
    return [
      { name: "Jan", created: 12, resolved: 8 },
      { name: "Feb", created: 15, resolved: 12 },
      { name: "Mar", created: 18, resolved: 14 },
      { name: "Apr", created: 10, resolved: 15 },
      { name: "May", created: 14, resolved: 13 },
      { name: "Jun", created: 20, resolved: 16 },
    ];
  }
} 