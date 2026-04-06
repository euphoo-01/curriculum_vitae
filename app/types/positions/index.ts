import type { GetPositionsQuery } from '~~/graphql/generated/graphql';

export type PositionItem = GetPositionsQuery['positions'][number];

export interface PositionEditData {
  id: string;
  name: string;
}

export interface PositionFormData {
  id?: string;
  name: string;
}
