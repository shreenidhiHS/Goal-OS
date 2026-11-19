import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { AiModelInfo, AiProvider, AppSettings } from '@shared/ipc/types';
import { getElectronAPI, isElectronAvailable } from '@app/lib/ipc';
import { Button } from '@app/components/ui/Button';
import { Input } from '@app/components/ui/Input';
import { Label } from '@app/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/Card';
import { Separator } from '@app/components/ui/Separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/Select';

interface AiSettingsCardProps {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

export function AiSettingsCard({ settings, updateSettings }: AiSettingsCardProps) {
  const [models, setModels] = useState<AiModelInfo[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const refreshModels = useCallback(async () => {
    if (!isElectronAvailable() || settings.aiProvider !== 'ollama') {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    setModelsError(null);
    try {
      const next = await getElectronAPI().ai.listModels();
      setModels(next);
      if (
        settings.aiOllamaModel &&
        next.length > 0 &&
        !next.some((m) => m.name === settings.aiOllamaModel)
      ) {
        await updateSettings({ aiOllamaModel: next[0]!.name });
      }
    } catch (err) {
      setModels([]);
      setModelsError((err as Error).message || 'Could not reach Ollama');
    } finally {
      setLoadingModels(false);
    }
  }, [settings.aiProvider, settings.aiOllamaModel, updateSettings]);

  useEffect(() => {
    if (settings.aiProvider === 'ollama') {
      void refreshModels();
    } else {
      setModels([]);
      setModelsError(null);
    }
    // Refresh when provider/port changes; refreshModels already closes over model.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.aiProvider, settings.aiOllamaPort]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI</CardTitle>
        <CardDescription>
          Local LLM provider for the goals &amp; tasks agent. Runs on your machine via Ollama.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Label className="text-sm font-medium">Provider</Label>
          <Select
            value={settings.aiProvider}
            onValueChange={(v) => void updateSettings({ aiProvider: v as AiProvider })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="ollama">Ollama</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {settings.aiProvider === 'ollama' && (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="ai-ollama-port" className="text-sm font-medium">
                Port
              </Label>
              <Input
                id="ai-ollama-port"
                type="number"
                min={1}
                max={65535}
                value={settings.aiOllamaPort}
                onChange={(e) =>
                  void updateSettings({ aiOllamaPort: Number(e.target.value) || 11434 })
                }
                className="w-28"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium">Model</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={settings.aiOllamaModel || undefined}
                    onValueChange={(v) => void updateSettings({ aiOllamaModel: v })}
                    disabled={models.length === 0}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue placeholder={loadingModels ? 'Loading…' : 'Select model'} />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m.name} value={m.name}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => void refreshModels()}
                    disabled={loadingModels}
                    aria-label="Refresh models"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingModels ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              {modelsError && <p className="text-xs text-[var(--danger)]">{modelsError}</p>}
              {!modelsError && !loadingModels && models.length === 0 && (
                <p className="text-xs text-[var(--text-muted)]">
                  No models found. Start Ollama and pull a model, then refresh.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
