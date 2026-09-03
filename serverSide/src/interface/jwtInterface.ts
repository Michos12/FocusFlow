export interface JwtPayload {
  userId: number;
  email: string;
  // The users.token_version this token was signed with. The middleware compares
  // it against the stored one, so a password change invalidates older tokens.
  tokenVersion: number;
}
