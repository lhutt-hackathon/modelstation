"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const ACCOUNTS_STORAGE_KEY = "modelstation:accounts";
const SESSION_STORAGE_KEY = "modelstation:session";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export type DatasetRecord = {
  id: string;
  name: string;
  focus: string;
  records: number;
  status: "Scoping" | "Sourcing" | "Labeling" | "Vetting" | "Delivered";
  updatedAt: string;
};

export type ModelRecord = {
  id: string;
  name: string;
  baseModel: string;
  dataset: string;
  status: "Queued" | "Training" | "QA" | "Live";
  createdAt: string;
  updatedAt: string;
  objective: string;
  successCriteria: string;
  guardrailsEnabled: boolean;
  dryRun: boolean;
  notes: string;
  evaluationSuites: string[];
};

export type UserAccount = {
  id: string;
  email: string;
  name: string;
  models: ModelRecord[];
  datasets: DatasetRecord[];
};

type StoredAccount = {
  email: string;
  password: string;
  profile: UserAccount;
};

type AuthContextValue = {
  user: UserAccount | null;
  isReady: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  createModel: (input: Omit<ModelRecord, "id" | "status" | "createdAt" | "updatedAt">) => ModelRecord | null;
  createDataset: (input: Omit<DatasetRecord, "id" | "status" | "updatedAt"> & { status?: DatasetRecord["status"] }) => DatasetRecord | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function seedDemoAccount(): StoredAccount {
  const now = new Date();
  const demoModels: ModelRecord[] = [
    {
      id: makeId("model"),
      name: "Atlas QA Compliance Copilot",
      baseModel: "GPT-4.1 Enterprise",
      dataset: "Pharma Compliance QA v9",
      status: "Live",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      objective: "Resolve pharmacovigilance escalations with audit-ready narratives.",
      successCriteria: "≥97% rubric adherence across CAPA and deviation workflows.",
      guardrailsEnabled: true,
      dryRun: false,
      notes: "Deploys across QA and Regulatory Ops with jurisdiction-aware disclaimers.",
      evaluationSuites: ["Policy alignment harness", "Edge-case adversarial chat", "Live analyst blind review"]
    },
    {
      id: makeId("model"),
      name: "AeroWave Line Ops Specialist",
      baseModel: "Claude 3 Sonnet",
      dataset: "Aviation Maintenance Runbooks v4",
      status: "QA",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      objective: "Guide technicians through AOG playbooks and torque sequencing.",
      successCriteria: "Tool-call accuracy ≥92%, torque sequencing variance ≤3%.",
      guardrailsEnabled: true,
      dryRun: false,
      notes: "Bilingual instructions covering Airbus and Boeing fleets with certifier citations.",
      evaluationSuites: ["Tool-call regression", "Policy alignment harness"]
    }
  ];

  const demoDatasets: DatasetRecord[] = [
    {
      id: makeId("dataset"),
      name: "Pharma Compliance QA v9",
      focus: "CAPA closures, deviation narratives, SOP reconciliation",
      records: 2_400_000,
      status: "Delivered",
      updatedAt: now.toISOString()
    },
    {
      id: makeId("dataset"),
      name: "Aviation Maintenance Runbooks v4",
      focus: "AOG triage, torque specs, bilingual troubleshooting",
      records: 1_150_000,
      status: "Vetting",
      updatedAt: now.toISOString()
    }
  ];

  return {
    email: "demo@modelstation.ai",
    password: "modelstation",
    profile: {
      id: makeId("user"),
      email: "demo@modelstation.ai",
      name: "Demo Steward",
      models: demoModels,
      datasets: demoDatasets
    }
  };
}

function loadAccounts(): StoredAccount[] {
  if (typeof window === "undefined") {
    return [seedDemoAccount()];
  }

  const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!raw) {
    const demo = seedDemoAccount();
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([demo]));
    return [demo];
  }

  try {
    const parsed = JSON.parse(raw) as StoredAccount[];
    if (!parsed.some((account) => account.email === "demo@modelstation.ai")) {
      const demo = seedDemoAccount();
      const next = [...parsed, demo];
      window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    }
    return parsed;
  } catch {
    const demo = seedDemoAccount();
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([demo]));
    return [demo];
  }
}

function persistAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function persistSession(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ email }));
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loaded = loadAccounts();
    setAccounts(loaded);

    const rawSession = typeof window !== "undefined" ? window.localStorage.getItem(SESSION_STORAGE_KEY) : null;
    if (rawSession) {
      try {
        const { email } = JSON.parse(rawSession) as { email: string };
        const account = loaded.find((item) => item.email === email);
        if (account) {
          setUser(account.profile);
        }
      } catch {
        // ignore corrupted session
      }
    }

    setIsReady(true);
  }, []);

  const setAndPersistAccounts = useCallback((updater: (prev: StoredAccount[]) => StoredAccount[]) => {
    setAccounts((prev) => {
      const next = updater(prev);
      persistAccounts(next);
      return next;
    });
  }, []);

  const updateAccountProfile = useCallback(
    (email: string, updater: (profile: UserAccount) => UserAccount) => {
      setAndPersistAccounts((prev) =>
        prev.map((account) =>
          account.email === email
            ? {
                ...account,
                profile: updater(account.profile)
              }
            : account
        )
      );
    },
    [setAndPersistAccounts]
  );

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const normalisedEmail = email.trim().toLowerCase();
      const account = accounts.find((item) => item.email === normalisedEmail);
      await new Promise((resolve) => setTimeout(resolve, 250));

      if (!account) {
        throw new Error("No account found with that email address.");
      }

      if (account.password !== password) {
        throw new Error("Incorrect password. Please try again.");
      }

      setUser(account.profile);
      persistSession(account.email);
    },
    [accounts]
  );

  const register = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const normalisedEmail = email.trim().toLowerCase();
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (accounts.some((account) => account.email === normalisedEmail)) {
        throw new Error("An account with that email already exists.");
      }

      const profile: UserAccount = {
        id: makeId("user"),
        email: normalisedEmail,
        name: name.trim() || "New Steward",
        models: [],
        datasets: []
      };

      const nextAccount: StoredAccount = {
        email: normalisedEmail,
        password,
        profile
      };

      setAndPersistAccounts((prev) => [...prev, nextAccount]);
      setUser(profile);
      persistSession(normalisedEmail);
    },
    [accounts, setAndPersistAccounts]
  );

  const logout = useCallback(() => {
    setUser(null);
    persistSession(null);
  }, []);

  const createModel: AuthContextValue["createModel"] = useCallback(
    (input) => {
      if (!user) {
        return null;
      }

      const timestamp = new Date().toISOString();
      const model: ModelRecord = {
        id: makeId("model"),
        status: "Queued",
        createdAt: timestamp,
        updatedAt: timestamp,
        ...input
      };

      setUser((prev) =>
        prev
          ? {
              ...prev,
              models: [model, ...prev.models]
            }
          : prev
      );

      updateAccountProfile(user.email, (profile) => ({
        ...profile,
        models: [model, ...profile.models]
      }));

      return model;
    },
    [updateAccountProfile, user]
  );

  const createDataset: AuthContextValue["createDataset"] = useCallback(
    (input) => {
      if (!user) {
        return null;
      }

      const timestamp = new Date().toISOString();
      const dataset: DatasetRecord = {
        id: makeId("dataset"),
        status: input.status ?? "Scoping",
        updatedAt: timestamp,
        ...input
      };

      setUser((prev) =>
        prev
          ? {
              ...prev,
              datasets: [dataset, ...prev.datasets]
            }
          : prev
      );

      updateAccountProfile(user.email, (profile) => ({
        ...profile,
        datasets: [dataset, ...profile.datasets]
      }));

      return dataset;
    },
    [updateAccountProfile, user]
  );

  const memoisedValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      login,
      register,
      logout,
      createModel,
      createDataset
    }),
    [createDataset, createModel, isReady, login, logout, register, user]
  );

  return <AuthContext.Provider value={memoisedValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
