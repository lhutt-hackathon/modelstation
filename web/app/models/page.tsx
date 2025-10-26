"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon } from "lucide-react";

export default function ModelsPage() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // First, create the model in the database
      const token = window.localStorage.getItem("modelstation:token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const modelResponse = await fetch("/api/models", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt,
          baseModel: "gpt-3.5-turbo"
        }),
      });

      if (!modelResponse.ok) {
        throw new Error("Failed to create model");
      }

      const modelData = await modelResponse.json();
      const modelUid = modelData.model?.uid;
      if (!modelUid) {
        throw new Error("API did not return a model UID");
      }

      // Then, process the prompt through the pipeline
      const response = await fetch("/api/pipeline/process", {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt, modelUid }),
      });

      if (!response.ok) {
        throw new Error("Failed to process prompt");
      }

      const data = await response.json();
      const huggingfaceUrl =
        data?.huggingface_url || data?.huggingfaceUrl || null;

      const datasetLine = huggingfaceUrl
        ? `Dataset published: ${huggingfaceUrl}`
        : "No dataset was published for this prompt.";

      setResult(
        `Model created successfully with UID: ${modelUid}\n\n${data.message || "Processing completed successfully"}\n\n${datasetLine}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(122,94,255,0.55)_0%,_rgba(87,203,255,0.2)_40%,_transparent_70%)] blur-3xl" />
        <div className="absolute left-16 top-80 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(69,219,202,0.32)_0%,_rgba(255,188,122,0.2)_55%,_transparent_75%)] blur-3xl" />
        <div className="absolute bottom-12 right-12 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,_rgba(245,107,167,0.26)_0%,_transparent_60%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background via-background/85 to-transparent" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col gap-16 px-6 pb-24 pt-16 lg:px-8">
        <section className="space-y-10 text-center">
          <Badge
            variant="outline"
            className="mx-auto flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-xs font-medium uppercase tracking-[0.35em] text-primary"
          >
            Model Training Pipeline
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Create Fine-Tuned Model
            </h1>
            <p className="mx-auto max-w-3xl text-base text-muted-foreground">
              Describe your model requirements and we&apos;ll find the best training data using semantic search.
              Results are retrieved from Weaviate and published to Hugging Face for training.
            </p>
          </div>
        </section>

        <Card className="border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-primary/10 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle>Model Requirements</CardTitle>
            <CardDescription>
              Describe your model use case and training requirements. We&apos;ll find the best training data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="e.g., A customer support chatbot for technical troubleshooting with empathetic responses..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px] resize-none"
                disabled={isProcessing}
              />
              <Button type="submit" disabled={isProcessing || !prompt.trim()} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Find Training Data"
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-4 rounded-lg border border-primary/50 bg-primary/10 p-4">
                <p className="text-sm text-foreground">{result}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
