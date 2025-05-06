import { defaultStatements as adminDefaults } from 'better-auth/plugins/admin/access';
import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements as organizationDefaults } from 'better-auth/plugins/organization/access';

export const rewardRule = [
  'create',
  'update',
  'delete',
  'list',
  'detail',
] as const;

export const store = ['create', 'update', 'delete', 'list', 'detail'] as const;

export const material = [
  'create',
  'update',
  'delete',
  'list',
  'detail',
] as const;

export const bin = ['create', 'update', 'delete', 'list', 'detail'] as const;

export const statement = {
  user: adminDefaults.user,
  session: adminDefaults.session,
  organization: [...organizationDefaults.organization, 'list'],
  member: [...organizationDefaults.member, 'list'],
  invitation: [...organizationDefaults.invitation, 'list'],
  team: [...organizationDefaults.team, 'list'],
  store,
  rewardRule,
  material,
  bin,
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  user: [...statement.user],
  session: [...statement.session],
  store: [...statement.store],
  rewardRule: [...statement.rewardRule],
  material: [...statement.material],
  bin: [...statement.bin],
});

export const user = ac.newRole({
  store: [],
  rewardRule: [],
  material: [],
  bin: [],
});
