"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { Bell, MessageCircle, Plus, Search } from "lucide-react";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useGetAuthUserQuery } from "@/state/api";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { SidebarTrigger } from "./sidebar";

const Navbar = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();

  const isDashboardPage =
    pathname.includes("/tenants") || pathname.includes("/managers");

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const userRole = authUser?.userRole?.toLowerCase();

  return (
    <div
      className="fixed left-0 top-0 z-50 w-full shadow-xl"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex h-full w-full items-center justify-between bg-primary-700 px-8 py-3 text-white">
        <div className="flex items-center gap-4 md:gap-6">
         
         {isDashboardPage &&(
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
         )}
         
          <Link
            href="/"
            className="cursor-pointer hover:text-primary-300!"
            scroll={false}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <div className="text-xl font-bold">
                RENT
                <span className="font-light text-secondary-500 hover:!text-primary-300">
                  IFUL
                </span>
              </div>
            </div>
          </Link>

          {isDashboardPage && authUser && (
            <Button
              variant="secondary"
              className="md:ml-4 bg-primary-50 text-primary-700"
              onClick={() =>
                router.push(
                  userRole === "manager" ? "/managers/newproperty" : "/search"
                )
              }
            >
              {userRole === "manager" ? (
                <>
                  <Plus className="h-4 w-4" />
                  <span className="ml-2 hidden md:block">Add New Property</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span className="ml-2 hidden md:block">Search Properties</span>
                </>
              )}
            </Button>
          )}
        </div>

        {!isDashboardPage && (
          <p className="hidden text-primary-200 md:block">
            Discover your perfect rental apartment with our advance search
          </p>
        )}

        <div className="flex items-center gap-5">
          {authUser ? (
            <>
              <div className="relative hidden md:block">
                <MessageCircle className=" h-6 cursor-pointer text-primary-200 hover:text-primary-400" />
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-secondary-700" />
              </div>

              <div className="relative hidden md:block">
                <Bell className="h-6 cursor-pointer text-primary-200 hover:text-primary-400" />
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-secondary-700" />
              </div>

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none cursor-pointer">
                  <Avatar>
                    <AvatarImage src={authUser.userInfo?.image} />
                    <AvatarFallback className="bg-primary-600 ">
                      {authUser.userRole?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="hidden text-primary-200 md:block ">
                    {authUser.userInfo?.name}
                  </p>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="bg-white text-primary-700">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-primary-100!"
                    onClick={() =>
                      router.push(
                        userRole === "manager"
                          ? "/managers/properties"
                          : "/tenants/favorites"
                      )
                    }
                  >
                    Go to Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary-200" />

                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-primary-100!"
                    onClick={() => router.push(`/${userRole}/settings`)}
                  >
                    Go to Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary-200" />

                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-primary-100!"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="rounded-lg border-white bg-transparent text-white hover:bg-white hover:text-primary-700"
                >
                  Sign In
                </Button>
              </Link>

              <Link href="/signup">
                <Button
                  variant="secondary"
                  className="rounded-lg bg-secondary-600 text-white hover:bg-white hover:text-primary-700"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;