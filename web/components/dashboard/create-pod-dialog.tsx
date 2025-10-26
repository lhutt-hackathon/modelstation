"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface CreatePodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreatePodRequest {
  name: string;
  image_name: string;
  env?: Record<string, string>;
}

const DOCKER_IMAGES = [
  {
    value: "runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel",
    label: "PyTorch 2.1.0 (CUDA 11.8)",
  },
  {
    value: "runpod/tensorflow:2.14.0-py3.10-cuda11.8.0-devel",
    label: "TensorFlow 2.14.0 (CUDA 11.8)",
  },
  { value: "runpod/base:0.4.0-cuda11.8.0", label: "Base (CUDA 11.8)" },
];

export function CreatePodDialog({ open, onOpenChange }: CreatePodDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreatePodRequest>({
    name: "",
    image_name: "runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel",
  });

  const createPodMutation = useMutation({
    mutationFn: async (data: CreatePodRequest) => {
      const response = await fetch("/api/cloud/pods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create pod");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pods"] });
      toast.success("H100 pod created successfully");
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        image_name: "runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel",
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create pod: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Pod name is required");
      return;
    }
    createPodMutation.mutate(formData);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New H100 Pod</AlertDialogTitle>
            <AlertDialogDescription>
              Configure and launch a new NVIDIA H100 80GB HBM3 GPU pod instance
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            {/* Pod Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Pod Name *</Label>
              <Input
                id="name"
                placeholder="my-training-pod"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Docker Image */}
            <div className="grid gap-2">
              <Label htmlFor="image">Docker Image</Label>
              <select
                id="image"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.image_name}
                onChange={(e) =>
                  setFormData({ ...formData, image_name: e.target.value })
                }
              >
                {DOCKER_IMAGES.map((img) => (
                  <option key={img.value} value={img.value}>
                    {img.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">GPU Configuration:</p>
              <p className="text-muted-foreground mt-1">
                NVIDIA H100 80GB HBM3 • Secure Cloud • 50GB Volume • 50GB Container Disk
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={createPodMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={createPodMutation.isPending}
            >
              {createPodMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creating H100 Pod...
                </>
              ) : (
                "Create H100 Pod"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
