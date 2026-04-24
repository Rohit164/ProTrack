import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import UserMenu from "./user-menu";
import { PenBox, CrownIcon } from "lucide-react";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import UserLoading from "./user-loading";

async function Header() {
  await checkUser();

  return (
    <header className="container mx-auto">
      <nav className="py-6 px-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            <Image
              src={"/logo2.png"}
              alt="Zscrum Logo"
              width={200}
              height={56}
              className="h-10 w-auto object-contain"
            />
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/project/create">
            <Button variant="destructive" className="flex items-center gap-2">
              <PenBox size={18} />
              <span className="hidden md:inline">Create Project</span>
            </Button>
          </Link>
          <SignedIn>
            <Link href="/subscription">
              <Button variant="outline" className="flex items-center gap-2">
                <CrownIcon size={18} />
                <span className="hidden md:inline">Subscription</span>
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserMenu />
          </SignedIn>
        </div>
      </nav>

      <UserLoading />
    </header>
  );
}

export default Header;
