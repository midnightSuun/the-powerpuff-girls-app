/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 */
type Documents = {
    "mutation ForgotPassword($email: String!) {\n  forgotPassword(auth: {email: $email})\n}": typeof types.ForgotPasswordDocument,
    "mutation Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    access_token\n    refresh_token\n  }\n}": typeof types.LoginDocument,
    "mutation RefreshToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}": typeof types.RefreshTokenDocument,
    "mutation ResetPassword($auth: ResetPasswordInput!) {\n  resetPassword(auth: $auth)\n}": typeof types.ResetPasswordDocument,
    "mutation Signup($auth: SignupInput!) {\n  signup(auth: $auth) {\n    access_token\n    refresh_token\n  }\n}": typeof types.SignupDocument,
    "query GetUserSkills($userId: ID!) {\n  profile(userId: $userId) {\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}": typeof types.GetUserSkillsDocument,
    "query GetUser($id: ID!) {\n  user(userId: $id) {\n    id\n    email\n    role\n    profile {\n      first_name\n      last_name\n      avatar\n    }\n  }\n}": typeof types.GetUserDocument,
    "query GetUsers($params: SearchPaginationInput) {\n  users(params: $params) {\n    items {\n      id\n      email\n      profile {\n        first_name\n        last_name\n        avatar\n      }\n      department {\n        id\n        name\n      }\n      position {\n        id\n        name\n      }\n    }\n    limit\n    total_pages\n  }\n}": typeof types.GetUsersDocument,
};

const documents: Documents = {
    "mutation ForgotPassword($email: String!) {\n  forgotPassword(auth: {email: $email})\n}": types.ForgotPasswordDocument,
    "mutation Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    access_token\n    refresh_token\n  }\n}": types.LoginDocument,
    "mutation RefreshToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}": types.RefreshTokenDocument,
    "mutation ResetPassword($auth: ResetPasswordInput!) {\n  resetPassword(auth: $auth)\n}": types.ResetPasswordDocument,
    "mutation Signup($auth: SignupInput!) {\n  signup(auth: $auth) {\n    access_token\n    refresh_token\n  }\n}": types.SignupDocument,
    "query GetUserSkills($userId: ID!) {\n  profile(userId: $userId) {\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}": types.GetUserSkillsDocument,
    "query GetUser($id: ID!) {\n  user(userId: $id) {\n    id\n    email\n    role\n    profile {\n      first_name\n      last_name\n      avatar\n    }\n  }\n}": types.GetUserDocument,
    "query GetUsers($params: SearchPaginationInput) {\n  users(params: $params) {\n    items {\n      id\n      email\n      profile {\n        first_name\n        last_name\n        avatar\n      }\n      department {\n        id\n        name\n      }\n      position {\n        id\n        name\n      }\n    }\n    limit\n    total_pages\n  }\n}": types.GetUsersDocument,
};

export function graphql(source: string): unknown;

export function graphql(source: "mutation ForgotPassword($email: String!) {\n  forgotPassword(auth: {email: $email})\n}"): (typeof documents)["mutation ForgotPassword($email: String!) {\n  forgotPassword(auth: {email: $email})\n}"];
export function graphql(source: "mutation Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    access_token\n    refresh_token\n  }\n}"): (typeof documents)["mutation Login($auth: AuthInput!) {\n  login(auth: $auth) {\n    access_token\n    refresh_token\n  }\n}"];
export function graphql(source: "mutation RefreshToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}"): (typeof documents)["mutation RefreshToken {\n  updateToken {\n    access_token\n    refresh_token\n  }\n}"];
export function graphql(source: "mutation ResetPassword($auth: ResetPasswordInput!) {\n  resetPassword(auth: $auth)\n}"): (typeof documents)["mutation ResetPassword($auth: ResetPasswordInput!) {\n  resetPassword(auth: $auth)\n}"];
export function graphql(source: "mutation Signup($auth: SignupInput!) {\n  signup(auth: $auth) {\n    access_token\n    refresh_token\n  }\n}"): (typeof documents)["mutation Signup($auth: SignupInput!) {\n  signup(auth: $auth) {\n    access_token\n    refresh_token\n  }\n}"];
export function graphql(source: "query GetUserSkills($userId: ID!) {\n  profile(userId: $userId) {\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}"): (typeof documents)["query GetUserSkills($userId: ID!) {\n  profile(userId: $userId) {\n    skills {\n      name\n      mastery\n      categoryId\n    }\n  }\n}"];
export function graphql(source: "query GetUser($id: ID!) {\n  user(userId: $id) {\n    id\n    email\n    role\n    profile {\n      first_name\n      last_name\n      avatar\n    }\n  }\n}"): (typeof documents)["query GetUser($id: ID!) {\n  user(userId: $id) {\n    id\n    email\n    role\n    profile {\n      first_name\n      last_name\n      avatar\n    }\n  }\n}"];
export function graphql(source: "query GetUsers($params: SearchPaginationInput) {\n  users(params: $params) {\n    items {\n      id\n      email\n      profile {\n        first_name\n        last_name\n        avatar\n      }\n      department {\n        id\n        name\n      }\n      position {\n        id\n        name\n      }\n    }\n    limit\n    total_pages\n  }\n}"): (typeof documents)["query GetUsers($params: SearchPaginationInput) {\n  users(params: $params) {\n    items {\n      id\n      email\n      profile {\n        first_name\n        last_name\n        avatar\n      }\n      department {\n        id\n        name\n      }\n      position {\n        id\n        name\n      }\n    }\n    limit\n    total_pages\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;