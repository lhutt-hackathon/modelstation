"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldTitle
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const baseModelOptions = [
  { value: "gpt-4.1", label: "GPT-4.1 Enterprise (OpenAI)" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet (Anthropic)" },
  { value: "mistral-large", label: "Mistral Large 2 (Mistral)" },
  { value: "llama-405b", label: "Llama 3.1 405B (Meta)" },
  { value: "custom", label: "Bring your own checkpoint" }
];

const evaluationSuiteOptions = [
  "Policy alignment harness",
  "Edge-case adversarial chat",
  "Tool-call regression",
  "Live analyst blind review"
];

const selectStyles =
  "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

type FormState = {
  name: string;
  baseModel: string;
  datasetBrief: string;
  objective: string;
  success: string;
  notes: string;
  enableGuardrails: boolean;
  dryRun: boolean;
  evaluationSuites: string[];
};

const defaultState: FormState = {
  name: "",
  baseModel: baseModelOptions[0]?.value ?? "",
  datasetBrief: "",
  objective: "",
  success: "",
  notes: "",
  enableGuardrails: true,
  dryRun: false,
  evaluationSuites: ["Policy alignment harness", "Edge-case adversarial chat"]
};

export function CreateModelForm() {
  const [formState, setFormState] = useState<FormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, createModel } = useAuth();

  const selectedEvaluations = useMemo(() => new Set(formState.evaluationSuites), [formState.evaluationSuites]);

  const handleChange = <K extends keyof FormState>(key: K) => (value: FormState[K]) => {
    setFormState((previous) => ({ ...previous, [key]: value }));
  };

  const toggleEvaluation = (suite: string) => {
    setFormState((previous) => {
      const isSelected = previous.evaluationSuites.includes(suite);
      const nextSuites = isSelected
        ? previous.evaluationSuites.filter((current) => current !== suite)
        : [...previous.evaluationSuites, suite];

      return { ...previous, evaluationSuites: nextSuites };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      toast.error("Sign in to launch a fine-tune", {
        description: "Use the demo account (demo@modelstation.ai / modelstation) or create a new account."
      });
      return;
    }

    setIsSubmitting(true);

    const baseModelLabel =
      baseModelOptions.find((option) => option.value === formState.baseModel)?.label ?? formState.baseModel;
    createModel({
      name: formState.name.trim(),
      baseModel: baseModelLabel,
      dataset: formState.datasetBrief.trim(),
      objective: formState.objective.trim(),
      successCriteria: formState.success.trim(),
      guardrailsEnabled: formState.enableGuardrails,
      dryRun: formState.dryRun,
      notes: formState.notes.trim(),
      evaluationSuites: formState.evaluationSuites
    });

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Fine-tune request queued", {
        description: `${formState.name || "Untitled model"} will appear in your workspace shortly.`
      });
      setFormState(defaultState);
    }, 400);
  };

  const handleReset = () => {
    setFormState(defaultState);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border/70 bg-card p-10 text-center shadow-sm">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">Sign in to launch your fine-tune</h3>
          <p className="text-sm text-muted-foreground">
            Create a new account or use the demo credentials to explore the full workflow.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="px-6">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="ghost" className="px-6">
            <Link href="/login?demo=true">Use demo account</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Demo credentials — email: <span className="font-medium text-foreground">demo@modelstation.ai</span> · password:{" "}
          <span className="font-medium text-foreground">modelstation</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <FieldSet className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <FieldLegend>Model definition</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldTitle>Model name</FieldTitle>
            <FieldContent>
              <Input
                value={formState.name}
                onChange={(event) => handleChange("name")(event.target.value)}
                placeholder="e.g. Atlas QA Compliance Copilot"
                required
              />
              <FieldDescription>
                Give the model a memorable name so stakeholders can identify its remit across workspaces.
              </FieldDescription>
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldTitle>Base model</FieldTitle>
            <FieldContent>
              <select
                className={cn(selectStyles)}
                value={formState.baseModel}
                onChange={(event) => handleChange("baseModel")(event.target.value)}
              >
                {baseModelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldDescription>
                We import weights into a secure, isolated cluster. BYO checkpoints are validated before training.
              </FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldTitle>Model-specific data brief</FieldTitle>
            <FieldContent>
              <Textarea
                value={formState.datasetBrief}
                onChange={(event) => handleChange("datasetBrief")(event.target.value)}
                placeholder="Outline the proprietary sources, synthetic coverage, and policy guardrails we should build into this model's dataset run."
                rows={4}
                required
              />
              <FieldDescription>
                We generate a dedicated dataset for each fine-tune. Capture the data we should mobilize and any exclusions
                upfront.
              </FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldTitle>Objective narrative</FieldTitle>
            <FieldContent>
              <Textarea
                value={formState.objective}
                onChange={(event) => handleChange("objective")(event.target.value)}
                placeholder="Describe the workflows this model must automate, including must-pass scenarios."
                rows={4}
              />
              <FieldDescription>
                Narrative context guides scenario augmentation and evaluation synthesis during pipeline setup.
              </FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldTitle>Success criteria</FieldTitle>
            <FieldContent>
              <Textarea
                value={formState.success}
                onChange={(event) => handleChange("success")(event.target.value)}
                placeholder="Define measurable metrics (e.g. rubric ≥96%, mean time-to-resolution reduction ≥35%)."
                rows={3}
              />
              <FieldDescription>
                We map these metrics to automated evaluations and human review templates for sign-off.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <FieldLegend>Guardrails & verification</FieldLegend>
        <FieldGroup>
          <Field orientation="responsive">
            <FieldTitle>Policy guardrails</FieldTitle>
            <FieldContent className="flex items-center justify-between gap-6 rounded-md bg-background/40 p-4">
              <div>
                <p className="text-sm font-medium">Enforce institutional guardrails</p>
                <p className="text-sm text-muted-foreground">
                  Blocks unsafe tool usage, redlines, and jurisdiction-specific disclaimers in generated responses.
                </p>
              </div>
              <Switch
                checked={formState.enableGuardrails}
                onCheckedChange={(checked) => handleChange("enableGuardrails")(Boolean(checked))}
              />
            </FieldContent>
          </Field>

          <Field orientation="responsive">
            <FieldTitle>Dry run</FieldTitle>
            <FieldContent className="flex items-center justify-between gap-6 rounded-md bg-background/40 p-4">
              <div>
                <p className="text-sm font-medium">Generate dry-run model only</p>
                <p className="text-sm text-muted-foreground">
                  Produce eval-ready checkpoints without activating live integrations. Ideal for stakeholder preview.
                </p>
              </div>
              <Switch
                checked={formState.dryRun}
                onCheckedChange={(checked) => handleChange("dryRun")(Boolean(checked))}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldTitle>Evaluation suites</FieldTitle>
            <FieldContent className="grid gap-3 sm:grid-cols-2">
              {evaluationSuiteOptions.map((suite) => {
                const isSelected = selectedEvaluations.has(suite);
                return (
                  <button
                    key={suite}
                    type="button"
                    onClick={() => toggleEvaluation(suite)}
                    className={cn(
                      "rounded-md border px-4 py-3 text-left text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/70 bg-background/40 text-muted-foreground hover:border-border"
                    )}
                  >
                    {suite}
                  </button>
                );
              })}
            </FieldContent>
            <FieldDescription>
              Choose the evaluation harnesses that must pass before deployment. You can add custom suites later.
            </FieldDescription>
          </Field>

          <Field>
            <FieldTitle>Additional notes</FieldTitle>
            <FieldContent>
              <Textarea
                value={formState.notes}
                onChange={(event) => handleChange("notes")(event.target.value)}
                placeholder="Link SOPs, escalation owners, or sensitive edge-cases we should amplify."
                rows={3}
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="ghost" onClick={handleReset} disabled={isSubmitting}>
          Reset
        </Button>
        <Button type="submit" className="px-6" disabled={isSubmitting}>
          {isSubmitting ? "Queuing request..." : "Launch fine-tune"}
        </Button>
      </div>
    </form>
  );
}
