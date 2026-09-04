"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, Copy, Key } from "lucide-react"
import { generateApiKey, deleteApiKey } from "@/actions/apikeys"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface ApiKeyInfo {
  id: string
  label: string
  createdAt: string
}

interface Props {
  initial: ApiKeyInfo[]
}

export default function ApiKeyManager({ initial }: Props) {
  const [keys, setKeys] = useState(initial)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const existing = keys[0] ?? null

  async function handleGenerate() {
    setLoading(true)
    try {
      const key = await generateApiKey()
      setNewKey(key)
    } catch {
      toast.error("Failed to generate key")
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this API key? MCP connections using it will stop working.")) return
    try {
      await deleteApiKey(id)
      setKeys([])
      toast.success("API key revoked")
    } catch {
      toast.error("Failed to revoke key")
    }
  }

  function handleCopy() {
    if (!newKey) return
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setNewKey(null)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">MCP API Key</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Connects MCP hosts (Claude, ChatGPT) to your MoneyMani data
          </p>
        </div>
        <Button
          size="sm"
          variant={existing ? "outline" : "default"}
          onClick={handleGenerate}
          disabled={loading}
        >
          {existing ? "Regenerate" : "Generate Key"}
        </Button>
      </div>

      {existing ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex items-center gap-3 px-4 py-3">
            <Key className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{existing.label}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Created{" "}
                {new Date(existing.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRevoke(existing.id)}
              className="h-8 text-xs text-[hsl(var(--destructive))]"
            >
              Revoke
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[hsl(var(--muted-foreground))] py-4 text-center">
          No API key generated yet
        </p>
      )}

      <Dialog open={!!newKey} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your MCP API Key</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Copy this key now — it won&apos;t be shown again. Set it as{" "}
            <code className="text-xs bg-[hsl(var(--muted))] px-1 py-0.5 rounded">
              MONEYMANI_API_KEY
            </code>{" "}
            in your MCP host config.
          </p>
          <div className="flex gap-2 mt-1">
            <code className="flex-1 text-xs bg-[hsl(var(--muted))] px-3 py-2 rounded-lg break-all leading-relaxed">
              {newKey}
            </code>
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0 h-auto">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Separator />
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Regenerating creates a new key and immediately revokes the old one.
      </p>
    </div>
  )
}
