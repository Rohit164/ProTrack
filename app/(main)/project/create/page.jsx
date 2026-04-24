"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectSchema } from "@/app/lib/validators";
import { createProject } from "@/actions/projects";
import { checkProjectLimit } from "@/actions/subscriptions";
import { BarLoader } from "react-spinners";
import OrgSwitcher from "@/components/org-switcher";
import { toast } from "sonner";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function CreateProjectPage() {
  const router = useRouter();
  const { isLoaded: isOrgLoaded, membership } = useOrganization();
  const { isLoaded: isUserLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectLimit, setProjectLimit] = useState(null);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (isOrgLoaded && isUserLoaded && membership) {
      setIsAdmin(membership.role === "org:admin");
      
      // Check project limit
      const checkLimit = async () => {
        setIsCheckingLimit(true);
        try {
          const limitInfo = await checkProjectLimit();
          setProjectLimit(limitInfo);
        } catch (error) {
          console.error("Error checking project limit:", error);
        } finally {
          setIsCheckingLimit(false);
        }
      };
      
      checkLimit();
    }
  }, [isOrgLoaded, isUserLoaded, membership]);

  const onSubmit = async (data) => {
    if (!isAdmin) {
      toast.error("Only organization admins can create projects");
      return;
    }

    if (projectLimit?.hasReachedLimit) {
      toast.error("You've reached the maximum number of projects for your plan. Please upgrade to create more projects.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Submitting project data:", data);
      
      const newProject = await createProject(data);
      
      console.log("Project creation response:", newProject);
      
      if (newProject && newProject.id) {
        toast.success("Project created successfully!");
        // Force navigation to the new project page
        router.push(`/project/${newProject.id}`);
      } else {
        throw new Error("Project creation failed: No project ID returned");
      }
    } catch (err) {
      console.error("Project creation error:", err);
      setError(err);
      toast.error(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  if (!isOrgLoaded || !isUserLoaded || isCheckingLimit) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <BarLoader color="#36d7b7" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-2 items-center">
        <span className="text-2xl gradient-title">
          Oops! Only Admins can create projects.
        </span>
        <OrgSwitcher />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-6xl text-center font-bold mb-8 gradient-title">
        Create New Project
      </h1>

      <div className="max-w-2xl mx-auto">
        {projectLimit?.hasReachedLimit && (
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-amber-500">Project limit reached</h3>
                <p className="text-sm text-amber-300 mt-1">
                  You've reached the limit of {projectLimit.limit} projects on the Free plan. 
                  <Link href="/subscription" className="text-blue-400 ml-1 hover:underline">
                    Upgrade your plan
                  </Link> to create more projects.
                </p>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-amber-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (projectLimit.currentCount / projectLimit.limit) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {projectLimit.currentCount} of {projectLimit.limit} projects used
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-4"
        >
          <div>
            <Input
              id="name"
              {...register("name")}
              className="bg-slate-950"
              placeholder="Project Name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Input
              id="key"
              {...register("key")}
              className="bg-slate-950"
              placeholder="Project Key (Ex: RCYT)"
            />
            {errors.key && (
              <p className="text-red-500 text-sm mt-1">{errors.key.message}</p>
            )}
          </div>
          <div>
            <Textarea
              id="description"
              {...register("description")}
              className="bg-slate-950 h-28"
              placeholder="Project Description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          {loading && (
            <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
          )}
          <Button
            type="submit"
            size="lg"
            disabled={loading || projectLimit?.hasReachedLimit}
            className="bg-blue-500 text-white"
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
          {error && <p className="text-red-500 mt-2">{error.message}</p>}
          
          {projectLimit?.hasReachedLimit && (
            <div className="flex justify-center mt-4">
              <Link href="/subscription">
                <Button variant="outline" className="border-blue-500 text-blue-500">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
