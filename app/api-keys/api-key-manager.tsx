"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Ban,
  Eye,
  EyeOff,
  Activity,
} from "lucide-react";
import { createApiKey, revokeApiKey, deleteApiKey } from "./actions";
import Link from "next/link";

type ApiKeyInfo = {
  id: string;
  name: string;
  keyPreview: string;
  plan: string;
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

export function ApiKeyManager({ keys }: { keys: ApiKeyInfo[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    if (!newKeyName.trim()) return;
    startTransition(async () => {
      const key = await createApiKey(newKeyName.trim());
      setNewKeyValue(key);
      setNewKeyName("");
    });
  }

  function handleCopy() {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleRevoke(keyId: string) {
    startTransition(() => revokeApiKey(keyId));
  }

  function handleDelete(keyId: string) {
    startTransition(() => deleteApiKey(keyId));
  }

  return (
    <div className="space-y-6">
      {/* New key banner */}
      {newKeyValue && (
        <div className="rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-950/20 p-4">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
            API Key Created — Copy it now! It won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white dark:bg-black rounded px-3 py-2 text-sm font-mono select-all border">
              {newKeyValue}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 text-xs"
            onClick={() => setNewKeyValue(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Create form */}
      {!showCreate ? (
        <Button
          variant="outline"
          onClick={() => setShowCreate(true)}
          disabled={keys.length >= 5}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create API Key
        </Button>
      ) : (
        <div className="rounded-lg border bg-card p-4 flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Key Name</label>
            <Input
              placeholder="e.g. My Pool Store App"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <Button onClick={handleCreate} disabled={pending || !newKeyName.trim()}>
            {pending ? "Creating…" : "Create"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setShowCreate(false);
              setNewKeyName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Key list */}
      {keys.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
          <Key className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No API keys yet</p>
          <p className="text-sm mt-1">
            Create your first API key to start using the REST API.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <ApiKeyCard
              key={k.id}
              apiKey={k}
              onRevoke={handleRevoke}
              onDelete={handleDelete}
              pending={pending}
            />
          ))}
        </div>
      )}

      {/* Plan info */}
      <div className="text-sm text-muted-foreground">
        <p>
          Need higher limits?{" "}
          <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
            View pricing plans →
          </Link>
        </p>
      </div>
    </div>
  );
}

function ApiKeyCard({
  apiKey: k,
  onRevoke,
  onDelete,
  pending,
}: {
  apiKey: ApiKeyInfo;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
  pending: boolean;
}) {
  const [showKey, setShowKey] = useState(false);

  const dailyPct = Math.round((k.dailyUsed / k.dailyLimit) * 100);
  const monthlyPct = Math.round((k.monthlyUsed / k.monthlyLimit) * 100);

  return (
    <div
      className={`rounded-lg border bg-card p-4 space-y-3 ${
        !k.isActive ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{k.name}</span>
          <Badge variant={k.isActive ? "default" : "secondary"} className="text-xs">
            {k.isActive ? k.plan : "REVOKED"}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {k.isActive && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRevoke(k.id)}
              disabled={pending}
              title="Revoke key"
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(k.id)}
            disabled={pending}
            title="Delete key"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Key preview */}
      <div className="flex items-center gap-2">
        <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1">
          {showKey ? k.keyPreview : "ppdb_live_••••••••••••••••"}
        </code>
        <button
          onClick={() => setShowKey(!showKey)}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Usage meters */}
      {k.isActive && (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" /> Daily
              </span>
              <span>
                {k.dailyUsed.toLocaleString()} / {k.dailyLimit.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dailyPct > 90 ? "bg-red-500" : dailyPct > 70 ? "bg-yellow-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(100, dailyPct)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" /> Monthly
              </span>
              <span>
                {k.monthlyUsed.toLocaleString()} / {k.monthlyLimit.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  monthlyPct > 90
                    ? "bg-red-500"
                    : monthlyPct > 70
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(100, monthlyPct)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>Created {new Date(k.createdAt).toLocaleDateString()}</span>
        {k.lastUsedAt && (
          <span>Last used {new Date(k.lastUsedAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
