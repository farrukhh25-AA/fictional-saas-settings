import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MailPlus, Pencil, RefreshCw, Save, Trash2, UserMinus, X } from 'lucide-react';
import { api } from '../lib/mockApi';
import { formatDate, initials } from '../lib/format';
import type { Role, TeamMember, UpdateMemberProfileInput } from '../types';
import { Badge, Button, Field, Panel, Skeleton, inputClass } from '../components/ui';
import { Toast } from '../components/Toast';

const roles: Role[] = ['Admin', 'Editor', 'Viewer'];
const memberRoles: Role[] = ['Owner', 'Admin', 'Editor', 'Viewer'];

const validateMemberProfile = (
  values: UpdateMemberProfileInput,
  member: TeamMember,
  members: TeamMember[],
) => {
  const errors: Partial<Record<keyof UpdateMemberProfileInput, string>> = {};
  if (!values.name.trim()) {
    errors.name = 'Enter a name.';
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter a valid email.';
  }
  if (
    members.some(
      (candidate) =>
        candidate.id !== member.id &&
        candidate.email.toLowerCase() === values.email.toLowerCase(),
    )
  ) {
    errors.email = 'That email already belongs to this team.';
  }
  return errors;
};

export function TeamPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Editor');
  const [formError, setFormError] = useState('');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const { data = [], isLoading, isFetching, isError, refetch } = useQuery({
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

  const updateProfile = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateMemberProfileInput }) =>
      api.updateMemberProfile(id, values),
    onSuccess: () => {
      setEditingMember(null);
      setToast('Member profile updated.');
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
        <p className="text-sm font-medium text-[#64748b]">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Team members</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
          Manage access, send invitations, and keep roles aligned with how your team works.
        </p>
      </div>

      <div className="grid gap-4">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[#e4e9ef] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">People</h2>
              <p className="mt-1 text-sm text-[#64748b]">
                {activeCount} active, {pendingCount} pending
              </p>
            </div>
            <Button variant="secondary" onClick={() => refetch()} disabled={isLoading || isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
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
              <p className="mt-2 text-sm text-[#475569]">Try refreshing the mock service.</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="font-semibold">No members yet</h3>
              <p className="mt-2 text-sm text-[#475569]">
                Invite your first teammate to start building the workspace.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e4e9ef]">
              {data.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onRoleChange={(nextRole) =>
                    updateRole.mutate({ id: member.id, nextRole })
                  }
                  onRemove={() => remove.mutate(member.id)}
                  onResend={() => resend.mutate(member.id)}
                  onEdit={() => {
                    updateProfile.reset();
                    setEditingMember(member);
                  }}
                  busy={
                    updateRole.isPending ||
                    (updateProfile.isPending && updateProfile.variables?.id === member.id) ||
                    remove.variables === member.id ||
                    resend.variables === member.id
                  }
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel className="w-full max-w-md self-start p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Invite teammate</h2>
          <p className="mt-2 text-sm leading-6 text-[#475569]">
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
              <p className="rounded-lg bg-[#fff1ee] px-3 py-2 text-sm text-[#c94d38]">
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

      {editingMember ? (
        <EditMemberModal
          member={editingMember}
          members={data}
          isSaving={updateProfile.isPending}
          error={updateProfile.error as Error | null}
          onClose={() => {
            if (!updateProfile.isPending) setEditingMember(null);
          }}
          onSubmit={(values) =>
            updateProfile.mutate({ id: editingMember.id, values })
          }
        />
      ) : null}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function EditMemberModal({
  member,
  members,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  member: TeamMember;
  members: TeamMember[];
  isSaving: boolean;
  error: Error | null;
  onClose: () => void;
  onSubmit: (values: UpdateMemberProfileInput) => void;
}) {
  const [values, setValues] = useState<UpdateMemberProfileInput>({
    name: member.name,
    email: member.email,
    role: member.role,
  });
  const isPending = member.status === 'pending';
  const isOwner = member.role === 'Owner';
  const normalizedValues = {
    ...values,
    name: values.name.trim(),
    email: values.email.trim(),
    role: isOwner ? 'Owner' : values.role,
  };
  const errors = validateMemberProfile(normalizedValues, member, members);
  const isDirty =
    normalizedValues.name !== member.name ||
    normalizedValues.email !== member.email ||
    normalizedValues.role !== member.role;
  const canSave = isDirty && Object.keys(errors).length === 0 && !isSaving;

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-[#172033]/30 px-4 py-6 backdrop-blur sm:items-center sm:justify-center">
      <Panel className="w-full max-w-lg overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-[#e4e9ef] p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium text-[#64748b]">Team member</p>
            <h2 className="mt-1 text-xl font-semibold">Edit profile</h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Update identity and access details for this workspace member.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-[#64748b] transition hover:bg-[#fff1ee] hover:text-[#c94d38]"
            aria-label="Close edit profile"
            disabled={isSaving}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-5 p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSave) onSubmit(normalizedValues);
          }}
        >
          <Field label="Name" error={errors.name}>
            <input
              className={inputClass}
              value={values.name}
              disabled={isSaving}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
            />
            {isPending ? (
              <p className="mt-2 text-xs text-[#64748b]">
                This name appears in the members list while the invite is pending.
              </p>
            ) : null}
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              className={inputClass}
              value={values.email}
              disabled={isSaving}
              onChange={(event) => setValues({ ...values, email: event.target.value })}
            />
          </Field>

          <Field label="Role">
            <select
              className={inputClass}
              value={values.role}
              disabled={isOwner || isSaving}
              onChange={(event) =>
                setValues({ ...values, role: event.target.value as Role })
              }
            >
              {memberRoles.map((roleOption) => (
                <option key={roleOption}>{roleOption}</option>
              ))}
            </select>
            {isOwner ? (
              <p className="mt-2 text-xs text-[#64748b]">
                Workspace owners keep the Owner role.
              </p>
            ) : null}
          </Field>

          {error ? (
            <p className="rounded-lg bg-[#fff1ee] px-4 py-3 text-sm text-[#c94d38]">
              {error.message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={!isDirty || isSaving}
              onClick={() =>
                setValues({
                  name: member.name,
                  email: member.email,
                  role: member.role,
                })
              }
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" disabled={isSaving} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSave}>
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </div>
        </form>
      </Panel>
    </div>
  );
}

function MemberRow({
  member,
  busy,
  onRoleChange,
  onRemove,
  onResend,
  onEdit,
}: {
  member: TeamMember;
  busy: boolean;
  onRoleChange: (role: Role) => void;
  onRemove: () => void;
  onResend: () => void;
  onEdit: () => void;
}) {
  const isOwner = member.role === 'Owner';
  const isPending = member.status === 'pending';

  return (
    <div className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#fff1ee] text-sm font-semibold text-[#c94d38]">
          {initials(member.name)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-medium">{member.name}</h3>
            <Badge tone={isPending ? 'amber' : 'green'}>
              {isPending ? 'Pending' : 'Active'}
            </Badge>
          </div>
          <p className="mt-1 truncate text-sm text-[#475569]">{member.email}</p>
          <p className="mt-1 text-xs text-[#64748b]">
            {isPending
              ? `Invited ${formatDate(member.invitedAt)}`
              : `Joined ${formatDate(member.joinedAt)}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
        <select
          className="min-h-10 rounded-lg border border-[#e4e9ef] bg-white px-3 text-sm disabled:bg-[#fafaf8]"
          value={member.role}
          disabled={isOwner || busy}
          onChange={(event) => onRoleChange(event.target.value as Role)}
        >
          {['Owner', 'Admin', 'Editor', 'Viewer'].map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
        <Button variant="secondary" disabled={busy} onClick={onEdit}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
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
