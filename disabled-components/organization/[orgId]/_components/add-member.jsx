"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
// import { checkMemberLimit } from "@/actions/subscriptions";
import Link from "next/link";

export default function AddMember({ orgId }) {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [memberLimit, setMemberLimit] = useState(null);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const checkLimit = async () => {
        setIsCheckingLimit(true);
        try {
          const limitInfo = await checkMemberLimit();
          setMemberLimit(limitInfo);
        } catch (error) {
          console.error("Error checking member limit:", error);
        } finally {
          setIsCheckingLimit(false);
        }
      };
      
      checkLimit();
    }
  }, [isOpen]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    if (memberLimit?.hasReachedLimit) {
      toast.error("You've reached the maximum number of members for your plan. Please upgrade to add more members.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, you would call an API to add the member
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to add member: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserPlus size={16} />
          <span>Add Member</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Invite a team member to collaborate on your projects.
          </DialogDescription>
        </DialogHeader>
        
        {isCheckingLimit ? (
          <div className="py-6 text-center text-gray-400">
            Checking member limits...
          </div>
        ) : memberLimit?.hasReachedLimit ? (
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 my-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
              <div>
                <h3 className="font-medium text-amber-500">Member limit reached</h3>
                <p className="text-sm text-amber-300 mt-1">
                  You've reached the limit of {memberLimit.limit} members on the Free plan. 
                  <Link href="/subscription" className="text-blue-400 ml-1 hover:underline">
                    Upgrade your plan
                  </Link> to add more team members.
                </p>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-amber-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (memberLimit.currentCount / memberLimit.limit) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {memberLimit.currentCount} of {memberLimit.limit} members used
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddMember} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        )}
        
        {memberLimit?.hasReachedLimit && (
          <DialogFooter>
            <Link href="/subscription" className="w-full">
              <Button variant="outline" className="w-full border-blue-500 text-blue-500">
                Upgrade to Pro
              </Button>
            </Link>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
} 