"use client";

import { useState, useEffect, ChangeEvent, FormEvent, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "../../lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Phone, Globe, Briefcase, CheckCircle, AlertCircle, Loader2, LucideIcon } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/app/providers";
import Image from "next/image";
import CompanyLogo from "@/public/logo/our-logo.png"; 

// Loading Spinner Component (same as your auth code)
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      ></path>
    </svg>
  )
}

interface FormData {
  businessName: string;
  pocName: string;
  phoneNumber: string;
  domain: string;
  societyName: string;
  servicesOffered: string;
}

interface FieldErrors {
  [key: string]: string;
}

interface FormFieldProps {
  label: string;
  name: keyof FormData;
  type?: string;
  icon?: LucideIcon;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

// Move FormField outside and memoize it to prevent recreation
const FormField = ({ label, name, type = "text", icon: Icon, placeholder, required = true, value, onChange, error }: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <div className="relative">
      <Input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#11aad4] focus:ring-offset-0 placeholder:text-gray-400 transition-all duration-300 ${
          error ? "border-red-500 focus:ring-red-500 focus:ring-offset-0" : ""
        }`}
      />
      {Icon && (
        <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      )}
    </div>
    {error && (
      <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
        <AlertCircle className="w-3 h-3" />
        {error}
      </div>
    )}
  </div>
);

// Separate component that uses useSearchParams
function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get("userType") || "business";
  const { session } = useAuth();

  useEffect(() => {
    console.log("[RegisterPage] session from useAuth:", session);
    if (typeof window !== "undefined") {
      console.log("[RegisterPage] document.cookie:", document.cookie);
      console.log("[RegisterPage] localStorage keys:", Object.keys(localStorage));
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split("https://")[1]?.split(".");
      if (projectRef) {
        const key = `sb-${projectRef}-auth-token`;
        console.log(`[RegisterPage] localStorage[${key}]:`, localStorage.getItem(key));
      }
    }
  }, [session]);

  const [form, setForm] = useState<FormData>({
    businessName: "",
    pocName: "",
    phoneNumber: "",
    domain: "",
    societyName: "",
    servicesOffered: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Define Zod schemas
  const businessSchema = z.object({
    businessName: z.string().min(2, "Business name is required"),
    pocName: z.string().min(2, "POC name is required"),
    phoneNumber: z.string().min(5, "Phone number is required"),
    domain: z.string().min(2, "Domain is required"),
  });

  const societySchema = z.object({
    societyName: z.string().min(2, "Society name is required"),
    pocName: z.string().min(2, "POC name is required"),
    phoneNumber: z.string().min(5, "Phone number is required"),
    domain: z.string().min(2, "Domain is required"),
    servicesOffered: z.string().min(2, "Services offered is required"),
  });

  // Use useCallback to prevent function recreation on every render
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
    
    // Clear field error when user starts typing
    setFieldErrors(prevErrors => {
      if (prevErrors[name]) {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      }
      return prevErrors;
    });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setFieldErrors({});

    try {
      // Validate with Zod
      const schema = userType === "business" ? businessSchema : societySchema;
      const result = schema.safeParse(form);

      if (!result.success) {
        const errors: FieldErrors = {};
        for (const [key, val] of Object.entries(result.error.format())) {
          if (key !== "_errors") {
            errors[key] = (val as any)._errors[0];
          }
        }
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      // Use session from context
      if (!session) throw new Error("Not authenticated. Please refresh the page or try again.");
      const token = session.access_token;

      const payload =
        userType === "business"
          ? {
              userType,
              business_name: form.businessName,
              poc_name: form.pocName,
              phone_number: form.phoneNumber,
              domain: form.domain,
            }
          : {
              userType,
              society_name: form.societyName,
              poc_name: form.pocName,
              phone_number: form.phoneNumber,
              domain: form.domain,
              services_offered: form.servicesOffered,
            };

      const res = await fetch(`${API_URL}/api/complete-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(userType === "business" ? "/business" : "/society");
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show spinner while session is undefined (hydrating)
  if (typeof session === "undefined") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-blue-900 font-outfit">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="ml-2 text-white">Loading authentication...</span>
        </div>
      </main>
    );
  }

  // Show error and reload option if session is null
  if (session === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-blue-900 font-outfit">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <span className="text-lg font-medium text-red-300">
            Not authenticated. Please refresh the page or try clicking your magic link again.
          </span>
          <Button onClick={() => window.location.reload()} className="mt-2 bg-[#11aad4] hover:bg-[#0d8bb3] font-outfit">
            Refresh Page
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-900 flex items-center justify-center p-4 font-outfit">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-[#15325a] relative z-10">
        <CardContent className="p-8">
          {/* Header with Company Logo */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-4 w-40 h-40 rounded-full overflow-hidden">
              <Image 
                src={CompanyLogo}
                alt="Company Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 font-outfit">
              Complete Registration
            </h1>
            <p className="text-gray-400 text-sm font-outfit">
              {userType === "business" 
                ? "Set up your business profile to get started" 
                : "Set up your college society profile to get started"
              }
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium font-outfit">Registration complete! Redirecting...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-outfit">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {userType === "business" ? (
              <>
                <FormField
                  label="Business Name"
                  name="businessName"
                  icon={Building2}
                  placeholder="Enter your business name..."
                  value={form.businessName}
                  onChange={handleChange}
                  error={fieldErrors.businessName}
                />
                <FormField
                  label="Point of Contact Name"
                  name="pocName"
                  icon={Users}
                  placeholder="Enter contact person name..."
                  value={form.pocName}
                  onChange={handleChange}
                  error={fieldErrors.pocName}
                />
                <FormField
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  icon={Phone}
                  placeholder="+91 98765 43210"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  error={fieldErrors.phoneNumber}
                />
                <FormField
                  label="Domain"
                  name="domain"
                  icon={Globe}
                  placeholder="e.g., Technology, Healthcare, Finance..."
                  value={form.domain}
                  onChange={handleChange}
                  error={fieldErrors.domain}
                />
              </>
            ) : (
              <>
                <FormField
                  label="Society Name"
                  name="societyName"
                  icon={Users}
                  placeholder="Enter society name..."
                  value={form.societyName}
                  onChange={handleChange}
                  error={fieldErrors.societyName}
                />
                <FormField
                  label="Point of Contact Name"
                  name="pocName"
                  icon={Users}
                  placeholder="Enter contact person name..."
                  value={form.pocName}
                  onChange={handleChange}
                  error={fieldErrors.pocName}
                />
                <FormField
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  icon={Phone}
                  placeholder="+91 98765 43210"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  error={fieldErrors.phoneNumber}
                />
                <FormField
                  label="Domain"
                  name="domain"
                  icon={Globe}
                  placeholder="e.g., Technical, Cultural, Sports..."
                  value={form.domain}
                  onChange={handleChange}
                  error={fieldErrors.domain}
                />
                <FormField
                  label="Services Offered"
                  name="servicesOffered"
                  icon={Briefcase}
                  placeholder="Describe the services you offer..."
                  value={form.servicesOffered}
                  onChange={handleChange}
                  error={fieldErrors.servicesOffered}
                />
              </>
            )}

            <Button 
              type="submit" 
              disabled={loading || success} 
              className="w-full h-12 bg-[#11aad4] hover:bg-[#0d8bb3] border-2 border-[#11aad4] hover:border-[#0d8bb3] text-white font-medium font-outfit rounded-[40px] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-8 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Submitting...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed!</span>
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 leading-relaxed font-outfit">
              By completing registration, you agree to our{" "}
              <a href="#" className="text-[#11aad4] hover:text-[#0d8bb3] underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-[#11aad4] hover:text-[#0d8bb3] underline">Privacy Policy</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

// Main component that wraps the content in Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-blue-900">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="text-white font-medium font-outfit">Loading registration form...</span>
        </div>
      </main>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
