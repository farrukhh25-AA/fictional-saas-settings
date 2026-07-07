import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Github, PlugZap, RefreshCw, Slack, Unplug } from 'lucide-react';
import { api } from '../lib/mockApi';
import { formatSyncTime } from '../lib/format';
import type { Integration } from '../types';
import { Badge, Button, Panel, Skeleton } from '../components/ui';
import { Toast } from '../components/Toast';

const icons: Record<string, typeof Slack> = {
  slack: Slack,
  'google-drive': PlugZap,
  notion: PlugZap,
  github: Github,
  zapier: PlugZap,
};

export function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['integrations'],
    queryFn: api.getIntegrations,
  });

  const connection = useMutation({
    mutationFn: ({ id, connected }: { id: string; connected: boolean }) =>
      api.setIntegrationConnection(id, connected),
    onSuccess: (integration) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setToast(`${integration?.name ?? 'Integration'} updated.`);
    },
  });

  const connectedCount = data.filter((integration) => integration.connected).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#64748b]">Settings</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Integrations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            Connect the tools your team already uses so knowledge can stay current.
          </p>
        </div>
        <Badge tone="blue">{connectedCount} connected</Badge>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-44" />
          ))}
        </div>
      ) : isError ? (
        <Panel className="p-6">
          <h2 className="font-semibold">Integrations could not load</h2>
          <p className="mt-2 text-sm text-[#475569]">Refresh the mock data and try again.</p>
          <Button className="mt-5" onClick={() => refetch()}>
            Retry
          </Button>
        </Panel>
      ) : data.length === 0 ? (
        <Panel className="p-8 text-center">
          <h2 className="font-semibold">No integrations available</h2>
          <p className="mt-2 text-sm text-[#475569]">Available connections will appear here.</p>
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              busy={connection.variables?.id === integration.id && connection.isPending}
              onToggle={() =>
                connection.mutate({
                  id: integration.id,
                  connected: !integration.connected,
                })
              }
            />
          ))}
        </div>
      )}

      {connection.isError ? (
        <p className="rounded-lg bg-[#fff1ee] px-4 py-3 text-sm text-[#c94d38]">
          {(connection.error as Error).message}
        </p>
      ) : null}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function IntegrationCard({
  integration,
  busy,
  onToggle,
}: {
  integration: Integration;
  busy: boolean;
  onToggle: () => void;
}) {
  const Icon = icons[integration.id] ?? PlugZap;

  return (
    <Panel className="flex min-h-44 flex-col justify-between p-5 sm:p-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fff1ee] text-[#c94d38]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">{integration.name}</h2>
              <p className="text-xs text-[#64748b]">{integration.category}</p>
            </div>
          </div>
          <Badge tone={integration.connected ? 'green' : 'neutral'}>
            {integration.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#475569]">{integration.description}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#64748b]">Last sync: {formatSyncTime(integration.lastSync)}</p>
        <Button
          variant={integration.connected ? 'secondary' : 'primary'}
          disabled={busy}
          onClick={onToggle}
        >
          {busy ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : integration.connected ? (
            <Unplug className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {busy ? 'Updating...' : integration.connected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
    </Panel>
  );
}
