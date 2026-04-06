import type { GetSkillsQuery } from '~~/graphql/generated/graphql';

export type SkillItem = GetSkillsQuery['skills'][number];

export interface SkillEditData {
  id: string;
  name: string;
  categoryId?: string | null;
}

export interface SkillFormData {
  id?: string;
  name: string;
  categoryId?: string;
}
