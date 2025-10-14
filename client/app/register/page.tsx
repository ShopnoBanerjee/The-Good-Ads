"use client";

import { useState, useEffect, ChangeEvent, FormEvent, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "../../lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Building2, Users, Phone, Briefcase, CheckCircle, AlertCircle, Loader2, LucideIcon, Plus } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/app/providers";
import Image from "next/image";
import CompanyLogo from "@/public/logo/our-logo.png";
import { DOMAINS, INDIAN_STATES, INDIAN_CITIES } from "../../lib/constants";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox"; 

interface FormData {
  businessName: string;
  pocName: string;
  phoneNumber: string;
  domain: string;
  societyName: string;
  collegeName?: string;
  establishmentDate: string;
  domains: string[];
  servicesOffered: string[];
  state: string;
  city: string;
  industrySector: string;
  companyType: string;
  pocRole: string;
  objectives: string[];
  totalMemberCount: number;
  confirmBusiness: boolean;
  confirmSociety: boolean;
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
        <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
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
  const { session } = useAuth();
  const userTypeFromParams = searchParams.get("userType");
  const userTypeFromMetadata = session?.user?.user_metadata?.userType;
  const initialUserType = userTypeFromParams || userTypeFromMetadata;
  const [selectedUserType, setSelectedUserType] = useState<string | null>(initialUserType);

  useEffect(() => {
  }, [session]);

  const [form, setForm] = useState<FormData>({
    businessName: "",
    pocName: "",
    phoneNumber: "",
    domain: "",
    societyName: "",
    collegeName: "",
    establishmentDate: "",
    domains: [],
    servicesOffered: [],
    state: "",
    city: "",
    industrySector: "",
    companyType: "",
    pocRole: "",
    objectives: [],
    totalMemberCount: 0,
    confirmBusiness: false,
    confirmSociety: false,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [customService, setCustomService] = useState<string>("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Define Zod schemas
  const indianPhone = z.string().regex(/^\+91\s?[6-9]\d{9}$/, "Please enter a valid Indian phone number starting with +91 followed by 10 digits");
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  const businessSchema = z.object({
    businessName: z.string().min(2, "Business name is required"),
    pocName: z.string().min(2, "POC name is required"),
    phoneNumber: indianPhone,
    establishmentDate: z.string().regex(dateRegex, "Please provide a valid establishment date (YYYY-MM-DD)"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    industrySector: z.string().min(1, "Industry/Sector is required"),
    companyType: z.string().min(1, "Company type is required"),
    pocRole: z.string().min(1, "POC role is required"),
    domains: z.array(z.string()).min(1, "At least one domain is required"),
    objectives: z.array(z.string()).min(1, "At least one objective is required"),
    confirmBusiness: z.boolean().refine(val => val === true, "You must confirm that the details are accurate"),
  });

  const societySchema = z.object({
    societyName: z.string().min(2, "Society name is required"),
    pocName: z.string().min(2, "POC name is required"),
    phoneNumber: indianPhone,
    establishmentDate: z.string().regex(dateRegex, "Please provide a valid establishment date (YYYY-MM-DD)"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    domains: z.array(z.string()).min(1, "At least one domain is required"),
    servicesOffered: z.array(z.string()).min(1, "At least one service is required"),
    totalMemberCount: z.number().min(1, "Total member count must be at least 1"),
    collegeName: z.string().optional(),
    confirmSociety: z.boolean().refine(val => val === true, "You must confirm that the details are accurate"),
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

  const handleDomainChange = (domain: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      domains: checked ? [...prev.domains, domain] : prev.domains.filter(d => d !== domain)
    }));
    setFieldErrors(prev => {
      if (prev.domains) {
        const newErrors = { ...prev };
        delete newErrors.domains;
        return newErrors;
      }
      return prev;
    });
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      servicesOffered: checked ? [...prev.servicesOffered, service] : prev.servicesOffered.filter(s => s !== service)
    }));
    setFieldErrors(prev => {
      if (prev.servicesOffered) {
        const newErrors = { ...prev };
        delete newErrors.servicesOffered;
        return newErrors;
      }
      return prev;
    });
  };

  const addCustomService = () => {
    if (customService.trim() && !form.servicesOffered.includes(customService.trim())) {
      setForm(prev => ({
        ...prev,
        servicesOffered: [...prev.servicesOffered, customService.trim()]
      }));
      setCustomService("");
    }
  };

  const handleStateChange = (state: string) => {
    setForm(prev => ({
      ...prev,
      state,
      city: "" // Reset city when state changes
    }));
    setAvailableCities(INDIAN_CITIES[state] || []);
    setFieldErrors(prev => {
      if (prev.state) {
        const newErrors = { ...prev };
        delete newErrors.state;
        return newErrors;
      }
      return prev;
    });
  };

  const handleCityChange = (city: string) => {
    setForm(prev => ({
      ...prev,
      city
    }));
    setFieldErrors(prev => {
      if (prev.city) {
        const newErrors = { ...prev };
        delete newErrors.city;
        return newErrors;
      }
      return prev;
    });
  };

  const handleCompanyTypeChange = (companyType: string) => {
    setForm(prev => ({
      ...prev,
      companyType
    }));
    setFieldErrors(prev => {
      if (prev.companyType) {
        const newErrors = { ...prev };
        delete newErrors.companyType;
        return newErrors;
      }
      return prev;
    });
  };

  const handleObjectiveChange = (objective: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      objectives: checked ? [...prev.objectives, objective] : prev.objectives.filter(obj => obj !== objective)
    }));
    setFieldErrors(prev => {
      if (prev.objectives) {
        const newErrors = { ...prev };
        delete newErrors.objectives;
        return newErrors;
      }
      return prev;
    });
  };

  const handleTotalMemberCountChange = (value: string) => {
    const count = parseInt(value) || 0;
    setForm(prev => ({
      ...prev,
      totalMemberCount: count
    }));
    setFieldErrors(prev => {
      if (prev.totalMemberCount !== undefined) {
        const newErrors = { ...prev };
        delete newErrors.totalMemberCount;
        return newErrors;
      }
      return prev;
    });
  };

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
            errors[key] = (val as { _errors: string[] })._errors[0];
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
                establishment_date: form.establishmentDate,
                state: form.state,
                city: form.city,
                industry_sector: form.industrySector,
                company_type: form.companyType,
                poc_role: form.pocRole,
                domains: form.domains,
                objectives: form.objectives,
            }
          : {
              userType,
              society_name: form.societyName,
                poc_name: form.pocName,
                phone_number: form.phoneNumber,
                establishment_date: form.establishmentDate,
                state: form.state,
                city: form.city,
                domains: form.domains,
              services_offered: form.servicesOffered,
              total_member_count: form.totalMemberCount,
              ...(form.collegeName ? { college_name: form.collegeName } : {}),
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

  // If no userType determined, show selection
  if (!selectedUserType) {
    return (
      <main className="min-h-screen bg-blue-900 flex items-center justify-center p-4 font-outfit">
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-[#15325a] relative z-10">
          <CardContent className="p-8">
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
                Choose Account Type
              </h1>
              <p className="text-gray-400 text-sm font-outfit">
                Select the type of account you want to create
              </p>
            </div>
            <div className="space-y-4">
              <Button 
                onClick={() => setSelectedUserType('business')} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Business
              </Button>
              <Button 
                onClick={() => setSelectedUserType('college_society')} 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Users className="mr-2 h-4 w-4" />
                College Society
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Now selectedUserType is set, use it as userType
  const userType = selectedUserType;

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
                  label="Industry / Sector"
                  name="industrySector"
                  icon={Briefcase}
                  placeholder="e.g., Information Technology, Healthcare, Finance..."
                  value={form.industrySector}
                  onChange={handleChange}
                  error={fieldErrors.industrySector}
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                    Company Type
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                      >
                        {form.companyType || "Select Company Type"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                      <DropdownMenuLabel className="text-gray-300">Choose Company Type</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      {["Startup", "SME", "Corporate", "Agency", "NGO", "VC", "Research Org"].map(type => (
                        <DropdownMenuCheckboxItem
                          key={type}
                          checked={form.companyType === type}
                          onCheckedChange={() => handleCompanyTypeChange(type)}
                          className="text-white focus:bg-[#11aad4] focus:text-white"
                        >
                          {type}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {fieldErrors.companyType && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.companyType}
                    </div>
                  )}
                </div>
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
                  label="POC Role"
                  name="pocRole"
                  icon={Users}
                  placeholder="e.g., CEO, Manager, HR Head..."
                  value={form.pocRole}
                  onChange={handleChange}
                  error={fieldErrors.pocRole}
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                    State
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                      >
                        {form.state || "Select State"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                      <DropdownMenuLabel className="text-gray-300">Choose State</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      {INDIAN_STATES.map(state => (
                        <DropdownMenuCheckboxItem
                          key={state}
                          checked={form.state === state}
                          onCheckedChange={() => handleStateChange(state)}
                          className="text-white focus:bg-[#11aad4] focus:text-white"
                        >
                          {state}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {fieldErrors.state && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.state}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                    City
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                        disabled={!form.state}
                      >
                        {form.city || "Select City"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                      <DropdownMenuLabel className="text-gray-300">Choose City</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      {availableCities.map(city => (
                        <DropdownMenuCheckboxItem
                          key={city}
                          checked={form.city === city}
                          onCheckedChange={() => handleCityChange(city)}
                          className="text-white focus:bg-[#11aad4] focus:text-white"
                        >
                          {city}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {fieldErrors.city && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.city}
                    </div>
                  )}
                </div>
                <FormField
                  label="Establishment Date"
                  name="establishmentDate"
                  type="date"
                  placeholder=""
                  value={form.establishmentDate}
                  onChange={handleChange}
                  error={fieldErrors.establishmentDate}
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                    Domains
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                      >
                        {form.domains.length > 0 ? `${form.domains.length} selected` : "Select Domains"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                      <DropdownMenuLabel className="text-gray-300">Choose Domains</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      {Object.keys(DOMAINS).map(domain => (
                        <DropdownMenuCheckboxItem
                          key={domain}
                          checked={form.domains.includes(domain)}
                          onCheckedChange={(checked) => handleDomainChange(domain, checked as boolean)}
                          className="text-white focus:bg-[#11aad4] focus:text-white"
                        >
                          {domain}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuCheckboxItem
                        key="Other"
                        checked={form.domains.includes("Other")}
                        onCheckedChange={(checked) => handleDomainChange("Other", checked as boolean)}
                        className="text-white focus:bg-[#11aad4] focus:text-white"
                      >
                        Other
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {form.domains.length > 0 && (
                    <p className="text-xs text-gray-400 font-outfit">
                      Selected: {form.domains.join(", ")}
                    </p>
                  )}
                  {fieldErrors.domains && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.domains}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                    What are you looking to achieve through inHalt?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="space-y-2">
                    {[
                      "Execute short-term live projects",
                      "Hire student talent for internships or full-time",
                      "Conduct campus-based research",
                      "Collaborate for CSR / social impact initiatives",
                      "Promote brand visibility among college students"
                    ].map(objective => (
                      <div key={objective} className="flex items-center space-x-2">
                        <Checkbox
                          id={objective}
                          checked={form.objectives.includes(objective)}
                          onCheckedChange={(checked) => handleObjectiveChange(objective, checked as boolean)}
                          className="text-[#11aad4]"
                        />
                        <Label htmlFor={objective} className="text-sm text-gray-300 font-outfit cursor-pointer">
                          {objective}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {fieldErrors.objectives && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.objectives}
                    </div>
                  )}
                </div>
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
                {/* Optional College Name */}
                <FormField
                  label="College Name (optional)"
                  name="collegeName"
                  icon={Building2}
                  placeholder="Enter your college/university name"
                  value={form.collegeName || ''}
                  onChange={handleChange}
                  error={fieldErrors.collegeName}
                  required={false}
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                    State
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                      >
                        {form.state || "Select State"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                      <DropdownMenuLabel className="text-gray-300">Choose State</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      {INDIAN_STATES.map(state => (
                        <DropdownMenuCheckboxItem
                          key={state}
                          checked={form.state === state}
                          onCheckedChange={() => handleStateChange(state)}
                          className="text-white focus:bg-[#11aad4] focus:text-white"
                        >
                          {state}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {fieldErrors.state && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.state}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                    City
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                        disabled={!form.state}
                      >
                        {form.city || "Select City"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                      <DropdownMenuLabel className="text-gray-300">Choose City</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      {availableCities.map(city => (
                        <DropdownMenuCheckboxItem
                          key={city}
                          checked={form.city === city}
                          onCheckedChange={() => handleCityChange(city)}
                          className="text-white focus:bg-[#11aad4] focus:text-white"
                        >
                          {city}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {fieldErrors.city && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.city}
                    </div>
                  )}
                </div>
                <FormField
                  label="Establishment Date"
                  name="establishmentDate"
                  type="date"
                  icon={Calendar}
                  placeholder=""
                  value={form.establishmentDate}
                  onChange={handleChange}
                  error={fieldErrors.establishmentDate}
                />
                <FormField
                  label="Total Member Count"
                  name="totalMemberCount"
                  type="number"
                  icon={Users}
                  placeholder="Enter total number of members..."
                  value={form.totalMemberCount.toString()}
                  onChange={(e) => handleTotalMemberCountChange(e.target.value)}
                  error={fieldErrors.totalMemberCount}
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                    Domains
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                      >
                        {form.domains.length > 0 ? `${form.domains.length} selected` : "Select Domains"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                      <DropdownMenuLabel className="text-gray-300">Choose Domains</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      {Object.keys(DOMAINS).map(domain => (
                        <DropdownMenuCheckboxItem
                          key={domain}
                          checked={form.domains.includes(domain)}
                          onCheckedChange={(checked) => handleDomainChange(domain, checked as boolean)}
                          className="text-white focus:bg-[#11aad4] focus:text-white"
                        >
                          {domain}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {form.domains.length > 0 && (
                    <p className="text-xs text-gray-400 font-outfit">
                      Selected: {form.domains.join(", ")}
                    </p>
                  )}
                  {fieldErrors.domains && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.domains}
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <Label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                    Services Offered
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  {form.domains.map(domain => {
                    const domainServices = DOMAINS[domain] || [];
                    const selectedForDomain = form.servicesOffered.filter(service => domainServices.includes(service));
                    return (
                      <div key={domain} className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-300 font-outfit">{domain}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                            >
                              {selectedForDomain.length > 0 ? `${selectedForDomain.length} selected` : "Select Services"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-64 bg-[#15325a] border-gray-700 max-h-64 overflow-auto">
                            <DropdownMenuLabel className="text-gray-300">Choose Services</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            {domainServices.map(service => (
                              <DropdownMenuCheckboxItem
                                key={service}
                                checked={form.servicesOffered.includes(service)}
                                onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                                className="text-white focus:bg-[#11aad4] focus:text-white"
                              >
                                {service}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {selectedForDomain.length > 0 && (
                          <p className="text-xs text-gray-400 font-outfit">
                            Selected: {selectedForDomain.join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-300 font-outfit">Other Services</h3>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={customService}
                        onChange={(e) => setCustomService(e.target.value)}
                        placeholder="Add custom service..."
                        className="flex-1 h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#11aad4] focus:ring-offset-0 placeholder:text-gray-400 transition-all duration-300"
                        onKeyPress={(e) => e.key === 'Enter' && addCustomService()}
                      />
                      <Button
                        type="button"
                        onClick={addCustomService}
                        className="h-11 px-4 bg-[#11aad4] hover:bg-[#0d8bb3] text-white rounded-xl transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {form.servicesOffered.filter(service => !Object.values(DOMAINS).flat().includes(service)).length > 0 && (
                      <p className="text-xs text-gray-400 font-outfit">
                        Added: {form.servicesOffered.filter(service => !Object.values(DOMAINS).flat().includes(service)).join(", ")}
                      </p>
                    )}
                  </div>
                  {fieldErrors.servicesOffered && (
                    <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.servicesOffered}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Confirmation Checkbox */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="confirmation"
                checked={userType === "business" ? form.confirmBusiness : form.confirmSociety}
                onCheckedChange={(checked) => {
                  setForm(prev => ({
                    ...prev,
                    [userType === "business" ? "confirmBusiness" : "confirmSociety"]: checked as boolean
                  }));
                }}
                className="mt-1"
              />
              <Label htmlFor="confirmation" className="text-sm text-gray-300 font-outfit leading-relaxed cursor-pointer">
                I confirm that the above details are accurate and represent our official{" "}
                {userType === "business" ? "business" : "student organization"}.
              </Label>
            </div>
            {((userType === "business" && fieldErrors.confirmBusiness) || (userType === "society" && fieldErrors.confirmSociety)) && (
              <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                <AlertCircle className="w-3 h-3" />
                {userType === "business" ? fieldErrors.confirmBusiness : fieldErrors.confirmSociety}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || success} 
              className="w-full h-12 bg-[#11aad4] hover:bg-[#0d8bb3] border-2 border-[#11aad4] hover:border-[#0d8bb3] text-white font-medium font-outfit rounded-[40px] transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-8 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
