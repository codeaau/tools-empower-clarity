export interface SessionState {
  token: TrackingToken;
  startTime: number;
} // src/session.ts

export interface TrackingToken {
  id: string;
  type: string;
  createdAt: string;
} // sct/src/auditTrail.ts, sct/src/token.ts, sct/src/session.ts
