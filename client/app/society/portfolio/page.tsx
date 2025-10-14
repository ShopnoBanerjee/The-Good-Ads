"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import { useAuth } from "@/app/providers"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Upload,
  Camera,
  FileText,
  Play,
  Download,
  Edit3,
  Plus,
  Eye,
  Heart,
  Share2,
  X,
  Check,
  Building2,
  ImageIcon,
  Video,
  File,
  Users,
  ArrowLeft,
  Calendar,
  Phone,
  Globe,
  Briefcase,
  AlertCircle,
  LucideIcon,
  MapPin,
  Star
} from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { DOMAINS, INDIAN_STATES, INDIAN_CITIES } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Type definitions
interface Profile {
  id: string
  society_name: string
  poc_name?: string
  phone_number?: string
  establishment_date?: string
  state?: string
  city?: string
  domains?: string[]
  services_offered?: string[]
  total_member_count?: number
  college_name?: string
  description?: string
  logo_url?: string
  average_rating?: number
  total_ratings?: number
}

interface PortfolioItem {
  id: number
  file_path: string
  caption: string
}

interface FieldErrors {
  [key: string]: string
}

interface FormFieldProps {
  label: string
  name: keyof Profile
  type?: string
  icon?: LucideIcon
  placeholder: string
  required?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
}

// FormField component matching registration page styling
const FormField = ({ label, name, type = "text", icon: Icon, placeholder, required = true, value, onChange, error }: FormFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={name} className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
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
)

// Zod validation schema for society profile
const societyProfileSchema = z.object({
  society_name: z.string().min(2, "Society name is required"),
  poc_name: z.string().min(2, "POC name is required"),
  phone_number: z.string().regex(/^\+91\s?[6-9]\d{9}$/, "Please enter a valid Indian phone number starting with +91 followed by 10 digits"),
  establishment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please provide a valid establishment date (YYYY-MM-DD)"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  domains: z.array(z.string()).min(1, "At least one domain is required"),
  services_offered: z.array(z.string()).min(1, "At least one service is required"),
  total_member_count: z.number().min(1, "Total member count must be at least 1"),
  college_name: z.string().optional(),
  description: z.string().optional(),
})

