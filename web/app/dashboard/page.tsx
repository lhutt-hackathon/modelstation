"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Square, RefreshCw, Trash2, Plus, Server, Activity, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePodDialog } from "@/components/dashboard/create-pod-dialog";
import { CreateModelDialog } from "@/components/dashboard/create-model-dialog";

interface Model {
  id: string;
  name: string;
  status: string;
  base_model: string;
  created_at: string;
  updated_at: string;
}

interface Pod {
  id: string;
  name: string;
  image?: string; // REST API uses "image" instead of "imageName"
  imageName?: string; // Keep for backwards compatibility
  desiredStatus?: string;
  machineId?: string;
  machine?: {
    gpuDisplayName?: string;
  };
  gpu?: {
    displayName?: string;
  };
  costPerHr?: number;
  containerDiskInGb?: number;
  volumeInGb?: number;
  cloudType?: string;
  lastStartedAt?: string;
  publicIp?: string;
  portMappings?: Record<string, number>;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export default function DashboardPage() {
  const [createPodDialogOpen, setCreatePodDialogOpen] = useState(false);
  const [createModelDialogOpen, setCreateModelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [podToDelete, setPodToDelete] = useState<string | null>(null);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("models");
  const queryClient = useQueryClient();

  // Fetch models
  const { data: modelsData, isLoading: modelsLoading } = useQuery<{ models: Model[]; count: number }>({
    queryKey: ["models"],
    queryFn: async () => {
      const response = await fetch("/api/models", {
        credentials: "include", // Include cookies
      });
      if (!response.ok) throw new Error("Failed to fetch models");
      return response.json();
    },
  });

  const models = modelsData?.models || [];

  // Fetch pods
  const { data: podsData, isLoading } = useQuery<ApiResponse<{ pods: Pod[]; count: number }>>({
    queryKey: ["pods"],
    queryFn: async () => {
      const response = await fetch("/api/cloud/pods", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch pods");
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const pods = podsData?.data?.pods || [];

  // Stop pod mutation
  const stopPodMutation = useMutation({
    mutationFn: async (podId: string) => {
      const response = await fetch(`/api/cloud/pods/${podId}/stop`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to stop pod");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pods"] });
      toast.success("Pod stopped successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to stop pod: ${error.message}`);
    },
  });

  // Resume pod mutation
  const resumePodMutation = useMutation({
    mutationFn: async (podId: string) => {
      const response = await fetch(`/api/cloud/pods/${podId}/resume`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to resume pod");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pods"] });
      toast.success("Pod resumed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to resume pod: ${error.message}`);
    },
  });

  // Terminate pod mutation
  const terminatePodMutation = useMutation({
    mutationFn: async (podId: string) => {
      const response = await fetch(`/api/cloud/pods/${podId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to terminate pod");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pods"] });
      toast.success("Pod terminated successfully");
      setDeleteDialogOpen(false);
      setPodToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to terminate pod: ${error.message}`);
    },
  });

  const handleDeleteClick = (podId: string) => {
    setPodToDelete(podId);
    setActiveTab("pods");
    setDeleteDialogOpen(true);
  };

  const handleDeleteModelClick = (modelId: string) => {
    setModelToDelete(modelId);
    setActiveTab("models");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (activeTab === "pods" && podToDelete) {
      terminatePodMutation.mutate(podToDelete);
    } else if (activeTab === "models" && modelToDelete) {
      deleteModelMutation.mutate(modelToDelete);
    }
  };

  // Delete model mutation
  const deleteModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`/api/models/${modelId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete model");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast.success("Model deleted successfully");
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete model: ${error.message}`);
    },
  });

  // Launch training mutation
  const launchTrainingMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`/api/models/train`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ model_id: modelId }),
      });
      if (!response.ok) throw new Error("Failed to launch training");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      toast.success("Training launched successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to launch training: ${error.message}`);
    },
  });

  const handleLaunchTraining = (modelId: string) => {
    launchTrainingMutation.mutate(modelId);
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "running":
        return <Badge className="bg-green-500">Running</Badge>;
      case "stopped":
        return <Badge variant="secondary">Stopped</Badge>;
      case "exited":
        return <Badge variant="destructive">Exited</Badge>;
      case "training":
        return <Badge className="bg-blue-500">Training</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "ready":
      case "completed":
        return <Badge className="bg-green-500">Ready</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const formatUptime = (startTime?: string) => {
    if (!startTime) return "N/A";
    try {
      const start = new Date(startTime);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 isolate">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your AI models and GPU instances
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="pods" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Pods
          </TabsTrigger>
        </TabsList>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">AI Models</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage your custom AI models
              </p>
            </div>
            <Button onClick={() => setCreateModelDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Model
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Models</CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{models.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {models.filter((m) => m.status?.toLowerCase() === "training").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {models.filter((m) => m.status?.toLowerCase() === "ready" || m.status?.toLowerCase() === "completed").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Models</CardTitle>
              <CardDescription>
                Models you've created from prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No models yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first AI model from a text prompt
                  </p>
                  <Button onClick={() => setCreateModelDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Model
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Base Model</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell>{getStatusBadge(model.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {model.base_model || "flux-dev"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(model.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(model.updated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {model.status?.toLowerCase() === "pending" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleLaunchTraining(model.id)}
                                  disabled={launchTrainingMutation.isPending}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Launch Training
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteModelClick(model.id)}
                                disabled={deleteModelMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pods Tab */}
        <TabsContent value="pods" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">GPU Pods</h2>
              <p className="text-sm text-muted-foreground">
                Manage your RunPod H100 GPU instances
              </p>
            </div>
            <Button onClick={() => setCreatePodDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Pod
            </Button>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pods</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pods.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pods.filter((p) => p.desiredStatus?.toLowerCase() === "running").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Cost/Hour</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${pods.reduce((sum, p) => sum + (p.costPerHr || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Pods</CardTitle>
          <CardDescription>
            View and manage all your GPU pod instances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : pods.length === 0 ? (
            <div className="text-center py-12">
              <Server className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pods yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first H100 GPU pod to get started
              </p>
              <Button onClick={() => setCreatePodDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create H100 Pod
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>GPU</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Cost/Hr</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pods.map((pod) => (
                    <TableRow key={pod.id}>
                      <TableCell className="font-medium">{pod.name}</TableCell>
                      <TableCell>{getStatusBadge(pod.desiredStatus)}</TableCell>
                      <TableCell>
                        {pod.machine?.gpuDisplayName || pod.gpu?.displayName || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {pod.image || pod.imageName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {formatUptime(pod.lastStartedAt)}
                      </TableCell>
                      <TableCell>
                        ${(pod.costPerHr || 0).toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {pod.desiredStatus?.toLowerCase() === "running" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => stopPodMutation.mutate(pod.id)}
                              disabled={stopPodMutation.isPending}
                            >
                              <Square className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resumePodMutation.mutate(pod.id)}
                              disabled={resumePodMutation.isPending}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(pod.id)}
                            disabled={terminatePodMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      <CreatePodDialog
        open={createPodDialogOpen}
        onOpenChange={setCreatePodDialogOpen}
      />

      <CreateModelDialog
        open={createModelDialogOpen}
        onOpenChange={setCreateModelDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {activeTab === "pods" ? "pod" : "model"}
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={terminatePodMutation.isPending || deleteModelMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={terminatePodMutation.isPending || deleteModelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {(terminatePodMutation.isPending || deleteModelMutation.isPending) ? "Deleting..." : `Delete ${activeTab === "pods" ? "Pod" : "Model"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
