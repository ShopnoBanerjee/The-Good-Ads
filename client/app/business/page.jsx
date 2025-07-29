'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BusinessDashboard() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = getSupabaseClient(); // <-- get the client here
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated");
        return;
      }
      const token = session.access_token;

      const res = await fetch(`${API_URL}/api/business-projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    <main className="min-h-screen px-4 py-10 bg-muted">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <Button asChild>
            <Link href="/dashboard/business/add-project">Create New Project</Link>
          </Button>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="space-y-4">
          {projects.length === 0 ? (
            <p className="text-muted-foreground">You have no projects yet.</p>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{project.compliant_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Status: {project.status}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/business/proposals/${project.id}`}>
                      View Proposals
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
