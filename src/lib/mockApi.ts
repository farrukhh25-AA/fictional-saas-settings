import type {
  Integration,
  Profile,
  Role,
  TeamMember,
  UpdateMemberProfileInput,
} from '../types';

const delay = (ms = 650) => new Promise((resolve) => window.setTimeout(resolve, ms));

const nameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Invited teammate';

let profile: Profile = {
  name: 'Maya Chen',
  email: 'maya@northstar.ai',
  role: 'Owner',
  workspaceName: 'Northstar Learning',
  timezone: 'America/New_York',
  bio: 'Building a thoughtful internal knowledge system for product, support, and customer learning.',
};

let members: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Maya Chen',
    email: 'maya@northstar.ai',
    role: 'Owner',
    status: 'active',
    joinedAt: '2025-10-14',
  },
  {
    id: 'mem-2',
    name: 'Theo Grant',
    email: 'theo@northstar.ai',
    role: 'Admin',
    status: 'active',
    joinedAt: '2025-11-02',
  },
  {
    id: 'mem-3',
    name: 'Ari Patel',
    email: 'ari@northstar.ai',
    role: 'Editor',
    status: 'active',
    joinedAt: '2026-01-18',
  },
  {
    id: 'inv-1',
    name: 'Lena Ortiz',
    email: 'lena@northstar.ai',
    role: 'Viewer',
    status: 'pending',
    invitedAt: '2026-07-01',
  },
];

let integrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send knowledge digests, unanswered question alerts, and team updates.',
    category: 'Communication',
    connected: true,
    lastSync: '2026-07-06T08:24:00.000Z',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Index docs, briefs, and shared folders into workspace memory.',
    category: 'Files',
    connected: true,
    lastSync: '2026-07-05T18:10:00.000Z',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync pages and databases that hold team process and product notes.',
    category: 'Knowledge',
    connected: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link code discussions, release notes, and engineering decisions.',
    category: 'Engineering',
    connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Trigger lightweight automations from saved answers and workspace events.',
    category: 'Automation',
    connected: false,
  },
];

const maybeFail = () => {
  if (Math.random() < 0.03) {
    throw new Error('The mock service had a moment. Please try again.');
  }
};

export const api = {
  async getProfile() {
    await delay();
    return { ...profile };
  },

  async updateProfile(nextProfile: Profile) {
    await delay(800);
    maybeFail();
    profile = { ...nextProfile };
    return { ...profile };
  },

  async getMembers() {
    await delay();
    return members.map((member) => ({ ...member }));
  },

  async inviteMember(input: { email: string; role: Role }) {
    await delay(700);
    maybeFail();
    const invitation: TeamMember = {
      id: `inv-${Date.now()}`,
      name: nameFromEmail(input.email),
      email: input.email,
      role: input.role,
      status: 'pending',
      invitedAt: new Date().toISOString(),
    };
    members = [invitation, ...members];
    return { ...invitation };
  },

  async updateMemberRole(id: string, role: Role) {
    await delay(550);
    maybeFail();
    members = members.map((member) =>
      member.id === id ? { ...member, role } : member,
    );
    return members.find((member) => member.id === id);
  },

  async updateMemberProfile(id: string, input: UpdateMemberProfileInput) {
    await delay(750);
    maybeFail();
    members = members.map((member) => {
      if (member.id !== id) return member;
      return {
        ...member,
        email: input.email,
        name: input.name,
        role: member.role === 'Owner' ? 'Owner' : input.role,
      };
    });
    return members.find((member) => member.id === id);
  },

  async removeMember(id: string) {
    await delay(550);
    maybeFail();
    members = members.filter((member) => member.id !== id);
    return { id };
  },

  async resendInvite(id: string) {
    await delay(500);
    maybeFail();
    members = members.map((member) =>
      member.id === id ? { ...member, invitedAt: new Date().toISOString() } : member,
    );
    return members.find((member) => member.id === id);
  },

  async getIntegrations() {
    await delay();
    return integrations.map((integration) => ({ ...integration }));
  },

  async setIntegrationConnection(id: string, connected: boolean) {
    await delay(850);
    maybeFail();
    integrations = integrations.map((integration) =>
      integration.id === id
        ? {
            ...integration,
            connected,
            lastSync: connected ? new Date().toISOString() : undefined,
          }
        : integration,
    );
    return integrations.find((integration) => integration.id === id);
  },
};
