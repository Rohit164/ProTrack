"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Bar, 
  Line, 
  Pie, 
  Area, 
  Cell,
  BarChart,
  LineChart,
  PieChart,
  AreaChart
} from "recharts";
import { getIssuesByStatus, getIssuesByPriority, getSprintProgress, getIssuesTrend } from "@/actions/insights";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart3, X } from "lucide-react";

export default function ProjectInsights({ projectId, isOpen, onClose }) {
  const [issuesByStatus, setIssuesByStatus] = useState([]);
  const [issuesByPriority, setIssuesByPriority] = useState([]);
  const [sprintProgress, setSprintProgress] = useState([]);
  const [issuesTrend, setIssuesTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, projectId]);

  async function fetchData() {
    setLoading(true);
    try {
      const [statusData, priorityData, sprintData, trendData] = await Promise.all([
        getIssuesByStatus(projectId),
        getIssuesByPriority(projectId),
        getSprintProgress(projectId),
        getIssuesTrend(projectId)
      ]);
      
      setIssuesByStatus(statusData);
      setIssuesByPriority(priorityData);
      setSprintProgress(sprintData);
      setIssuesTrend(trendData);
    } catch (error) {
      console.error("Error fetching insights data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 p-4 flex justify-between items-center border-b border-slate-800">
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="mr-2" /> Project Insights
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="sprints">Sprints</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Status</CardTitle>
                    <CardDescription>Distribution of issues across different statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-80 flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={issuesByStatus}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {issuesByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Priority</CardTitle>
                    <CardDescription>Distribution of issues by priority level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-80 flex items-center justify-center">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={issuesByPriority}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Issues">
                              {issuesByPriority.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Issues Tab */}
            <TabsContent value="issues" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Issues by Priority</CardTitle>
                  <CardDescription>Detailed breakdown of issues by priority</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-96 flex items-center justify-center">
                      <Skeleton className="h-80 w-full" />
                    </div>
                  ) : (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={issuesByPriority} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Issues">
                            {issuesByPriority.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Sprints Tab */}
            <TabsContent value="sprints" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sprint Progress</CardTitle>
                  <CardDescription>Completed vs total issues per sprint</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-96 flex items-center justify-center">
                      <Skeleton className="h-80 w-full" />
                    </div>
                  ) : (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sprintProgress}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#10b981" />
                          <Bar dataKey="total" name="Total" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Issues Trend</CardTitle>
                  <CardDescription>Created vs resolved issues over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-96 flex items-center justify-center">
                      <Skeleton className="h-80 w-full" />
                    </div>
                  ) : (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={issuesTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="created" name="Created" stroke="#3b82f6" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Cumulative Flow</CardTitle>
                  <CardDescription>Issue status distribution over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-96 flex items-center justify-center">
                      <Skeleton className="h-80 w-full" />
                    </div>
                  ) : (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { name: "Jan", todo: 10, inProgress: 5, done: 2 },
                            { name: "Feb", todo: 12, inProgress: 8, done: 5 },
                            { name: "Mar", todo: 15, inProgress: 10, done: 8 },
                            { name: "Apr", todo: 18, inProgress: 12, done: 10 },
                            { name: "May", todo: 20, inProgress: 15, done: 12 },
                            { name: "Jun", todo: 22, inProgress: 18, done: 15 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="todo" name="To Do" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                          <Area type="monotone" dataKey="inProgress" name="In Progress" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                          <Area type="monotone" dataKey="done" name="Done" stackId="1" stroke="#10b981" fill="#10b981" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 