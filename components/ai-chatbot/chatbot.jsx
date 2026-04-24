"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Bot, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Knowledge base for project management queries
const knowledgeBase = {
  project: {
    create: "To create a new project, go to the dashboard and click on 'New Project'. Enter the project name, description, and select team members. You can also set project settings like visibility and permissions.",
    manage: "You can manage your project by accessing the project dashboard. Here you can view tasks, team members, progress, and project settings. Use the sidebar navigation to access different project sections.",
    settings: "Project settings can be accessed from the project dashboard. Here you can modify project details, manage team members, set permissions, and configure project-specific settings.",
    delete: "To delete a project, go to project settings and click on 'Delete Project'. You'll need to confirm the deletion as this action cannot be undone.",
    archive: "You can archive a project instead of deleting it. Go to project settings and select 'Archive Project'. Archived projects can be restored later.",
    template: "To use a project template, click 'New Project' and select 'Use Template'. Choose from our pre-built templates for different project types like software development, marketing, or product management."
  },
  task: {
    create: "To create a new task, go to the project board and click 'Add Task'. Fill in the task details including title, description, assignee, due date, and priority level.",
    assign: "You can assign tasks to team members when creating or editing a task. Select the assignee from the dropdown menu in the task form.",
    track: "Track task progress using the Kanban board or list view. Tasks can be moved between status columns (To Do, In Progress, Done) to reflect their current state.",
    priority: "Set task priority levels (Low, Medium, High, Urgent) when creating or editing a task. This helps team members understand task importance.",
    dependencies: "You can set task dependencies to show which tasks need to be completed before others can start. Use the task relationship feature to link related tasks.",
    subtasks: "Break down complex tasks into subtasks. Click 'Add Subtask' within a task to create smaller, manageable pieces of work.",
    labels: "Use labels to categorize tasks. Common labels include 'Bug', 'Feature', 'Documentation', and 'Design'. You can create custom labels in project settings."
  },
  team: {
    add: "To add team members, go to project settings and click 'Team Members'. You can invite new members via email or add existing users to the project.",
    manage: "Manage team members through the project settings. You can assign roles, set permissions, and remove members as needed.",
    collaborate: "Team collaboration features include task comments, @mentions, file sharing, and real-time updates. Use the activity feed to stay updated on project changes.",
    roles: "Project roles include Admin, Manager, Member, and Viewer. Admins have full control, Managers can manage tasks and members, Members can work on tasks, and Viewers can only view project content.",
    permissions: "Set specific permissions for team members in project settings. You can control who can create tasks, edit project settings, or manage team members.",
    notifications: "Customize notification settings for each team member. Choose to receive updates via email, in-app notifications, or both."
  },
  sprint: {
    create: "To create a sprint, go to the project's sprint planning section. Click 'New Sprint', set the duration, and add tasks from the backlog.",
    manage: "Manage sprints through the sprint planning interface. You can modify sprint details, add/remove tasks, and track sprint progress.",
    review: "Conduct sprint reviews by accessing the sprint completion section. Review completed tasks, gather feedback, and plan for the next sprint.",
    velocity: "Track sprint velocity in the analytics section. This shows how many story points your team completes per sprint on average.",
    capacity: "Set team capacity for each sprint to ensure realistic planning. Consider team members' availability and other commitments.",
    retrospective: "After each sprint, conduct a retrospective meeting. Document what went well, what could be improved, and action items for the next sprint."
  },
  report: {
    progress: "View project progress reports in the analytics section. You can see task completion rates, team performance, and project timeline.",
    performance: "Access team performance reports to track individual and team productivity, task completion rates, and time spent on tasks.",
    analytics: "Project analytics provide insights into project health, including burn-down charts, velocity metrics, and task distribution.",
    export: "Export reports in various formats (PDF, CSV, Excel) for sharing with stakeholders or further analysis.",
    custom: "Create custom reports by selecting specific metrics, date ranges, and team members to focus on particular aspects of the project.",
    dashboard: "The project dashboard provides an overview of key metrics, including completed tasks, active sprints, and team workload."
  },
  integration: {
    github: "Connect your GitHub repository to automatically sync commits, pull requests, and issues with your project tasks.",
    slack: "Integrate with Slack to receive project notifications and updates directly in your team's Slack channels.",
    calendar: "Sync project deadlines and milestones with Google Calendar or Outlook to keep track of important dates.",
    api: "Use our API to integrate with other tools and automate workflows. Documentation is available in the developer section."
  },
  help: {
    support: "For technical support, visit our help center or contact our support team through the 'Help' menu in the application.",
    documentation: "Access comprehensive documentation covering all features and best practices in the 'Help' section.",
    training: "We offer training sessions and webinars for new users. Check the 'Resources' section for upcoming events.",
    feedback: "Share your feedback and feature requests through the 'Feedback' option in the application menu."
  }
};

