"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { API_URL } from "@/lib/constants"
import { useAuth } from "@/app/providers"
import { useRouter } from "next/navigation"
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
  Award,
  Building2,
  ImageIcon,
  Video,
  File,
} from "lucide-react"

// Type definitions
interface Profile {
  id: string
  society_name: string
  domain: string
  services_offered: string
  description?: string
  logo_url?: string
}

interface PortfolioItem {
  id: number
  file_path: string
  caption: string
}

export default function SocietyPortfolioPage() {
  const { userType } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (userType && userType !== "college_society") {
      console.log("userType:", userType)
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

  useEffect(() => {
    const loadProfileAndPortfolio = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { data: userProfile, error } = await supabase
        .from("college_society_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (error) {
        console.error(error)
      }
      setProfile(userProfile)
      setEditedProfile(userProfile || {})

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
      alert("Logo updated!")
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      alert(errorMessage)
    } finally {
      setLogoUploading(false)
    }
  }

  const handleUpload = async (): Promise<void> => {
    if (!profile?.id) {
      alert("Society profile missing or not signed in.")
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
      alert("Upload complete!")
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      alert("Upload failed: " + errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async (): Promise<void> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { error } = await supabase.from("college_society_profiles").update(editedProfile).eq("id", session.user.id)

      if (error) throw error

      setProfile(editedProfile as Profile)
      setIsEditingProfile(false)
      alert("Profile updated!")
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      alert("Failed to update profile: " + errorMessage)
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
      "from-primary to-accent",
      "from-accent to-secondary",
      "from-secondary to-primary",
      "from-primary to-secondary",
      "from-accent to-primary",
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

  return (
    <main className="min-h-screen bg-primary">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {profile && (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Logo Section */}
                <div className="relative group">
                  <div className="relative cursor-pointer" onClick={handleLogoClick}>
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/30 backdrop-blur-sm">
                      <img
                        src={profile.logo_url || "/placeholder.svg?height=128&width=128&query=society+logo"}
                        alt="Society Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {logoUploading && (
                      <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                        <Camera className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-xs font-medium">Change Logo</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  {!isEditingProfile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center lg:justify-start space-x-3">
                        <h1 className="h1">{profile.society_name}</h1>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingProfile(true)}
                          className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex justify-center lg:justify-start">
                        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                          {profile.domain}
                        </Badge>
                      </div>

                      <p className="text-xl text-white/80 leading-relaxed max-w-2xl">{profile.services_offered}</p>

                      {profile.description && (
                        <p className="text-white/70 leading-relaxed max-w-2xl">{profile.description}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <Input
                        value={editedProfile.society_name || ""}
                        onChange={(e) => setEditedProfile({ ...editedProfile, society_name: e.target.value })}
                        className="text-xl font-bold bg-white/20 border-white/30 text-white placeholder:text-white/60"
                        placeholder="Society Name"
                      />
                      <Input
                        value={editedProfile.domain || ""}
                        onChange={(e) => setEditedProfile({ ...editedProfile, domain: e.target.value })}
                        placeholder="Domain (e.g., Technology, Arts, Sports)"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                      />
                      <Textarea
                        value={editedProfile.services_offered || ""}
                        onChange={(e) => setEditedProfile({ ...editedProfile, services_offered: e.target.value })}
                        placeholder="Services offered..."
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                        rows={2}
                      />
                      <Textarea
                        value={editedProfile.description || ""}
                        onChange={(e) => setEditedProfile({ ...editedProfile, description: e.target.value })}
                        placeholder="Additional description..."
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveProfile}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingProfile(false)
                            setEditedProfile(profile)
                          }}
                          variant="outline"
                          size="sm"
                          className="border-white/30 text-white hover:bg-white/20"
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Camera className="w-5 h-5 mr-2" />
                      <span className="text-2xl font-bold">{items.length}</span>
                    </div>
                    <p className="text-white/70 text-sm">Portfolio Items</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Eye className="w-5 h-5 mr-2" />
                      <span className="text-2xl font-bold">1.2k</span>
                    </div>
                    <p className="text-white/70 text-sm">Profile Views</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-5 h-5 mr-2" />
                      <span className="text-2xl font-bold">89</span>
                    </div>
                    <p className="text-white/70 text-sm">Total Likes</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="w-5 h-5 mr-2" />
                      <span className="text-2xl font-bold">12</span>
                    </div>
                    <p className="text-white/70 text-sm">Projects Done</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        {/* Upload Section */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-secondary mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="h3 text-text">Portfolio Management</h2>
                  <p className="text-text/60">Showcase your society's best work and achievements</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {items.length > 0 && <Badge className="bg-accent/10 text-accent px-3 py-1">{items.length} items</Badge>}
                <div className="flex items-center space-x-2">
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
                    className="border-dashed border-2 border-accent/30 text-accent hover:bg-accent/10 hover:border-accent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Files
                  </Button>
                  {files.length > 0 && (
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-gradient-to-r from-accent to-secondary hover:from-accent-hover hover:to-secondary text-white"
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
          <Card className="rounded-2xl border border-accent/20 bg-accent/5 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-medium text-text">
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
                  className="text-accent hover:text-accent-hover hover:bg-accent/10"
                >
                  Clear all
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file, idx) => {
                  const ext = file.name.split(".").pop()?.toLowerCase() || ""
                  const FileIcon = getFileIcon(ext)

                  return (
                    <div
                      key={idx}
                      className="bg-white dark:bg-secondary rounded-xl p-4 shadow-sm border border-accent/10"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <FileIcon className="w-5 h-5 text-accent" />
                        </div>
                        <p className="text-xs text-text truncate w-full text-center font-medium">{file.name}</p>
                        <Badge variant="secondary" className="text-xs bg-accent/10 text-accent">
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
          <Card className="rounded-2xl border-2 border-dashed border-accent/20 bg-accent/5">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-white" />
              </div>
              <h3 className="h3 text-text mb-2">No portfolio items yet</h3>
              <p className="text-text/60 mb-6 max-w-md mx-auto">
                Start building your society's portfolio by uploading your first file. Showcase your best work and
                achievements.
              </p>
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="bg-gradient-to-r from-accent to-secondary hover:from-accent-hover hover:to-secondary text-white px-8 py-3 rounded-xl"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item, index) => {
              const url = supabase.storage.from("society-portfolio").getPublicUrl(item.file_path).data.publicUrl
              const ext = item.file_path.split(".").pop()?.toLowerCase() || ""
              const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
              const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext)
              const FileIcon = getFileIcon(ext)

              return (
                <Card
                  key={item.id}
                  className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-0 bg-white dark:bg-secondary"
                  onClick={() => openModal(item)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    {isImage && (
                      <img
                        src={url || "/placeholder.svg"}
                        alt={item.caption}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    {isVideo && (
                      <div className="relative w-full h-full bg-primary">
                        <video src={url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="w-8 h-8 text-primary ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                    {!isImage && !isVideo && (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${getRandomGradient(index)} flex flex-col items-center justify-center`}
                      >
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                          <FileIcon className="w-10 h-10 text-white" />
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30">{ext.toUpperCase()}</Badge>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Share2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-text truncate">{item.caption}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs border-accent/20 text-accent">
                          {getFileTypeLabel(ext)}
                        </Badge>
                        <div className="flex items-center space-x-1 text-text/40">
                          <Heart className="w-3 h-3" />
                          <span className="text-xs">{Math.floor(Math.random() * 50) + 1}</span>
                        </div>
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
          <DialogContent className="max-w-5xl border-0 bg-white dark:bg-secondary rounded-2xl shadow-2xl">
            {selectedItem && (
              <>
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-xl font-bold text-text">{selectedItem.caption}</DialogTitle>
                </DialogHeader>
                <div className="bg-primary/5 rounded-xl overflow-hidden">
                  {(() => {
                    const url = supabase.storage.from("society-portfolio").getPublicUrl(selectedItem.file_path)
                      .data.publicUrl
                    const ext = selectedItem.file_path.split(".").pop()?.toLowerCase() || ""
                    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
                    const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext)

                    if (isImage) {
                      return (
                        <img
                          src={url || "/placeholder.svg"}
                          alt={selectedItem.caption}
                          className="max-w-full max-h-[70vh] object-contain mx-auto"
                        />
                      )
                    }
                    if (isVideo) {
                      return <video src={url} controls className="max-w-full max-h-[70vh] mx-auto rounded-lg" />
                    }
                    return (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <FileText className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-text mb-2">{ext.toUpperCase()} File</h3>
                        <p className="text-text/60 mb-6">Click below to download this file</p>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-accent to-secondary hover:from-accent-hover hover:to-secondary text-white px-6 py-3 rounded-xl"
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
                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-text/60 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">Like</span>
                    </button>
                    <button className="flex items-center space-x-2 text-text/60 hover:text-accent transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span className="font-medium">Share</span>
                    </button>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="border-accent/20 text-accent hover:bg-accent/10 rounded-xl bg-transparent"
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
