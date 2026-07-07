import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Save, UserRound } from 'lucide-react';
import { api } from '../lib/mockApi';
import { initials } from '../lib/format';
import type { Profile } from '../types';
import { Button, Field, Panel, Skeleton, inputClass } from '../components/ui';
import { Toast } from '../components/Toast';

const timezones = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Karachi',
  'Asia/Singapore',
];

const roles = ['Owner', 'Admin', 'Editor', 'Viewer'] as const;

const validate = (values: Profile) => {
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (!values.name.trim()) errors.name = 'Enter a name.';
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email.';
  if (!values.workspaceName.trim()) errors.workspaceName = 'Enter a workspace name.';
  if (values.bio.length > 180) errors.bio = 'Keep the bio under 180 characters.';
  return errors;
};

export function ProfilePage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<Profile | null>(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
  });

  const mutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      setDraft(null);
      setToast('Profile changes saved.');
    },
  });

  const values = draft ?? data;
  const errors = values ? validate(values) : {};
  const isDirty = Boolean(draft && data && JSON.stringify(draft) !== JSON.stringify(data));
  const canSave = isDirty && Object.keys(errors).length === 0 && !mutation.isPending;

  const profileInitials = useMemo(() => initials(values?.name ?? 'User'), [values?.name]);

  if (isLoading || !values) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56" />
        <Panel className="p-6">
          <Skeleton className="h-24 w-full" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </Panel>
      </div>
    );
  }

  if (isError) {
    return (
      <Panel className="p-6">
        <h1 className="text-2xl font-semibold">Profile could not load</h1>
        <p className="mt-2 text-sm text-[#475569]">Refresh the mock data and try again.</p>
        <Button className="mt-5" onClick={() => refetch()}>
          Retry
        </Button>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#64748b]">Settings</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Profile and workspace</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            Keep your personal details and workspace identity current for teammates.
          </p>
        </div>
        {isDirty ? (
          <span className="rounded-full bg-[#fff1ee] px-3 py-1 text-xs font-medium text-[#c94d38]">
            Unsaved changes
          </span>
        ) : null}
      </div>

      <Panel>
        <div className="border-b border-[#e4e9ef] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[#f2644b] text-xl font-semibold text-white shadow-sm shadow-[#f2644b]/25">
              {profileInitials || <UserRound className="h-8 w-8" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{values.name}</h2>
              <p className="mt-1 text-sm text-[#475569]">{values.email}</p>
              <p className="mt-2 text-sm text-[#64748b]">
                Avatar uses initials in this mock build.
              </p>
            </div>
          </div>
        </div>

        <form
          className="space-y-6 p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSave) mutation.mutate(values);
          }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name" error={errors.name}>
              <input
                className={inputClass}
                value={values.name}
                onChange={(event) => setDraft({ ...values, name: event.target.value })}
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                className={inputClass}
                value={values.email}
                onChange={(event) => setDraft({ ...values, email: event.target.value })}
              />
            </Field>
            <Field label="Workspace name" error={errors.workspaceName}>
              <input
                className={inputClass}
                value={values.workspaceName}
                onChange={(event) =>
                  setDraft({ ...values, workspaceName: event.target.value })
                }
              />
            </Field>
            <Field label="Role">
              <select
                className={inputClass}
                value={values.role}
                onChange={(event) =>
                  setDraft({ ...values, role: event.target.value as Profile['role'] })
                }
              >
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </Field>
            <Field label="Timezone">
              <select
                className={inputClass}
                value={values.timezone}
                onChange={(event) => setDraft({ ...values, timezone: event.target.value })}
              >
                {timezones.map((timezone) => (
                  <option key={timezone}>{timezone}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Bio" error={errors.bio}>
            <textarea
              className={`${inputClass} min-h-28 resize-none`}
              value={values.bio}
              onChange={(event) => setDraft({ ...values, bio: event.target.value })}
            />
          </Field>
          {mutation.isError ? (
            <p className="rounded-lg bg-[#fff1ee] px-4 py-3 text-sm text-[#c94d38]">
              {(mutation.error as Error).message}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={!isDirty || mutation.isPending}
              onClick={() => {
                setDraft(null);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button type="submit" disabled={!canSave}>
              <Save className="h-4 w-4" />
              {mutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Panel>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
