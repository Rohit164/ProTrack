"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { ChartNoAxesGantt, CrownIcon } from "lucide-react";
import { getSubscription } from "@/actions/subscriptions";

const UserMenu = () => {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const subscription = await getSubscription();
        setIsPro(subscription.plan === "PRO");
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, []);

  return (
    <div className="relative">
      {isPro && (
        <div className="absolute -top-3 -right-2 z-10">
          <CrownIcon size={16} className="text-yellow-500 fill-yellow-500" />
        </div>
      )}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
          },
        }}
      >
        <UserButton.MenuItems>
          <UserButton.Link
            label={isPro ? "ProTrack Plus (PRO)" : "Subscription Plans"}
            labelIcon={<CrownIcon size={15} className={isPro ? "text-yellow-500 fill-yellow-500" : ""} />}
            href="/subscription"
          />
          <UserButton.Link
            label="My Organizations"
            labelIcon={<ChartNoAxesGantt size={15} />}
            href="/onboarding"
          />
          <UserButton.Action label="manageAccount" />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
};

export default UserMenu;
