"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiMenu, FiX } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useTheme } from "next-themes";
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
        className={`flex items-center gap-1 transition-colors duration-200 ease-in-out ${
          mobile 
            ? "w-full justify-between py-2 text-[#15325a] dark:text-white font-outfit text-lg font-medium hover:text-blue-600 dark:hover:text-primary" 
            : "text-[#15325a] dark:text-white hover:text-blue-600 dark:hover:text-primary"
        }`}
        style={{
          transition: 'color 0.2s ease-in-out',
        }}
      >
        {title} <FaCaretDown size={14} />
      </button>

      {/* Desktop dropdown */}
      {!mobile && (
        <div
          className={`absolute top-full left-0 mt-2 w-44 bg-white dark:bg-[#15325a] shadow-md rounded-md py-2 z-10 transition-all duration-200 ease-in-out ${
            isOpen ? "block" : "hidden"
          } group-hover:block`}
          onMouseLeave={() => setIsOpen(false)}
          style={{
            transition: 'background-color 0.2s ease-in-out',
          }}
        >
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-primary transition-all duration-200 ease-in-out"
              style={{
                transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out',
              }}
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
              className="block py-2 text-base text-[#15325a] dark:text-white font-outfit font-medium hover:text-blue-600 dark:hover:text-primary transition-colors duration-200 ease-in-out"
              style={{
                transition: 'color 0.2s ease-in-out',
              }}
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
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Updated dashboard link logic with business user type support
  const dashboardLink = user
    ? (() => {
        if (userType === "college_society" || userType === "society") {
          return "/society";
        } else if (userType === "business") {
          return "/business";
        } else {
          return "/dashboard";
        }
      })()
    : null;

  // Don't render until mounted to prevent hydration mismatch and flickering
  if (!mounted) {
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

        {/* Desktop Navbar - Loading state */}
        <nav className="hidden md:flex gap-6 text-lg font-medium font-outfit">
          <div className="w-12 h-6 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-20 h-6 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-24 h-6 bg-gray-200 animate-pulse rounded"></div>
        </nav>

        {/* Loading state for auth buttons */}
        <div className="hidden md:flex items-center gap-3 font-inter">
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>

        {/* Mobile loading state */}
        <div className="md:hidden flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-6 h-6 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className="bg-white dark:bg-[#15325a] shadow-md px-6 py-4 flex items-center justify-between h-20 relative transition-colors duration-200 ease-in-out"
      style={{
        transition: 'background-color 0.2s ease-in-out',
      }}
    >
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
      <nav className="hidden md:flex gap-6 text-[#15325a] dark:text-white text-lg font-medium font-outfit">
        <Link 
          href="/" 
          className="text-[#15325a] dark:text-white hover:text-blue-600 dark:hover:text-primary transition-colors duration-200 ease-in-out"
          style={{
            transition: 'color 0.2s ease-in-out',
          }}
        >
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

      {/* Auth buttons and theme toggle (desktop) */}
      <div className="hidden md:flex items-center gap-3 font-inter">
        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="text-[#15325a] dark:text-white hover:text-blue-600 dark:hover:text-primary hover:bg-transparent dark:hover:bg-transparent transition-colors duration-200 ease-in-out"
          style={{
            transition: 'color 0.2s ease-in-out',
          }}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100 overflow-hidden" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {isLoading ? (
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
        ) : user ? (
          <>
            <Button
              variant="outline"
              className="rounded-2xl text-[#15325a] dark:text-white border-2 border-[#15325a] dark:border-white hover:bg-[#15325a] hover:text-white dark:hover:bg-white dark:hover:text-[#15325a] transition-all duration-200 ease-in-out"
              asChild
              style={{
                transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
              }}
            >
              <Link href={dashboardLink!}>
                Dashboard
              </Link>
            </Button>
            <Button
              onClick={handleSignOut}
              className="rounded-2xl bg-red-600 border-2 border-transparent hover:bg-transparent hover:text-red-600 hover:border-2 hover:border-red-600 transition-all duration-200 ease-in-out"
              style={{
                transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
              }}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <Link
            href="/auth"
            className="flex font-outfit items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-lg transition-colors hover:bg-blue-700 duration-200 ease-in-out"
          >
            Login / Signup
            <FiArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* Mobile: Theme Toggle + Hamburger Menu */}
      <div className="md:hidden flex items-center gap-3">
        {/* Mobile Theme Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="text-[#15325a] dark:text-white hover:text-blue-600 dark:hover:text-primary hover:bg-transparent dark:hover:bg-transparent transition-colors duration-200 ease-in-out p-2"
          style={{
            transition: 'color 0.2s ease-in-out',
          }}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl text-[#15325a] dark:text-white hover:text-blue-600 dark:hover:text-primary transition-colors duration-200 ease-in-out"
          style={{
            transition: 'color 0.2s ease-in-out',
          }}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div 
          className="absolute top-full left-0 w-full bg-white dark:bg-[#15325a] shadow-md p-6 flex flex-col gap-4 md:hidden z-50 transition-colors duration-200 ease-in-out"
          style={{
            transition: 'background-color 0.2s ease-in-out',
          }}
        >
          <Link 
            href="/" 
            className="text-[#15325a] dark:text-white font-outfit text-lg font-medium hover:text-blue-600 dark:hover:text-primary transition-colors duration-200 ease-in-out" 
            onClick={() => setMenuOpen(false)}
            style={{
              transition: 'color 0.2s ease-in-out',
            }}
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

          {/* Auth buttons (mobile) - Removed theme toggle from here */}
          <div className="mt-4 flex flex-col gap-3">
            {isLoading ? (
              <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
            ) : user ? (
              <>
                <Button
                  variant="outline"
                  className="rounded-2xl text-[#15325a] dark:text-white border-2 border-[#15325a] dark:border-white hover:bg-[#15325a] hover:text-white dark:hover:bg-white dark:hover:text-[#15325a] transition-all duration-200 ease-in-out"
                  asChild
                  style={{
                    transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                  }}
                >
                  <Link href={dashboardLink!} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  className="rounded-2xl bg-red-600 border-2 border-transparent hover:bg-transparent hover:text-red-600 hover:border-2 hover:border-red-600 transition-all duration-200 ease-in-out"
                  style={{
                    transition: 'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-2xl text-lg font-outfit transition-colors hover:bg-blue-700 w-full duration-200 ease-in-out"
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
