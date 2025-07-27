"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated");
        return;
      }
      const token = session.access_token;

      const res = await fetch(`${API_URL}/api/marketplace-projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to load projects");
        return;
      }

      const data = await res.json();
      setProjects(data);
    };

    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-muted">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-xl font-semibold">{project.compliant_name}</h2>
              <p className="text-muted-foreground">{project.compliant_description}</p>
              <p><strong>Services:</strong> {project.services_required}</p>
              <Button
                onClick={() => router.push(`/dashboard/society/proposal?project_id=${project.id}`)}
              >
                Send Proposal
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
