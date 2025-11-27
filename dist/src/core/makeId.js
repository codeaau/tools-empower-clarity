import { randomUUID } from "crypto";
export function makeId(prefix = 'U', date = new Date()) {
    if (!/^[A-Z]$/.test(prefix)) {
        throw new Error("prefix must be a single uppercase letter");
    }
    const ts = utcTimestampForId(date);
    const uuid = randomUUID();
    return `${prefix}-${ts}-${uuid}`;
}
function pad(n) {
    return n.toString().padStart(2, "0");
}
function utcTimestampForId(date) {
    const y = date.getUTCFullYear();
    const m = pad(date.getUTCMonth() + 1);
    const d = pad(date.getUTCDate());
    const hh = pad(date.getUTCHours());
    const mm = pad(date.getUTCMinutes());
    const ss = pad(date.getUTCSeconds());
    return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}
