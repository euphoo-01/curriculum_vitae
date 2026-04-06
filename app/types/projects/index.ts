import type { GetProjectsQuery } from '~~/graphql/generated/graphql';

export type ProjectItem = GetProjectsQuery['projects'][number];

export interface ProjectEditData {
  id: string;
  name: string;
  internal_name: string;
  domain: string;
  start_date: string;
  end_date?: string | null;
  description: string;
  environment: string[];
}

export interface ProjectFormData {
  id?: string;
  name: string;
  internal_name: string;
  domain: string;
  start_date: string;
  end_date?: string;
  description: string;
  environment: string[];
}
