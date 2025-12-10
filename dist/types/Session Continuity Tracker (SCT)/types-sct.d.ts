export interface SessionState {
    token: TrackingToken;
    startTime: number;
}
export interface TrackingToken {
    id: string;
    type: string;
    createdAt: string;
}
