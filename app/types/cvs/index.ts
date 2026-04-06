import type {
  GetAllCvsQuery,
  GetCvQuery,
  GetUserCvsQuery,
} from '~~/graphql/generated/graphql';

export type CvItem = GetAllCvsQuery['cvs'][number];
export type UserCvItem = NonNullable<
  NonNullable<GetUserCvsQuery['user']>['cvs']
>[number];
export type CvProjectItem = NonNullable<
  NonNullable<GetCvQuery['cv']>['projects']
>[number];

export interface CvProjectEditData {
  projectId: string;
  start_date: string;
  end_date?: string | null;
  roles: string[];
  responsibilities: string[];
}

export interface CvProjectFormData {
  projectId: string;
  start_date: string;
  end_date?: string;
  roles: string[];
  responsibilities: string[];
}

export interface UserCvEditData {
  id: string;
  name: string;
  description: string;
}

export interface UserCvFormData {
  id?: string;
  name: string;
  description: string;
}
