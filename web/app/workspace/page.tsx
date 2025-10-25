"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, DatabaseIcon, NotebookPenIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";

const datasetStatuses = ["Scoping", "Sourcing", "Labeling", "Vetting", "Delivered"] as const;

export default function WorkspacePage() {
  const { user, isReady, createDataset } = useAuth();

  const [datasetName, setDatasetName] = useState("");
  const [datasetFocus, setDatasetFocus] = useState("");
  const [datasetRecords, setDatasetRecords] = useState("");
  const [datasetStatus, setDatasetStatus] = useState<(typeof datasetStatuses)[number]>("Scoping");

  const sortedModels = useMemo(() => {
    if (!user) return [];
    return [...user.models].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [user]);

  const sortedDatasets = useMemo(() => {
    if (!user) return [];
    return [...user.datasets].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [user]);

  const handleDatasetSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast.error("Sign in required", { description: "Log in to create datasets." });
      return;
    }

    const recordsValue = Number(datasetRecords.replace(/[_,\s]/g, ""));
    if (Number.isNaN(recordsValue) || recordsValue <= 0) {
      toast.error("Invalid record estimate", { description: "Enter the approximate number of records you expect." });
      return;
    }

    createDataset({
      name: datasetName.trim(),
      focus: datasetFocus.trim(),
      records: recordsValue,
      status: datasetStatus
    });

    toast.success("Dataset request captured", {
      description: `${datasetName || "Untitled dataset"} added to your pipeline backlog.`
    });

    setDatasetName("");
    setDatasetFocus("");
    setDatasetRecords("");
    setDatasetStatus("Scoping");
  };

  if (!isReady) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Preparing your workspace…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center bg-background px-6 py-16">
        <div className="max-w-md rounded-xl border border-border/70 bg-card p-10 text-center shadow-sm">
          <NotebookPenIcon className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Sign in to access your workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your datasets, fine-tuned models, and evaluation runs live here. Use the demo account or create your own to
            explore.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login?demo=true">Use the demo account</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Demo credentials — email: <span className="font-medium text-foreground">demo@modelstation.ai</span> · password:{" "}
            <span className="font-medium text-foreground">modelstation</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(58,182,255,0.2)_0%,_rgba(116,108,255,0.1)_45%,_transparent_70%)] blur-3xl" />
        <div className="absolute bottom-16 right-16 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(255,153,102,0.22)_0%,_transparent_60%)] blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-16 lg:px-8">
        <section className="space-y-6">
          <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Workspace
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Monitor fine-tunes, orchestrate new datasets, and share evaluation artifacts across your teams. Every action
              here is contained to your workspace and audited for governance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="px-6">
              <Link href="/models">
                Launch a new fine-tune
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="px-6">
              <Link href="/#pipeline">Review dataset pipeline</Link>
            </Button>
          </div>
        </section>

        <Tabs defaultValue="models" className="space-y-8">
          <TabsList className="w-full max-w-lg bg-card/80">
            <TabsTrigger value="models">My models</TabsTrigger>
            <TabsTrigger value="datasets">My datasets</TabsTrigger>
            <TabsTrigger value="requests">Dataset requests</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6">
            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Your fine-tuned models</CardTitle>
                <CardDescription>
                  Track the status, guardrails, and objectives for every model you’ve launched through ModelStation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Base model</TableHead>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedModels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          No models yet. Launch your first fine-tune to populate this table.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedModels.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-foreground">{model.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Guardrails: {model.guardrailsEnabled ? "Enabled" : "Disabled"} · Dry run:{" "}
                                {model.dryRun ? "Yes" : "No"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{model.baseModel}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <DatabaseIcon className="h-4 w-4 text-muted-foreground/70" />
                              {model.dataset}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="border-none bg-primary/10 text-xs font-medium uppercase tracking-wide text-primary">
                              {model.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
                              new Date(model.updatedAt)
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {sortedModels.length > 0 && (
                  <div className="rounded-lg border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Latest objective</p>
                    <p>{sortedModels[0].objective}</p>
                    <p className="mt-2">
                      Success criteria: <span className="font-medium text-foreground">{sortedModels[0].successCriteria}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-6">
            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Your datasets</CardTitle>
                <CardDescription>
                  Every dataset pairs with an evaluation harness and policy pack. Capture updates as you iterate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Focus</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Records</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDatasets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          No datasets yet. Submit a new request to start the pipeline.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedDatasets.map((dataset) => (
                        <TableRow key={dataset.id}>
                          <TableCell className="font-medium text-foreground">{dataset.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{dataset.focus}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                              {dataset.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {dataset.records.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
                              new Date(dataset.updatedAt)
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card className="border border-border/70 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Submit a dataset brief</CardTitle>
                <CardDescription>
                  Outline the scenario mix you need, and our pipeline will generate the scoped dataset alongside eval
                  harnesses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-5" onSubmit={handleDatasetSubmit}>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="dataset-name">
                      Dataset name
                    </label>
                    <Input
                      id="dataset-name"
                      placeholder="e.g. Underwriting Risk Triage v2"
                      value={datasetName}
                      onChange={(event) => setDatasetName(event.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="dataset-focus">
                      Focus area
                    </label>
                    <Textarea
                      id="dataset-focus"
                      placeholder="Describe the workflows, content sources, and policy constraints we should incorporate."
                      value={datasetFocus}
                      onChange={(event) => setDatasetFocus(event.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="dataset-records">
                        Estimated records
                      </label>
                      <Input
                        id="dataset-records"
                        placeholder="2,500,000"
                        value={datasetRecords}
                        onChange={(event) => setDatasetRecords(event.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="dataset-status">
                        Stage
                      </label>
                      <select
                        id="dataset-status"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={datasetStatus}
                        onChange={(event) =>
                          setDatasetStatus(event.target.value as (typeof datasetStatuses)[number])
                        }
                      >
                        {datasetStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full sm:w-fit">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Submit dataset request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
