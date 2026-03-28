export const enum AdminActionsNames {
  'SEE' = 'see',
  'DELETE' = 'delete',
}
export type AdminAction = {
  name: string;
  type: AdminActionsNames;
  action: (id: string) => unknown;
};
