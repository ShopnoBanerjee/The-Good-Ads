"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CiMenuFries } from "react-icons/ci";

interface NavLink {
  name: string;
  path: string;
}

const navLinks: NavLink[] = [
  { name: "Home", path: "/" },
  { name: "Our Services", path: "/services" },
  { name: "About Us", path: "/about" },
  { name: "Blog", path: "/blog" },
];

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const handleCloseWithDelay = (): void => {
    setTimeout(() => setIsOpen(false), 300); // subtle delay to allow smooth transition
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        onClick={() => setIsOpen(true)}
        className="flex justify-center items-center"
      >
        <CiMenuFries className="text-[32px] text-text" />
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        {/* Hidden for accessibility only */}
        <div className="sr-only">Navigation</div>

        {/* Mobile Logo */}
        <div className="mt-16 mb-0 flex justify-center items-center">
        <Link href="/" onClick={handleCloseWithDelay}>
            <img
              src="/logo-nobg.png"
              alt="The GoodAds"
              width={200}
              height={200}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col items-center gap-4">
          {navLinks.map((link: NavLink, index: number) => {
            const isActive: boolean = pathname === link.path;
            return (
              <Link
                key={index}
                href={link.path}
                onClick={handleCloseWithDelay}
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  isActive ? "border-text text-white bg-text" : "hover:text-white"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link href="/login" onClick={handleCloseWithDelay}>
            <button className="w-40 text-text py-2 border border-text rounded-full hover:bg-text hover:text-white transition">
              Dashboard
            </button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
