"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProjectPreview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  // ✅ Fetch project by ID
  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
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

      const res = await fetch(`${API_URL}/api/get-project?project_id=${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to load project");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProject(data);
      setLoading(false);
    };

    fetchProject();
  }, [projectId]);

  const handleConfirm = async () => {
    if (!projectId) return;
    setConfirming(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const token = session.access_token;

      const res = await fetch(`${API_URL}/api/confirm-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ project_id: projectId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Could not confirm project");
      }

      router.push("/dashboard/business");
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-muted px-4">
      <Card className="w-full max-w-xl p-6">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4 text-center">Review Your Project</h1>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {project && (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Project Name:</h2>
                <p>{project.compliant_name}</p>
              </div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Description:</h2>
                <p>{project.compliant_description}</p>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full"
              >
                {confirming ? "Confirming…" : "Confirm & Publish"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
