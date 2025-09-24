"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Pencil, FileText, CheckCircle, Shield } from "lucide-react";
import { toast } from "sonner";

// ✅ Define Project type
interface Project {
  id: string;
  compliant_name: string;
  compliant_description: string;
  services_required: string;
}

// Separate component that uses useParams
function EditProjectContent() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form state
  const [projectName, setProjectName] = useState<string>("");
  const [servicesRequired, setServicesRequired] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [hideDetails, setHideDetails] = useState<boolean>(false);

  // ✅ Fetch project by ID
  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      const supabase = getSupabaseClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const token = session.access_token;

      try {
        const res = await fetch(
          `${API_URL}/api/get-project?project_id=${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          setError("Failed to load project");
          setLoading(false);
          return;
        }

        const data: Project = await res.json();
        setProject(data);
        setProjectName(data.compliant_name);
        setServicesRequired(data.services_required);
        setProjectDescription(data.compliant_description);
      } catch (err) {
        setError("Unexpected error while fetching project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) return;

    // Basic validation
    if (!projectName.trim() || !servicesRequired.trim() || !projectDescription.trim()) {
      setError("All fields are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Not authenticated");

      const token = session.access_token;

      const res = await fetch(`${API_URL}/api/edit-project`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          name: projectName.trim(),
          services_required: servicesRequired.trim(),
          description: projectDescription.trim(),
          hide_details: hideDetails,
          status: "published",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Could not update project");
      }

      toast("Project published", {
        description: "Your project has been successfully updated and published.",
      });

      router.push("/business");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Project
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg rounded-xl">
          <CardContent className="p-8">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600 dark:text-gray-300">Loading project...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {project && (
              <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    <span>Edit & Publish Project</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Your Project
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Make changes to your project details and publish it
                  </p>
                </div>

                {/* Project Form */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <Label htmlFor="projectName" className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3" />
                      Project Name
                    </Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                      placeholder="Enter your project name"
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <Label htmlFor="servicesRequired" className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3" />
                      Services Required
                    </Label>
                    <Input
                      id="servicesRequired"
                      value={servicesRequired}
                      onChange={(e) => setServicesRequired(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                      placeholder="e.g., Graphic Design, Web Development, Marketing"
                    />
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <Label htmlFor="projectDescription" className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3" />
                      Project Description
                    </Label>
                    <Textarea
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white min-h-32"
                      placeholder="Describe your project in detail..."
                    />
                  </div>

                  {/* AI Moderation Checkbox */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hideDetails"
                        checked={hideDetails}
                        onCheckedChange={(checked) => setHideDetails(checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="hideDetails" className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                          <Shield className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                          Enable AI Content Moderation
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          Check this box if your project contains sensitive information (company names, emails, phone numbers, or personal details). 
                          Our AI will automatically redact sensitive information to protect your privacy before publishing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 h-12 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Publishing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Save and Publish</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// Main component that wraps the content in Suspense
export default function EditProject() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 dark:text-gray-300 font-medium">Loading project editor...</span>
        </div>
      </main>
    }>
      <EditProjectContent />
    </Suspense>
  );
}