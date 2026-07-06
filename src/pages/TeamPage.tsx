import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MailPlus, RefreshCw, Trash2, UserMinus } from 'lucide-react';
import { api } from '../lib/mockApi';
import { formatDate, initials } from '../lib/format';
import type { Role, TeamMember } from '../types';
import { Badge, Button, Field, Panel, Skeleton, inputClass } from '../components/ui';
import { Toast } from '../components/Toast';

const roles: Role[] = ['Admin', 'Editor', 'Viewer'];

export function TeamPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Editor');
  const [formError, setFormError] = useState('');
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: api.getMembers,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['members'] });

  const invite = useMutation({
    mutationFn: api.inviteMember,
    onSuccess: () => {
      setEmail('');
      setRole('Editor');
      setToast('Invitation sent.');
      invalidate();
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, nextRole }: { id: string; nextRole: Role }) =>
      api.updateMemberRole(id, nextRole),
    onSuccess: () => {
      setToast('Role updated.');
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: api.removeMember,
    onSuccess: () => {
      setToast('Team member removed.');
      invalidate();
    },
  });

  const resend = useMutation({
    mutationFn: api.resendInvite,
    onSuccess: () => {
      setToast('Invitation resent.');
      invalidate();
    },
  });

  const activeCount = useMemo(
    () => data.filter((member) => member.status === 'active').length,
    [data],
  );
  const pendingCount = data.length - activeCount;

  const submitInvite = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError('Enter a valid work email.');
      return;
    }
    if (data.some((member) => member.email.toLowerCase() === email.toLowerCase())) {
      setFormError('That person is already on the team or has a pending invite.');
      return;
    }
    invite.mutate({ email, role });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-stone-500">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Team members</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          Manage access, send invitations, and keep roles aligned with how your team works.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-stone-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">People</h2>
              <p className="mt-1 text-sm text-stone-500">
                {activeCount} active, {pendingCount} pending
              </p>
            </div>
            <Button variant="secondary" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5 sm:p-6">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-20" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-6">
              <h3 className="font-semibold">Team data could not load</h3>
              <p className="mt-2 text-sm text-stone-600">Try refreshing the mock service.</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="font-semibold">No members yet</h3>
              <p className="mt-2 text-sm text-stone-600">
                Invite your first teammate to start building the workspace.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {data.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onRoleChange={(nextRole) =>
                    updateRole.mutate({ id: member.id, nextRole })
                  }
                  onRemove={() => remove.mutate(member.id)}
                  onResend={() => resend.mutate(member.id)}
                  busy={
                    updateRole.isPending ||
                    remove.variables === member.id ||
                    resend.variables === member.id
                  }
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel className="self-start p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Invite teammate</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            New invitations stay pending until accepted.
          </p>
          <form className="mt-5 space-y-4" onSubmit={submitInvite}>
            <Field label="Email" error={formError}>
              <input
                className={inputClass}
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="Role">
              <select
                className={inputClass}
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
              >
                {roles.map((roleOption) => (
                  <option key={roleOption}>{roleOption}</option>
                ))}
              </select>
            </Field>
            {invite.isError ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {(invite.error as Error).message}
              </p>
            ) : null}
            <Button className="w-full" disabled={invite.isPending}>
              <MailPlus className="h-4 w-4" />
              {invite.isPending ? 'Sending...' : 'Send invite'}
            </Button>
          </form>
        </Panel>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function MemberRow({
  member,
  busy,
  onRoleChange,
  onRemove,
  onResend,
}: {
  member: TeamMember;
  busy: boolean;
  onRoleChange: (role: Role) => void;
  onRemove: () => void;
  onResend: () => void;
}) {
  const isOwner = member.role === 'Owner';
  const isPending = member.status === 'pending';

  return (
    <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-sm font-semibold text-stone-700">
          {isPending ? 'PI' : initials(member.name)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-medium">{member.name}</h3>
            <Badge tone={isPending ? 'amber' : 'green'}>
              {isPending ? 'Pending' : 'Active'}
            </Badge>
          </div>
          <p className="mt-1 truncate text-sm text-stone-600">{member.email}</p>
          <p className="mt-1 text-xs text-stone-500">
            {isPending
              ? `Invited ${formatDate(member.invitedAt)}`
              : `Joined ${formatDate(member.joinedAt)}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <select
          className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm disabled:bg-stone-50"
          value={member.role}
          disabled={isOwner || busy}
          onChange={(event) => onRoleChange(event.target.value as Role)}
        >
          {['Owner', 'Admin', 'Editor', 'Viewer'].map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
        {isPending ? (
          <Button variant="secondary" disabled={busy} onClick={onResend}>
            <RefreshCw className="h-4 w-4" />
            Resend
          </Button>
        ) : null}
        <Button variant={isPending ? 'danger' : 'ghost'} disabled={isOwner || busy} onClick={onRemove}>
          {isPending ? <Trash2 className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
          {isPending ? 'Revoke' : 'Remove'}
        </Button>
      </div>
    </div>
  );
}
