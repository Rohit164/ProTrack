import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganization } from "@/actions/organizations";
import { getSubscription, checkProjectLimit } from "@/actions/subscriptions";
import OrgSwitcher from "@/components/org-switcher";
import ProjectList from "./_components/project-list";
import UserIssues from "./_components/user-issues";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CrownIcon, AlertCircle } from "lucide-react";

export default async function OrganizationPage({ params }) {
  const { orgId } = params;
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const organization = await getOrganization(orgId);
  const subscription = await getSubscription();
  const projectLimit = await checkProjectLimit();

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="container mx-auto px-4">
      {subscription.plan === "PRO" && (
        <div className="w-full bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-b border-yellow-800/30 -mt-5 mb-5 py-2 px-4">
          <div className="flex items-center justify-center gap-2">
            <CrownIcon size={18} className="text-yellow-500 fill-yellow-500" />
            <span className="text-yellow-500 font-medium">ProTrack Plus Subscription Active</span>
          </div>
        </div>
      )}
      
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start">
        <div className="flex items-center gap-2">
          <h1 className="text-5xl font-bold gradient-title pb-2">
            {organization.name}&rsquo;s Projects
          </h1>
          {subscription.plan === "PRO" && (
            <div className="ml-2 mt-1">
              <CrownIcon size={24} className="text-yellow-500 fill-yellow-500" />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center">
          {subscription.plan === "FREE" ? (
            <Link href="/subscription">
              <Button variant="outline" className="flex items-center gap-2 border-amber-500 text-amber-500">
                <CrownIcon size={16} />
                <span>Upgrade to Pro</span>
              </Button>
            </Link>
          ) : (
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
              <CrownIcon size={14} className="mr-1 text-yellow-300 fill-yellow-300" />
              Pro Plan
            </div>
          )}
          <OrgSwitcher />
        </div>
      </div>

      {subscription.plan === "FREE" && projectLimit.currentCount > 0 && (
        <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
            <div className="flex-1">
              <h3 className="font-medium text-white">Free Plan Limits</h3>
              <p className="text-sm text-gray-300 mt-1">
                You're using {projectLimit.currentCount} of {projectLimit.limit} available projects on the Free plan.
              </p>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${projectLimit.hasReachedLimit ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, (projectLimit.currentCount / projectLimit.limit) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">
                  {projectLimit.currentCount} used
                </p>
                <p className="text-xs text-gray-400">
                  {projectLimit.limit} limit
                </p>
              </div>
            </div>
            <Link href="/subscription" className="ml-4">
              <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
                Upgrade
              </Button>
            </Link>
          </div>
        </div>
      )}

      {subscription.plan === "PRO" && (
        <div className="mb-6 bg-gradient-to-r from-yellow-950 to-amber-950 rounded-lg p-4 border border-yellow-800/50">
          <div className="flex items-center">
            <CrownIcon className="h-6 w-6 text-yellow-500 fill-yellow-500 mr-3" />
            <div>
              <h3 className="font-medium text-yellow-400">ProTrack Plus Active</h3>
              <p className="text-sm text-yellow-300/70 mt-1">
                Enjoy unlimited projects and team members with your PRO subscription.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <ProjectList orgId={organization.id} />
      </div>
      <div className="mt-8">
        <UserIssues userId={userId} />
      </div>
    </div>
  );
}
