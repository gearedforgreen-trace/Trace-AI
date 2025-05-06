import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Account = {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    accessTokenExpiresAt: Timestamp | null;
    refreshTokenExpiresAt: Timestamp | null;
    scope: string | null;
    password: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};
export type Invitation = {
    id: string;
    organizationId: string;
    email: string;
    role: string | null;
    status: string;
    expiresAt: Timestamp;
    inviterId: string;
};
export type Member = {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: Timestamp;
};
export type Organization = {
    id: string;
    name: string;
    slug: string | null;
    logo: string | null;
    createdAt: Timestamp;
    metadata: string | null;
};
export type Session = {
    id: string;
    expiresAt: Timestamp;
    token: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
    impersonatedBy: string | null;
    activeOrganizationId: string | null;
};
export type User = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Timestamp | null;
    username: string | null;
    displayUsername: string | null;
    phoneNumber: string | null;
    address: string | null;
    postalCode: string | null;
    status: string;
};
export type Verification = {
    id: string;
    identifier: string;
    value: string;
    expiresAt: Timestamp;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
};
export type DB = {
    account: Account;
    invitation: Invitation;
    member: Member;
    organization: Organization;
    session: Session;
    user: User;
    verification: Verification;
};
