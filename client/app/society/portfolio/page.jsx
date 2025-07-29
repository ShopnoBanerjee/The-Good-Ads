'use client';

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";
import { useAuth } from "@/app/providers";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  Camera, 
  FileText, 
  Play, 
  Download, 
  Edit3, 
  Trash2,
  Plus,
  Eye,
  Heart,
  Share2,
  Save,
  X,
  Check
} from "lucide-react";

export default function SocietyPortfolioPage() {
  const { userType } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userType && userType !== "college_society") {
      console.log("userType:", userType);
      router.replace("/");
    }
  }, [userType, router]);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const supabase = getSupabaseClient();

  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadProfileAndPortfolio = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userProfile, error } = await supabase
        .from("college_society_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error(error);
      }
      setProfile(userProfile);
      setEditedProfile(userProfile || {});

      // Fetch portfolio items
      const res = await fetch(`${API_URL}/api/get-portfolio`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    };

    loadProfileAndPortfolio();
  }, []);

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const handleLogoClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleLogoUpload;
    input.click();
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLogoUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/society/update-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      const data = await res.json();
      setProfile({ ...profile, logo_url: data.logo_url });
      alert("Logo updated!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!profile?.id) {
      alert("Society profile missing or not signed in.");
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (const file of files) {
        const path = `portfolio/${profile.id}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("society-portfolio")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(uploadError);
          continue;
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
        });
      }

      setFiles([]);
      document.getElementById('file-upload').value = '';
      
      const res = await fetch(`${API_URL}/api/get-portfolio`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }

      alert("Upload complete!");
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("college_society_profiles")
        .update(editedProfile)
        .eq("id", session.user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditingProfile(false);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile: " + err.message);
    }
  };

  const getFileIcon = (ext) => {
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return Camera;
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return Play;
    return FileText;
  };

  const getFileTypeLabel = (ext) => {
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "Image";
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return "Video";
    return ext.toUpperCase();
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {profile && (
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Logo with edit overlay */}
              <div className="relative group">
                <div 
                  className="relative cursor-pointer"
                  onClick={handleLogoClick}
                >
                  <img
                    src={profile.logo_url || "https://via.placeholder.com/150"}
                    alt="Society Logo"
                    className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-white"
                  />
                  {logoUploading && (
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                      <Camera className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">Change Logo</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left group">
                {!isEditingProfile ? (
                  <>
                    <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                      <h1 className="text-4xl font-bold text-gray-900">{profile.society_name}</h1>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingProfile(true)}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Badge variant="secondary" className="mb-3 text-sm px-3 py-1">
                      {profile.domain}
                    </Badge>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mb-2">
                      {profile.services_offered}
                    </p>
                    {profile.description && (
                      <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                        {profile.description}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editedProfile.society_name || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, society_name: e.target.value})}
                        className="text-2xl font-bold border-0 border-b-2 rounded-none px-0"
                        placeholder="Society Name"
                      />
                    </div>
                    <Input
                      value={editedProfile.domain || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, domain: e.target.value})}
                      placeholder="Domain (e.g., Technology, Arts, Sports)"
                      className="w-full"
                    />
                    <Textarea
                      value={editedProfile.services_offered || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, services_offered: e.target.value})}
                      placeholder="Services offered..."
                      className="w-full"
                      rows={2}
                    />
                    <Textarea
                      value={editedProfile.description || ''}
                      onChange={(e) => setEditedProfile({...editedProfile, description: e.target.value})}
                      placeholder="Additional description..."
                      className="w-full"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditedProfile(profile);
                        }} 
                        variant="outline" 
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                {!isEditingProfile && (
                  <div className="flex justify-center md:justify-start items-center space-x-6 mt-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Camera className="w-4 h-4" />
                      <span>{items.length} posts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>1.2k views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>89 likes</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Minimal Upload Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
          <div className="flex items-center space-x-4">
            {items.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {items.length} items
              </Badge>
            )}
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
                onClick={() => document.getElementById('file-upload').click()}
                variant="outline"
                size="sm"
                className="border-dashed border-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Files
              </Button>
              {files.length > 0 && (
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

        {/* Selected Files Preview (only when files are selected) */}
        {files.length > 0 && (
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-blue-800">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiles([]);
                    document.getElementById('file-upload').value = '';
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {files.map((file, idx) => {
                  const ext = file.name.split(".").pop().toLowerCase();
                  const FileIcon = getFileIcon(ext);
                  
                  return (
                    <div key={idx} className="relative bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <p className="text-xs text-gray-700 truncate w-full text-center">{file.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Grid */}
        {items.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h3>
              <p className="text-gray-500 mb-4">Start building your society's portfolio by uploading your first file.</p>
              <Button
                onClick={() => document.getElementById('file-upload').click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, index) => {
              const url = supabase.storage
                .from("society-portfolio")
                .getPublicUrl(item.file_path).data.publicUrl;

              const ext = item.file_path.split(".").pop().toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
              const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext);
              const FileIcon = getFileIcon(ext);

              return (
                <Card 
                  key={item.id} 
                  className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => openModal(item)}
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    {isImage && (
                      <img 
                        src={url} 
                        alt={item.caption} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                    )}
                    {isVideo && (
                      <div className="relative w-full h-full">
                        <video 
                          src={url} 
                          className="w-full h-full object-cover" 
                          muted
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-gray-800 ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                    {!isImage && !isVideo && (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-3 shadow-lg">
                          <FileIcon className="w-8 h-8 text-gray-600" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {ext.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <Eye className="w-4 h-4 text-gray-700" />
                        </div>
                        <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <Share2 className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-gray-900 truncate mb-1">{item.caption}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {getFileTypeLabel(ext)}
                      </Badge>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Heart className="w-3 h-3" />
                        <span className="text-xs">{Math.floor(Math.random() * 50) + 1}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal for viewing items */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-gray-900">{selectedItem.caption}</h3>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="p-4">
                {(() => {
                  const url = supabase.storage
                    .from("society-portfolio")
                    .getPublicUrl(selectedItem.file_path).data.publicUrl;
                  
                  const ext = selectedItem.file_path.split(".").pop().toLowerCase();
                  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                  const isVideo = ["mp4", "mov", "avi", "webm"].includes(ext);
                  
                  if (isImage) {
                    return (
                      <img 
                        src={url} 
                        alt={selectedItem.caption} 
                        className="max-w-full max-h-[70vh] object-contain mx-auto"
                      />
                    );
                  }
                  
                  if (isVideo) {
                    return (
                      <video 
                        src={url} 
                        controls 
                        className="max-w-full max-h-[70vh] mx-auto"
                      />
                    );
                  }
                  
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-600 mb-4">{ext.toUpperCase()} File</p>
                      <Button asChild>
                        <a href={url} download className="inline-flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>Download File</span>
                        </a>
                      </Button>
                    </div>
                  );
                })()}
              </div>
              
              <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={supabase.storage.from("society-portfolio").getPublicUrl(selectedItem.file_path).data.publicUrl} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}