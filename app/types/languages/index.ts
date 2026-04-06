import type { GetLanguagesQuery } from '~~/graphql/generated/graphql';

export type LanguageItem = GetLanguagesQuery['languages'][number];

export interface LanguageEditData {
  id: string;
  name: string;
  native_name?: string | null;
  iso2: string;
}

export interface LanguageFormData {
  id?: string;
  name: string;
  native_name?: string;
  iso2: string;
}
