'use client';

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";
import { useAuth } from "@/app/providers"; // adjust path as needed
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SocietyPortfolioPage() {
  const { userType } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userType && userType !== "society") {
      router.replace("/dashboard/business");
    }
  }, [userType, router]);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
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
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleLogoChange = (e) => {
    if (e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

   const handleUploadLogo = async () => {
    if (!logoFile) return;
    setLogoUploading(true);

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const formData = new FormData();
        formData.append("file", logoFile);

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
        setLogoFile(null);
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

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {profile && (
        <Card className="flex items-center space-x-6 p-6">
          <img
            src={profile.logo_url || "https://via.placeholder.com/100"}
            alt="Society Logo"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.society_name}</h1>
            <p className="text-muted-foreground">{profile.domain}</p>
            <p className="text-sm">{profile.services_offered}</p>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <CardContent className="space-y-4">
          <Label htmlFor="logo-upload">Change Society Logo</Label>
          <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} />
          <Button
            onClick={handleUploadLogo}
            disabled={!logoFile || logoUploading}
          >
            {logoUploading ? "Uploading…" : "Upload Logo"}
          </Button>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardContent className="space-y-4">
          <Label htmlFor="file-upload">Upload Portfolio Files</Label>
          <Input id="file-upload" type="file" multiple onChange={handleFilesChange} />

          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file, idx) => (
                <div key={idx} className="border p-2 rounded flex flex-col items-center">
                  <p className="text-sm truncate">{file.name}</p>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? "Uploading…" : "Upload Files"}
          </Button>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">Your Portfolio</h2>
          {items.length === 0 && (
            <p className="text-muted-foreground">No items yet.</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => {
              const url = supabase.storage
                .from("society-portfolio")
                .getPublicUrl(item.file_path).data.publicUrl;

              const ext = item.file_path.split(".").pop().toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "gif"].includes(ext);
              const isVideo = ["mp4", "mov"].includes(ext);

              return (
                <div key={item.id} className="border rounded overflow-hidden">
                  {isImage && <img src={url} alt={item.caption} className="w-full h-48 object-cover" />}
                  {isVideo && <video src={url} controls className="w-full h-48" />}
                  {!isImage && !isVideo && (
                    <div className="flex items-center justify-center h-48 bg-muted">
                      <p className="text-sm">{ext.toUpperCase()} File</p>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs truncate">{item.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
