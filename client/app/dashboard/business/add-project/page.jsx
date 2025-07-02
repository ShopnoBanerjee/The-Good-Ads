'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/constants";

import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AddProjectPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    services: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // ✅ Zod schema for validation
  const schema = z.object({
    name: z.string().min(2, "Project name is required"),
    services: z.string().min(2, "Services required is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError("");
    setLoading(true);

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      for (const [key, val] of Object.entries(result.error.format())) {
        if (key !== "_errors") {
          fieldErrors[key] = val._errors[0];
        }
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const {
        data: { session },
        error: supabaseError,
      } = await supabase.auth.getSession();
      if (supabaseError || !session) throw new Error("Not authenticated");

      const token = session.access_token;

      const res = await fetch(`${API_URL}/api/create-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          services_required: form.services,
          description: form.description,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create project");
      }

      const { compliant_description, project_id } = await res.json();

      // ✅ Redirect to preview page with query params
      router.push(
        `/dashboard/business/preview?project_id=${project_id}&compliant=${encodeURIComponent(
          compliant_description
        )}`
      );
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-muted px-4">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4 text-center">Create New Project</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Project Name</Label>
              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <Label>Services Required</Label>
              <Input
                type="text"
                name="services"
                value={form.services}
                onChange={handleChange}
              />
              {errors.services && (
                <p className="text-xs text-red-500">{errors.services}</p>
              )}
            </div>

            <div>
              <Label>Project Description</Label>
              <Textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {apiError && <p className="text-xs text-red-500">{apiError}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting…" : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
