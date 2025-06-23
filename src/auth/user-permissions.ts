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
export const coupon = ['create', 'update', 'delete', 'list', 'detail'] as const;

export const favouriteCoupon = [
  'create',
  'delete',
  'list',
  'detail',
] as const;

export const bin = ['create', 'update', 'delete', 'list', 'detail'] as const;

export const redeemHistory = ['create', 'list', 'detail'] as const;
export const recycleHistory = ['create', 'list', 'detail'] as const;

export const statement = {
  user: adminDefaults.user,
  session: adminDefaults.session,
  organization: [...organizationDefaults.organization, 'list'],
  member: [...organizationDefaults.member, 'list'],
  invitation: [...organizationDefaults.invitation, 'list'],
  team: [...organizationDefaults.team, 'list'],
  store: [...store],
  rewardRule,
  material,
  coupon,
  bin,
  favouriteCoupon,
  redeemHistory,
  recycleHistory,
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  user: [...statement.user],
  session: [...statement.session],
  organization: [...statement.organization],
  member: [...statement.member],
  invitation: [...statement.invitation],
  team: [...statement.team],
  store: [...statement.store],
  rewardRule: [...statement.rewardRule],
  material: [...statement.material],
  coupon: [...statement.coupon],
  bin: [...statement.bin],
  favouriteCoupon: [...statement.favouriteCoupon],
  redeemHistory: [...statement.redeemHistory],
  recycleHistory: [...statement.recycleHistory],
});

export const user = ac.newRole({
  store: ['list', 'detail'],
  rewardRule: [],
  material: ['list', 'detail'],
  bin: ['list', 'detail'],
  coupon: ['list', 'detail'],
  favouriteCoupon: [...statement.favouriteCoupon],
  redeemHistory: [...statement.redeemHistory],
  recycleHistory: [...statement.recycleHistory],
});


export type TRole = 'admin' | 'user';

export const roles = {
  admin,
  user,
};
