import type { UsersQuery } from '~~/graphql/generated/graphql';

export const enum AdminActionsNames {
  'SEE' = 'see',
  'DELETE' = 'delete',
}

export type AdminAction = {
  name: string;
  type: AdminActionsNames;
  action: (id: string) => unknown;
};

export type UserItem = UsersQuery['users'][number];

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  departmentId: string | null;
  positionId: string | null;
}
