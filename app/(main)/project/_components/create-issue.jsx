"use client";

import { useEffect, useState, useCallback } from "react";
import { BarLoader } from "react-spinners";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import MDEditor from "@uiw/react-md-editor";
import useFetch from "@/hooks/use-fetch";
import { createIssue } from "@/actions/issues";
import { getOrganizationUsers } from "@/actions/organizations";
import { issueSchema } from "@/app/lib/validators";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function IssueCreationDrawer({
  isOpen,
  onClose,
  sprintId,
  status,
  projectId,
  onIssueCreated,
  orgId,
}) {
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [userError, setUserError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Function to force refresh the page
  const forceRefresh = useCallback(() => {
    // First try router.refresh() for Next.js cache
    router.refresh();
    
    // Then force a complete page reload after a short delay if needed
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.location.reload();
      }
    }, 300);
  }, [router]);

  const {
    loading: createIssueLoading,
    fn: createIssueFn,
    error,
    data: newIssue,
  } = useFetch(createIssue);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: "MEDIUM",
      description: "",
      assigneeId: "",
    },
  });

  useEffect(() => {
    async function loadUsers() {
      if (isOpen && orgId) {
        setLoadingUsers(true);
        setUserError(null);
        try {
          const fetchedUsers = await getOrganizationUsers(orgId);
          console.log("Fetched users:", fetchedUsers);
          setUsers(fetchedUsers || []);
        } catch (err) {
          console.error("Error fetching users:", err);
          setUserError(err.message || "Failed to load team members");
        } finally {
          setLoadingUsers(false);
        }
      }
    }
    
    loadUsers();
  }, [isOpen, orgId]);

  // Debug log for users state
  useEffect(() => {
    console.log("Current users state:", users);
  }, [users]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await createIssueFn(projectId, {
        ...data,
        status,
        sprintId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (newIssue) {
      // Reset form
      reset();
      // Close drawer
      onClose();
      // Show success message
      toast.success("Issue created successfully!");
      // Call the onIssueCreated callback
      onIssueCreated();
      // Force refresh to update the UI
      forceRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newIssue, createIssueLoading]);

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Issue</DrawerTitle>
        </DrawerHeader>
        {loadingUsers && <BarLoader width={"100%"} color="#36d7b7" />}
        <ScrollArea className="h-[80vh] px-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="assigneeId"
                className="block text-sm font-medium mb-1"
              >
                Assignee
              </label>
              <Controller
                name="assigneeId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingUsers}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users && users.length > 0 ? (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.imageUrl} alt={user.name} />
                                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <span>{user.name || user.email}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-sm text-gray-400 text-center">
                          {userError || "No team members found"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assigneeId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.assigneeId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <MDEditor value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium mb-1"
              >
                Priority
              </label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {error && <p className="text-red-500 mt-2">{error.message}</p>}
            <Button
              type="submit"
              disabled={createIssueLoading || isSubmitting}
              className="w-full"
            >
              {createIssueLoading || isSubmitting ? "Creating..." : "Create Issue"}
            </Button>
          </form>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
