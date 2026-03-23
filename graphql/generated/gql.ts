/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    user {\n      id\n      email\n      role\n      profile {\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      position_name\n    }\n    access_token\n    refresh_token\n  }\n}\n\nmutation Signup($auth: AuthInput!) {\n  signup(auth: $auth) {\n    user {\n      id\n      email\n      role\n      profile {\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      position_name\n    }\n    access_token\n    refresh_token\n  }\n}\n\nmutation UpdateToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}": typeof types.LoginDocument,
    "query GetUser($userId: ID!) {\n  user(userId: $userId) {\n    id\n    email\n    role\n    profile {\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    position_name\n  }\n}": typeof types.GetUserDocument,
    "query Users {\n  users {\n    id\n    email\n    profile {\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    department_name\n    position_name\n  }\n}": typeof types.UsersDocument,
};
const documents: Documents = {
    "query Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    user {\n      id\n      email\n      role\n      profile {\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      position_name\n    }\n    access_token\n    refresh_token\n  }\n}\n\nmutation Signup($auth: AuthInput!) {\n  signup(auth: $auth) {\n    user {\n      id\n      email\n      role\n      profile {\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      position_name\n    }\n    access_token\n    refresh_token\n  }\n}\n\nmutation UpdateToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}": types.LoginDocument,
    "query GetUser($userId: ID!) {\n  user(userId: $userId) {\n    id\n    email\n    role\n    profile {\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    position_name\n  }\n}": types.GetUserDocument,
    "query Users {\n  users {\n    id\n    email\n    profile {\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    department_name\n    position_name\n  }\n}": types.UsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    user {\n      id\n      email\n      role\n      profile {\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      position_name\n    }\n    access_token\n    refresh_token\n  }\n}\n\nmutation Signup($auth: AuthInput!) {\n  signup(auth: $auth) {\n    user {\n      id\n      email\n      role\n      profile {\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      position_name\n    }\n    access_token\n    refresh_token\n  }\n}\n\nmutation UpdateToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}"): (typeof documents)["query Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    user {\n      id\n      email\n      role\n      profile {\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      position_name\n    }\n    access_token\n    refresh_token\n  }\n}\n\nmutation Signup($auth: AuthInput!) {\n  signup(auth: $auth) {\n    user {\n      id\n      email\n      role\n      profile {\n        first_name\n        last_name\n        full_name\n        avatar\n      }\n      position_name\n    }\n    access_token\n    refresh_token\n  }\n}\n\nmutation UpdateToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetUser($userId: ID!) {\n  user(userId: $userId) {\n    id\n    email\n    role\n    profile {\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    position_name\n  }\n}"): (typeof documents)["query GetUser($userId: ID!) {\n  user(userId: $userId) {\n    id\n    email\n    role\n    profile {\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    position_name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Users {\n  users {\n    id\n    email\n    profile {\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    department_name\n    position_name\n  }\n}"): (typeof documents)["query Users {\n  users {\n    id\n    email\n    profile {\n      first_name\n      last_name\n      full_name\n      avatar\n    }\n    department_name\n    position_name\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;