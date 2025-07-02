"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "../../lib/constants";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Phone, Globe, Briefcase, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

import { z } from "zod";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get("userType") || "business";

  const [form, setForm] = useState({
    businessName: "",
    pocName: "",
    phoneNumber: "",
    domain: "",
    societyName: "",
    servicesOffered: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
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
        const errors = {};
        for (const [key, val] of Object.entries(result.error.format())) {
          if (key !== "_errors") {
            errors[key] = val._errors[0];
          }
        }
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      const {
        data: { session },
        error: supabaseError,
      } = await supabase.auth.getSession();
      if (supabaseError || !session) throw new Error("Not authenticated");
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
        router.push(userType === "business" ? "/dashboard/business" : "/dashboard/society");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const FormField = ({ label, name, type = "text", icon: Icon, placeholder, required = true }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`h-11 transition-all duration-200 ${
            fieldErrors[name] 
              ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
          } hover:border-gray-400 focus:ring-2`}
        />
        {Icon && (
          <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
      </div>
      {fieldErrors[name] && (
        <div className="flex items-center gap-1 text-xs text-red-600 animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-3 h-3" />
          {fieldErrors[name]}
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-white/20 to-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-0 backdrop-blur-sm bg-white/90 relative z-10">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              {userType === "business" ? (
                <Building2 className="w-8 h-8 text-white" />
              ) : (
                <Users className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Registration
            </h1>
            <p className="text-gray-600 text-sm">
              {userType === "business" 
                ? "Set up your business profile to get started" 
                : "Set up your college society profile to get started"
              }
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Registration complete! Redirecting...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
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
                />
                <FormField
                  label="Point of Contact Name"
                  name="pocName"
                  icon={Users}
                  placeholder="Enter contact person name..."
                />
                <FormField
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  icon={Phone}
                  placeholder="+91 98765 43210"
                />
                <FormField
                  label="Domain"
                  name="domain"
                  icon={Globe}
                  placeholder="e.g., Technology, Healthcare, Finance..."
                />
              </>
            ) : (
              <>
                <FormField
                  label="Society Name"
                  name="societyName"
                  icon={Users}
                  placeholder="Enter society name..."
                />
                <FormField
                  label="Point of Contact Name"
                  name="pocName"
                  icon={Users}
                  placeholder="Enter contact person name..."
                />
                <FormField
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  icon={Phone}
                  placeholder="+91 98765 43210"
                />
                <FormField
                  label="Domain"
                  name="domain"
                  icon={Globe}
                  placeholder="e.g., Technical, Cultural, Sports..."
                />
                <FormField
                  label="Services Offered"
                  name="servicesOffered"
                  icon={Briefcase}
                  placeholder="Describe the services you offer..."
                />
              </>
            )}

            <Button 
              type="submit" 
              disabled={loading || success} 
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed!</span>
                </div>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              By completing registration, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}