// Follow-up questions for each topic
const followUpQuestions = {
  project: [
    "Would you like to know about project templates?",
    "Do you need help with project settings?",
    "Would you like to learn about team management in projects?"
  ],
  task: [
    "Would you like to know about task priorities?",
    "Do you need help with task dependencies?",
    "Would you like to learn about task labels?"
  ],
  team: [
    "Would you like to know about team roles?",
    "Do you need help with team permissions?",
    "Would you like to learn about team notifications?"
  ],
  sprint: [
    "Would you like to know about sprint velocity?",
    "Do you need help with sprint capacity planning?",
    "Would you like to learn about sprint retrospectives?"
  ],
  report: [
    "Would you like to know about custom reports?",
    "Do you need help with report exporting?",
    "Would you like to learn about the project dashboard?"
  ]
};

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Project Management Assistant. I can help you with:\n\n" +
        "• Creating and managing projects\n" +
        "• Task management and assignment\n" +
        "• Team collaboration\n" +
        "• Sprint planning and reviews\n" +
        "• Project reports and analytics\n\n" +
        "How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getRandomFollowUp = (topic) => {
    const questions = followUpQuestions[topic];
    return questions ? questions[Math.floor(Math.random() * questions.length)] : null;
  };

  const findAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();
    let topic = null;
    let answer = null;

    // Project related questions
    if (lowerQuestion.includes("create project") || lowerQuestion.includes("new project")) {
      topic = "project";
      answer = knowledgeBase.project.create;
    } else if (lowerQuestion.includes("manage project") || lowerQuestion.includes("project settings")) {
      topic = "project";
      answer = knowledgeBase.project.manage;
    } else if (lowerQuestion.includes("delete project")) {
      topic = "project";
      answer = knowledgeBase.project.delete;
    } else if (lowerQuestion.includes("archive project")) {
      topic = "project";
      answer = knowledgeBase.project.archive;
    } else if (lowerQuestion.includes("project template")) {
      topic = "project";
      answer = knowledgeBase.project.template;

    // Task related questions
    } else if (lowerQuestion.includes("create task") || lowerQuestion.includes("new task")) {
      topic = "task";
      answer = knowledgeBase.task.create;
    } else if (lowerQuestion.includes("assign task") || lowerQuestion.includes("task assignment")) {
      topic = "task";
      answer = knowledgeBase.task.assign;
    } else if (lowerQuestion.includes("track task") || lowerQuestion.includes("task progress")) {
      topic = "task";
      answer = knowledgeBase.task.track;
    } else if (lowerQuestion.includes("task priority")) {
      topic = "task";
      answer = knowledgeBase.task.priority;
    } else if (lowerQuestion.includes("task dependencies")) {
      topic = "task";
      answer = knowledgeBase.task.dependencies;
    } else if (lowerQuestion.includes("subtasks")) {
      topic = "task";
      answer = knowledgeBase.task.subtasks;
    } else if (lowerQuestion.includes("task labels")) {
      topic = "task";
      answer = knowledgeBase.task.labels;

    // Team related questions
    } else if (lowerQuestion.includes("add team") || lowerQuestion.includes("invite team")) {
      topic = "team";
      answer = knowledgeBase.team.add;
    } else if (lowerQuestion.includes("manage team") || lowerQuestion.includes("team settings")) {
      topic = "team";
      answer = knowledgeBase.team.manage;
    } else if (lowerQuestion.includes("team collaboration") || lowerQuestion.includes("work together")) {
      topic = "team";
      answer = knowledgeBase.team.collaborate;
    } else if (lowerQuestion.includes("team roles")) {
      topic = "team";
      answer = knowledgeBase.team.roles;
    } else if (lowerQuestion.includes("team permissions")) {
      topic = "team";
      answer = knowledgeBase.team.permissions;
    } else if (lowerQuestion.includes("team notifications")) {
      topic = "team";
      answer = knowledgeBase.team.notifications;

    // Sprint related questions
    } else if (lowerQuestion.includes("create sprint") || lowerQuestion.includes("new sprint")) {
      topic = "sprint";
      answer = knowledgeBase.sprint.create;
    } else if (lowerQuestion.includes("manage sprint") || lowerQuestion.includes("sprint planning")) {
      topic = "sprint";
      answer = knowledgeBase.sprint.manage;
    } else if (lowerQuestion.includes("sprint review")) {
      topic = "sprint";
      answer = knowledgeBase.sprint.review;
    } else if (lowerQuestion.includes("sprint velocity")) {
      topic = "sprint";
      answer = knowledgeBase.sprint.velocity;
    } else if (lowerQuestion.includes("sprint capacity")) {
      topic = "sprint";
      answer = knowledgeBase.sprint.capacity;
    } else if (lowerQuestion.includes("sprint retrospective")) {
      topic = "sprint";
      answer = knowledgeBase.sprint.retrospective;

    // Report related questions
    } else if (lowerQuestion.includes("progress report") || lowerQuestion.includes("project progress")) {
      topic = "report";
      answer = knowledgeBase.report.progress;
    } else if (lowerQuestion.includes("performance report") || lowerQuestion.includes("team performance")) {
      topic = "report";
      answer = knowledgeBase.report.performance;
    } else if (lowerQuestion.includes("analytics") || lowerQuestion.includes("project metrics")) {
      topic = "report";
      answer = knowledgeBase.report.analytics;
    } else if (lowerQuestion.includes("export report")) {
      topic = "report";
      answer = knowledgeBase.report.export;
    } else if (lowerQuestion.includes("custom report")) {
      topic = "report";
      answer = knowledgeBase.report.custom;
    } else if (lowerQuestion.includes("project dashboard")) {
      topic = "report";
      answer = knowledgeBase.report.dashboard;
    }

    // If we found a topic and answer, add a follow-up question
    if (topic && answer) {
      const followUp = getRandomFollowUp(topic);
      if (followUp) {
        answer += "\n\n" + followUp;
      }
      setContext(topic);
    } else {
      answer = "I understand you have a question about project management. Could you please be more specific? I can help you with:\n\n" +
        "• Project creation and management\n" +
        "• Task management and tracking\n" +
        "• Team collaboration and roles\n" +
        "• Sprint planning and reviews\n" +
        "• Reports and analytics\n" +
        "• Integrations (GitHub, Slack, Calendar)\n" +
        "• Support and documentation";
      setContext(null);
    }

    return answer;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate API call delay
      setTimeout(() => {
        const answer = findAnswer(input);
        const assistantMessage = {
          role: "assistant",
          content: answer,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const handleQuickResponse = (response) => {
    setInput(response);
    handleSubmit({ preventDefault: () => {} });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[400px] bg-gray-800 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Project Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-line",
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-200"
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-gray-700 text-gray-200">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {context && (
          <div className="mt-2 flex flex-wrap gap-2">
            {followUpQuestions[context].map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleQuickResponse(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default Chatbot; 