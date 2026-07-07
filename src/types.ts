export type Role = 'Owner' | 'Admin' | 'Editor' | 'Viewer';

export type Profile = {
  name: string;
  email: string;
  role: Role;
  workspaceName: string;
  timezone: string;
  bio: string;
};

export type MemberStatus = 'active' | 'pending';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  joinedAt?: string;
  invitedAt?: string;
};

export type UpdateMemberProfileInput = {
  name: string;
  email: string;
  role: Role;
};

export type Integration = {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  lastSync?: string;
};
