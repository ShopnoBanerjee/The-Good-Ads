"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiMenu, FiX } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";

interface MenuItem {
  label: string;
  href: string;
}

interface DropdownProps {
  title: string;
  menuItems: MenuItem[];
  mobile?: boolean;
}

// Reusable Dropdown Component
const Dropdown = ({ title, menuItems, mobile = false }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 ${
          mobile 
            ? "w-full justify-between py-2 text-[#15325a] font-outfit text-lg font-medium hover:text-blue-600 transition-colors" 
            : "text-[#15325a] hover:text-blue-600 transition-colors"
        }`}
      >
        {title} <FaCaretDown size={14} />
      </button>

      {/* Desktop dropdown */}
      {!mobile && (
        <div
          className={`absolute top-full left-0 mt-2 w-44 bg-white shadow-md rounded-md py-2 z-10 ${
            isOpen ? "block" : "hidden"
          } group-hover:block`}
          onMouseLeave={() => setIsOpen(false)}
        >
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile dropdown */}
      {mobile && isOpen && (
        <div className="flex flex-col pl-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block py-2 text-base text-[#15325a] font-outfit font-medium hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { user, userType, isLoading, setUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const supabase = (await import("@/lib/supabaseClient")).getSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Conditionally render dashboard link
  const dashboardLink = user
    ? (() => {
        if (userType === "college_society" || userType === "society") {
          return "/society/marketplace";
        } else if (userType === "student") {
          return "/student/dashboard";
        } else {
          return "/dashboard";
        }
      })()
    : null;

  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between h-20 relative">
      {/* Logo */}
      <div className="flex items-center h-full">
        <Link href="/">
          <Image
            src="/logo/our-logo.png"
            alt="The GoodAds"
            width={120}
            height={80}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Desktop Navbar */}
      <nav className="hidden md:flex gap-6 text-[#15325a] text-lg font-medium font-outfit">
        <Link href="/" className="text-[#15325a] hover:text-blue-600 transition-colors">
          Home
        </Link>

        <Dropdown
          title="About Us"
          menuItems={[
            { label: "Our Story", href: "/about#story" },
            { label: "Team", href: "/about#team" },
          ]}
        />

        <Dropdown
          title="Our Services"
          menuItems={[
            { label: "College Societies", href: "/society" },
            { label: "Companies / Startups", href: "/business" },
          ]}
        />
      </nav>

      {/* Auth buttons (desktop) */}
      <div className="hidden md:flex items-center gap-3 font-inter">
        {isLoading ? (
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
        ) : user ? (
          <>
            <Button
              variant="outline"
              className="rounded-2xl text-[#15325a] border-2 border-[#15325a] hover:bg-[#15325a] hover:text-white transition-all duration-200"
              asChild
            >
              <Link href={dashboardLink!}>
                Dashboard
              </Link>
            </Button>
            <Button
              onClick={handleSignOut}
              className="rounded-2xl bg-red-600 border-2 border-transparent hover:bg-transparent hover:text-red-600 hover:border-2 hover:border-red-600 transition-all duration-200"
            >
              Sign Out
            </Button>
          </>
        ) : (
          <Link
            href="/auth"
            className="flex font-outfit items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-lg transition-colors hover:bg-blue-700"
          >
            Login / Signup
            <FiArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-2xl text-[#15325a] hover:text-blue-600 transition-colors"
      >
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md p-6 flex flex-col gap-4 md:hidden z-50">
          <Link 
            href="/" 
            className="text-[#15325a] font-outfit text-lg font-medium hover:text-blue-600 transition-colors" 
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Dropdown
            title="About Us"
            menuItems={[
              { label: "Our Story", href: "/about#story" },
              { label: "Team", href: "/about#team" },
            ]}
            mobile
          />

          <Dropdown
            title="Our Services"
            menuItems={[
              { label: "College Societies", href: "/society" },
              { label: "Companies / Startups", href: "/business" },
            ]}
            mobile
          />

          {/* Auth buttons (mobile) */}
          <div className="mt-4 flex flex-col gap-3">
            {isLoading ? (
              <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
            ) : user ? (
              <>
                <Button
                  variant="outline"
                  className="rounded-2xl text-[#15325a] border-2 border-[#15325a] hover:bg-[#15325a] hover:text-white transition-all duration-200"
                  asChild
                >
                  <Link href={dashboardLink!} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  className="rounded-2xl bg-red-600 border-2 border-transparent hover:bg-transparent hover:text-red-600 hover:border-2 hover:border-red-600 transition-all duration-200"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-2xl text-lg font-outfit transition-colors hover:bg-blue-700 w-full"
                onClick={() => setMenuOpen(false)}
              >
                Login / Signup
                <FiArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
