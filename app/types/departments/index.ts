import type { GetDepartmentsQuery } from '~~/graphql/generated/graphql';

export type DepartmentItem = GetDepartmentsQuery['departments'][number];

export interface DepartmentEditData {
  id: string;
  name: string;
}

export interface DepartmentFormData {
  id?: string;
  name: string;
}
