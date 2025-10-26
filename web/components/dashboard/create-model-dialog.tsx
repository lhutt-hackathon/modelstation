"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateModelDialog({ open, onOpenChange }: CreateModelDialogProps) {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const queryClient = useQueryClient();

  const createModelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          prompt,
          base_model: "flux-dev",
        }),
      });
      if (!response.ok) throw new Error("Failed to create model");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast.success("Model created successfully! Training has been queued.");
      setName("");
      setPrompt("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create model: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !prompt) {
      toast.error("Please fill in all required fields");
      return;
    }
    createModelMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create New Model
          </DialogTitle>
          <DialogDescription>
            Create a custom AI model from a text prompt. Training will be queued automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Model Name</Label>
              <Input
                id="name"
                placeholder="My Custom Model"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prompt">Training Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want your model to learn..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Describe the style, subject, or characteristics you want the model to learn.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createModelMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createModelMutation.isPending}>
              {createModelMutation.isPending ? "Creating..." : "Create Model"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
