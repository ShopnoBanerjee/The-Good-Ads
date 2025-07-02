"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SendProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [pitch, setPitch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const token = session.access_token;

      const res = await fetch(`${API_URL}/api/send-proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          pitch: pitch,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Proposal failed");
      }

      router.push("/dashboard/society/marketplace"); // Or wherever you want to go
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-muted">
      <Card className="w-full max-w-lg p-6">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4 text-center">Send Your Proposal</h1>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pitch">Pitch</Label>
              <Textarea
                id="pitch"
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Describe why your society is the right fit…"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Sending…" : "Submit Proposal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
