'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"

export default function ProjectProposalsPage() {
  const params = useParams();
  const project_id = params?.project_id; // ✅ Safe fallback

  const router = useRouter();

  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    console.log("Resolved project_id:", project_id);

    if (!project_id) return;

    const fetchProposals = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const token = session.access_token;

      const res = await fetch(`${API_URL}/api/project-proposals?project_id=${project_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to load proposals");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setProposals(data);
      setLoading(false);
    };

    fetchProposals();
  }, [project_id]);

const handleAccept = async (proposalId) => {
  setAcceptingId(proposalId);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const token = session.access_token;

    const res = await fetch(`${API_URL}/api/accept-proposal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ proposal_id: proposalId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to accept proposal");
    }

    toast("Success",{
      description: "Proposal accepted!",
    });

    router.refresh();
  } catch (err) {
    setError(err.message);
  } finally {
    setAcceptingId(null);
  }
};


  return (
    <main className="min-h-screen px-4 py-10 bg-muted">
      <h1 className="text-2xl font-bold mb-6">
        Proposals for Project {project_id || "(undefined)"}
      </h1>

      {loading && <p>Loading proposals…</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4">
        {proposals.length === 0 && !loading && (
          <p className="text-muted-foreground">No proposals yet.</p>
        )}
        {proposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardContent className="p-4 space-y-3">
              <p><strong>Society ID:</strong> {proposal.society_id}</p>
              <p><strong>Pitch:</strong> {proposal.pitch}</p>
              <p><strong>Status:</strong> {proposal.status}</p>
              {proposal.status !== "accepted" && (
                <Button
                  onClick={() => handleAccept(proposal.id)}
                  disabled={acceptingId === proposal.id}
                >
                  {acceptingId === proposal.id ? "Accepting…" : "Accept Proposal"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
