import { supabase } from './supabaseClient';

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest'
}

export enum ResourceType {
  EVENT = 'event',
  PROFILE = 'profile',
  SETTINGS = 'settings'
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

type Permission = {
  resource: ResourceType;
  actions: Action[];
};

type RolePermissions = {
  [key in UserRole]: Permission[];
};

export const permissions: RolePermissions = {
  [UserRole.ADMIN]: [
    { resource: ResourceType.EVENT, actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: ResourceType.PROFILE, actions: [Action.READ, Action.UPDATE, Action.DELETE] },
    { resource: ResourceType.SETTINGS, actions: [Action.READ, Action.UPDATE] }
  ],
  [UserRole.MODERATOR]: [
    { resource: ResourceType.EVENT, actions: [Action.CREATE, Action.READ, Action.UPDATE] },
    { resource: ResourceType.PROFILE, actions: [Action.READ, Action.UPDATE] }
  ],
  [UserRole.USER]: [
    { resource: ResourceType.EVENT, actions: [Action.READ] },
    { resource: ResourceType.PROFILE, actions: [Action.READ, Action.UPDATE] }
  ],
  [UserRole.GUEST]: [
    { resource: ResourceType.EVENT, actions: [Action.READ] }
  ]
};

export function hasPermission(role: UserRole, resource: ResourceType, action: Action): boolean {
  return permissions[role].some(
    (permission) => permission.resource === resource && permission.actions.includes(action)
  );
}

export async function requireAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('Not authenticated');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== UserRole.ADMIN) {
    throw new Error('Admin access required');
  }
}