export default function SocietyPortfolioPage() {
  const { userType } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    if (userType && userType !== "college_society") {
      router.replace("/")
    }
  }, [userType, router])

  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState<boolean>(false)
  const [logoUploading, setLogoUploading] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({})
  const supabase = getSupabaseClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [customService, setCustomService] = useState<string>("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadProfileAndPortfolio = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      // Fetch society profile using the API endpoint
      const profileRes = await fetch(`${API_URL}/api/society-profile`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (profileRes.ok) {
        const userProfile = await profileRes.json()
        setProfile(userProfile)
        setEditedProfile(userProfile)
        // Initialize available cities based on the profile's state
        if (userProfile.state) {
          setAvailableCities(INDIAN_CITIES[userProfile.state] || [])
        }
      } else {
        console.error('Failed to fetch society profile')
      }

      // Fetch portfolio items
      const res = await fetch(`${API_URL}/api/get-portfolio`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data: PortfolioItem[] = await res.json()
        setItems(data)
      }
    }

    loadProfileAndPortfolio()
  }, [supabase])

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selected = Array.from(e.target.files || [])
    setFiles(selected)
  }

  const handleLogoClick = (): void => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = handleLogoUpload
    input.click()
  }

  const handleLogoUpload = async (e: Event): Promise<void> => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    setLogoUploading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`${API_URL}/api/society/update-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Upload failed")
      }

      const data = await res.json()
      setProfile({ ...profile!, logo_url: data.logo_url })
      toast("Logo updated", {
        description: "Your society logo has been successfully updated.",
      })
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      toast.error("Logo upload failed", {
        description: errorMessage,
      })
    } finally {
      setLogoUploading(false)
    }
  }

  const handleUpload = async (): Promise<void> => {
    if (!profile?.id) {
      toast.error("Profile missing", {
        description: "Society profile missing or not signed in.",
      })
      return
    }
    setUploading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      for (const file of files) {
        const path = `portfolio/${profile.id}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage.from("society-portfolio").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (uploadError) {
          console.error(uploadError)
          continue
        }

        await fetch(`${API_URL}/api/upload-portfolio-metadata`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            file_path: path,
            caption: file.name,
          }),
        })
      }

      setFiles([])
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      const res = await fetch(`${API_URL}/api/get-portfolio`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data: PortfolioItem[] = await res.json()
        setItems(data)
      }
      toast("Upload complete", {
        description: "Your portfolio items have been uploaded successfully.",
      })
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      toast.error("Upload failed", {
        description: errorMessage,
      })
    } finally {
      setUploading(false)
    }
  }

  // Form handling functions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setEditedProfile(prev => ({ ...prev, [name]: value }))

    // Clear field error when user starts typing
    setFieldErrors(prevErrors => {
      if (prevErrors[name]) {
        const newErrors = { ...prevErrors }
        delete newErrors[name]
        return newErrors
      }
      return prevErrors
    })
  }

  const handleDomainChange = (domain: string, checked: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      domains: checked ? [...(prev.domains || []), domain] : (prev.domains || []).filter(d => d !== domain)
    }))
    setFieldErrors(prev => {
      if (prev.domains) {
        const newErrors = { ...prev }
        delete newErrors.domains
        return newErrors
      }
      return prev
    })
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      services_offered: checked ? [...(prev.services_offered || []), service] : (prev.services_offered || []).filter(s => s !== service)
    }))
    setFieldErrors(prev => {
      if (prev.services_offered) {
        const newErrors = { ...prev }
        delete newErrors.services_offered
        return newErrors
      }
      return prev
    })
  }

  const addCustomService = () => {
    if (customService.trim() && !(editedProfile.services_offered || []).includes(customService.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        services_offered: [...(prev.services_offered || []), customService.trim()]
      }))
      setCustomService("")
    }
  }

  const handleStateChange = (state: string) => {
    setEditedProfile(prev => ({
      ...prev,
      state,
      city: "" // Reset city when state changes
    }))
    setAvailableCities(INDIAN_CITIES[state] || [])
    setFieldErrors(prev => {
      if (prev.state) {
        const newErrors = { ...prev }
        delete newErrors.state
        return newErrors
      }
      return prev
    })
  }

  const handleCityChange = (city: string) => {
    setEditedProfile(prev => ({
      ...prev,
      city
    }))
    setFieldErrors(prev => {
      if (prev.city) {
        const newErrors = { ...prev }
        delete newErrors.city
        return newErrors
      }
      return prev
    })
  }

  const handleSaveProfile = async (): Promise<void> => {
    try {
      // Validate form data
      const validationResult = societyProfileSchema.safeParse(editedProfile)
      if (!validationResult.success) {
        const errors: FieldErrors = {}
        validationResult.error.errors.forEach(error => {
          errors[error.path[0] as string] = error.message
        })
        setFieldErrors(errors)
        toast.error("Validation failed", {
          description: "Please fix the errors in the form.",
        })
        return
      }

      // Clear any existing errors
      setFieldErrors({})

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const res = await fetch(`${API_URL}/api/society-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(editedProfile),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to update profile")
      }

      const data = await res.json()
      setProfile(data.profile)
      setIsEditingProfile(false)
      toast("Portfolio updated", {
        description: "Your portfolio has been successfully updated.",
      })
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      toast.error("Failed to update portfolio", {
        description: errorMessage,
      })
    }
  }

  const getFileIcon = (ext: string) => {
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return ImageIcon
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return Video
    return File
  }

  const getFileTypeLabel = (ext: string): string => {
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "Image"
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return "Video"
    return ext.toUpperCase()
  }

  const getRandomGradient = (index: number): string => {
    const gradients = [
      "from-blue-600 via-blue-500 to-blue-700",
      "from-blue-700 via-blue-600 to-blue-500",
      "from-blue-500 via-blue-600 to-blue-800",
      "from-blue-800 via-blue-700 to-blue-600",
      "from-blue-600 to-blue-700",
    ]
    return gradients[index % gradients.length]
  }

  const openModal = (item: PortfolioItem): void => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-[#15325a]"></div>
  }

  return (
    <main 
      className="min-h-screen bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out font-outfit"
      style={{
        transition: 'background-color 0.2s ease-in-out',
      }}
    >
      {/* Header Section */}
      <div 
        className="text-white"
        style={{
          background: theme === "dark" 
            ? "linear-gradient(135deg, #1a4b6b 0%, #15325a 50%, #0d2847 100%)"
            : "linear-gradient(135deg, #1679A8 0%, #1A97BA 50%, #63C3DD 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/society')}
              className="text-white hover:bg-white/20 -ml-2 rounded-2xl font-outfit transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          {profile && (
            <div className="space-y-6 sm:space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Logo Section */}
                <div className="relative group flex-shrink-0">
                  <div className="relative cursor-pointer" onClick={handleLogoClick}>
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/30 backdrop-blur-sm">
                      <Image
                        fill
                        src={profile.logo_url || "/placeholder.svg?height=128&width=128&query=society+logo"}
                        alt="Society Logo"
                        className="object-cover"
                      />
                    </div>
                    {logoUploading && (
                      <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1" />
                        <p className="text-xs font-medium">Change Logo</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  {!isEditingProfile ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-3">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight font-outfit">
                          {profile.society_name}
                        </h1>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingProfile(true)}
                          className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 ease-in-out font-outfit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>

                      {profile.college_name && (
                        <p className="text-white/80 text-lg font-medium">
                          {profile.college_name}
                        </p>
                      )}

                      {/* Profile metadata badges */}
                      <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                        {profile.domains && profile.domains.length > 0 && (
                          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors px-3 py-1">
                            {profile.domains.length} Domain{profile.domains.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {profile.services_offered && profile.services_offered.length > 0 && (
                          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors px-3 py-1">
                            {profile.services_offered.length} Service{profile.services_offered.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {profile.total_member_count && (
                          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors px-3 py-1">
                            {profile.total_member_count} Members
                          </Badge>
                        )}
                        {profile.state && profile.city && (
                          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors px-3 py-1">
                            {profile.city}, {profile.state}
                          </Badge>
                        )}
                      </div>

                      {profile.description && (
                        <p className="text-white/70 leading-relaxed max-w-2xl text-sm sm:text-base font-outfit">
                          {profile.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-2xl bg-white/10 dark:bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
                      <FormField
                        label="Society Name"
                        name="society_name"
                        icon={Users}
                        placeholder="Enter society name..."
                        value={editedProfile.society_name || ""}
                        onChange={handleChange}
                        error={fieldErrors.society_name}
                      />
                      <FormField
                        label="College Name (optional)"
                        name="college_name"
                        icon={Building2}
                        placeholder="Enter your college/university name"
                        value={editedProfile.college_name || ""}
                        onChange={handleChange}
                        error={fieldErrors.college_name}
                        required={false}
                      />
                      <FormField
                        label="Point of Contact Name"
                        name="poc_name"
                        icon={Users}
                        placeholder="Enter contact person name..."
                        value={editedProfile.poc_name || ""}
                        onChange={handleChange}
                        error={fieldErrors.poc_name}
                      />
                      <FormField
                        label="Phone Number"
                        name="phone_number"
                        type="tel"
                        icon={Phone}
                        placeholder="+91 98765 43210"
                        value={editedProfile.phone_number || ""}
                        onChange={handleChange}
                        error={fieldErrors.phone_number}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          State
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                            >
                              {editedProfile.state || "Select State"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                            <DropdownMenuLabel className="text-gray-300">Choose State</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            {INDIAN_STATES.map(state => (
                              <DropdownMenuCheckboxItem
                                key={state}
                                checked={editedProfile.state === state}
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
                        <label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          City
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                              disabled={!editedProfile.state}
                            >
                              {editedProfile.city || "Select City"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                            <DropdownMenuLabel className="text-gray-300">Choose City</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            {availableCities.map(city => (
                              <DropdownMenuCheckboxItem
                                key={city}
                                checked={editedProfile.city === city}
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
                        name="establishment_date"
                        type="date"
                        icon={Calendar}
                        placeholder=""
                        value={editedProfile.establishment_date || ""}
                        onChange={handleChange}
                        error={fieldErrors.establishment_date}
                      />
                      <div className="space-y-2">
                        <label htmlFor="total_member_count" className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                          <Users className="w-4 h-4 text-gray-400" />
                          Total Member Count
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            id="total_member_count"
                            type="number"
                            name="total_member_count"
                            value={editedProfile.total_member_count ?? ""}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === "") {
                                setEditedProfile(prev => ({
                                  ...prev,
                                  total_member_count: undefined
                                }))
                              } else {
                                const num = parseInt(value, 10)
                                if (!isNaN(num) && num >= 0) {
                                  setEditedProfile(prev => ({
                                    ...prev,
                                    total_member_count: num
                                  }))
                                }
                              }
                            }}
                            placeholder="Enter total number of members..."
                            min="1"
                            className={`h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#11aad4] focus:ring-offset-0 placeholder:text-gray-400 transition-all duration-300 ${
                              fieldErrors.total_member_count ? "border-red-500 focus:ring-red-500 focus:ring-offset-0" : ""
                            }`}
                          />
                          <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                        </div>
                        {fieldErrors.total_member_count && (
                          <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.total_member_count}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          Domains
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full h-11 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 justify-start hover:bg-gray-600 transition-all duration-300"
                            >
                              {editedProfile.domains && editedProfile.domains.length > 0 ? `${editedProfile.domains.length} selected` : "Select Domains"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 bg-[#15325a] border-gray-700 max-h-48 overflow-auto">
                            <DropdownMenuLabel className="text-gray-300">Choose Domains</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            {Object.keys(DOMAINS).map(domain => (
                              <DropdownMenuCheckboxItem
                                key={domain}
                                checked={editedProfile.domains?.includes(domain) || false}
                                onCheckedChange={(checked) => handleDomainChange(domain, checked as boolean)}
                                className="text-white focus:bg-[#11aad4] focus:text-white"
                              >
                                {domain}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {editedProfile.domains && editedProfile.domains.length > 0 && (
                          <p className="text-xs text-gray-400 font-outfit">
                            Selected: {editedProfile.domains.join(", ")}
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
                        <label className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                          <Globe className="w-4 h-4 text-gray-400" />
                          Services Offered
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        {(editedProfile.domains || []).map(domain => {
                          const domainServices = DOMAINS[domain] || []
                          const selectedForDomain = (editedProfile.services_offered || []).filter(service => domainServices.includes(service))
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
                                      checked={(editedProfile.services_offered || []).includes(service)}
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
                          )
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
                          {(editedProfile.services_offered || []).filter(service => !Object.values(DOMAINS).flat().includes(service)).length > 0 && (
                            <p className="text-xs text-gray-400 font-outfit">
                              Added: {(editedProfile.services_offered || []).filter(service => !Object.values(DOMAINS).flat().includes(service)).join(", ")}
                            </p>
                          )}
                        </div>
                        {fieldErrors.services_offered && (
                          <div className="flex items-center gap-1 text-xs text-red-400 animate-in slide-in-from-top-1 duration-200 font-outfit">
                            <AlertCircle className="w-3 h-3" />
                            {fieldErrors.services_offered}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium text-white flex items-center gap-2 font-outfit">
                          <FileText className="w-4 h-4 text-gray-400" />
                          Description
                        </label>
                        <Textarea
                          id="description"
                          value={editedProfile.description || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile, description: e.target.value })}
                          placeholder="Additional description..."
                          className="h-24 font-outfit text-white bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#11aad4] focus:ring-offset-0 placeholder:text-gray-400 transition-all duration-300 resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          size="sm"
                          className="bg-[#11aad4] hover:bg-[#0d8bb3] text-white rounded-xl font-outfit transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingProfile(false)
                            setEditedProfile(profile || {})
                            setFieldErrors({})
                          }}
                          variant="outline"
                          size="sm"
                          className="border-white/30 text-white hover:bg-white/20 rounded-xl font-outfit transition-all duration-200 ease-in-out"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Section */}
              {!isEditingProfile && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                  <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center transition-colors duration-200 ease-in-out">
                    <div className="flex items-center justify-center mb-2">
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-xl sm:text-2xl font-bold font-outfit">{items.length}</span>
                    </div>
                    <p className="text-white/70 text-xs sm:text-sm font-outfit">Portfolio Items</p>
                  </div>
                  <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center transition-colors duration-200 ease-in-out">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-xl sm:text-2xl font-bold font-outfit">{profile.total_member_count || 0}</span>
                    </div>
                    <p className="text-white/70 text-xs sm:text-sm font-outfit">Members</p>
                  </div>
                  {profile.average_rating !== undefined && profile.average_rating > 0 && (
                    <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center transition-colors duration-200 ease-in-out">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl sm:text-2xl font-bold font-outfit">{profile.average_rating.toFixed(1)}</span>
                      </div>
                      <p className="text-white/70 text-xs sm:text-sm font-outfit">
                        Rating ({profile.total_ratings || 0})
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10 pb-12 sm:pb-16">
        {/* Upload Section */}
        <Card 
          className="rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15325a]/90 mb-6 sm:mb-8 transition-all duration-200 ease-in-out"
          style={{
            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
          }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                    Portfolio Management
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-outfit transition-colors duration-200 ease-in-out">
                    Showcase your society&apos;s best work and achievements
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                {items.length > 0 && (
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 text-sm font-outfit rounded-xl">
                    {items.length} items
                  </Badge>
                )}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFilesChange}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                  />
                  <Button
                    onClick={() => document.getElementById("file-upload")?.click()}
                    variant="outline"
                    className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-600 rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Files
                  </Button>
                  {files.length > 0 && (
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload {files.length}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Files Preview */}
        {files.length > 0 && (
          <Card 
            className="rounded-2xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 mb-6 sm:mb-8 transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-medium text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiles([])
                    const fileInput = document.getElementById("file-upload") as HTMLInputElement
                    if (fileInput) fileInput.value = ""
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                >
                  Clear all
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {files.map((file, idx) => {
                  const ext = file.name.split(".").pop()?.toLowerCase() || ""
                  const FileIcon = getFileIcon(ext)

                  return (
                    <div
                      key={idx}
                      className="bg-white dark:bg-[#15325a]/50 rounded-xl p-3 sm:p-4 shadow-sm border border-blue-200 dark:border-blue-700 transition-all duration-200 ease-in-out"
                      style={{
                        transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <FileIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs text-[#15325a] dark:text-white truncate w-full text-center font-medium font-outfit transition-colors duration-200 ease-in-out">
                          {file.name}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-outfit"
                        >
                          {getFileTypeLabel(ext)}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Grid */}
        {items.length === 0 ? (
          <Card 
            className="rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#15325a] dark:text-white mb-2 font-outfit transition-colors duration-200 ease-in-out">
                No portfolio items yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-sm sm:text-base leading-relaxed font-outfit transition-colors duration-200 ease-in-out">
                Start building your society&apos;s portfolio by uploading your first file. Showcase your best work and
                achievements.
              </p>
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-2xl font-outfit transition-all duration-200 ease-in-out"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Upload First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {items.map((item, index) => {
              const url = supabase.storage.from("society-portfolio").getPublicUrl(item.file_path).data.publicUrl
              const ext = item.file_path.split(".").pop()?.toLowerCase() || ""
              const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
              const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext)
              const FileIcon = getFileIcon(ext)

              return (
                <Card
                  key={item.id}
                  className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15325a]/90"
                  onClick={() => openModal(item)}
                  style={{
                    transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  }}
                >
                  <div className="aspect-square relative overflow-hidden">
                    {isImage && (
                      <Image
                        fill
                        src={url || "/placeholder.svg"}
                        alt={item.caption}
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    {isVideo && (
                      <div className="relative w-full h-full bg-gray-900">
                        <video src={url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900 ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                    {!isImage && !isVideo && (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${getRandomGradient(index)} flex flex-col items-center justify-center`}
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                          <FileIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 rounded-xl font-outfit">
                          {ext.toUpperCase()}
                        </Badge>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-[#15325a] dark:text-white truncate font-outfit text-sm sm:text-base transition-colors duration-200 ease-in-out">
                        {item.caption}
                      </h3>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-xl font-outfit"
                        >
                          {getFileTypeLabel(ext)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal for viewing items */}
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open) closeModal()
          }}
        >
          <DialogContent 
            className="max-w-xs sm:max-w-2xl lg:max-w-5xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#15325a] rounded-2xl shadow-2xl transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            {selectedItem && (
              <>
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-lg sm:text-xl font-bold text-[#15325a] dark:text-white font-outfit transition-colors duration-200 ease-in-out">
                    {selectedItem.caption}
                  </DialogTitle>
                </DialogHeader>
                <div className="bg-gray-50 dark:bg-[#15325a]/50 rounded-xl overflow-hidden transition-colors duration-200 ease-in-out">
                  {(() => {
                    const url = supabase.storage.from("society-portfolio").getPublicUrl(selectedItem.file_path)
                      .data.publicUrl
                    const ext = selectedItem.file_path.split(".").pop()?.toLowerCase() || ""
                    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
                    const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext)

                    if (isImage) {
                      return (
                        <div className="relative w-full h-[50vh] sm:h-[70vh]">
                          <Image
                            fill
                            src={url || "/placeholder.svg"}
                            alt={selectedItem.caption}
                            className="object-contain"
                          />
                        </div>
                      )
                    }
                    if (isVideo) {
                      return <video src={url} controls className="max-w-full max-h-[50vh] sm:max-h-[70vh] mx-auto rounded-lg" />
                    }
                    return (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                          <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-[#15325a] dark:text-white mb-2 font-outfit transition-colors duration-200 ease-in-out">
                          {ext.toUpperCase()} File
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base font-outfit transition-colors duration-200 ease-in-out">
                          Click below to download this file
                        </p>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-accent to-blue-600 hover:from-accent/90 hover:to-blue-600/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-outfit transition-all duration-200 ease-in-out"
                        >
                          <a href={url} download className="inline-flex items-center space-x-2">
                            <Download className="w-4 h-4" />
                            <span>Download File</span>
                          </a>
                        </Button>
                      </div>
                    )
                  })()}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10 space-y-3 sm:space-y-0 transition-colors duration-200 ease-in-out">
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors font-outfit">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">Like</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-accent transition-colors font-outfit">
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">Share</span>
                    </button>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="border-accent/20 text-accent hover:bg-accent/10 rounded-2xl bg-transparent font-outfit transition-all duration-200 ease-in-out"
                  >
                    <a
                      href={
                        supabase.storage.from("society-portfolio").getPublicUrl(selectedItem.file_path).data.publicUrl
                      }
                      download
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
