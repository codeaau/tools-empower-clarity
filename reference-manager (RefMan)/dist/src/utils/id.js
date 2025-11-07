function base36Timestamp() {
    return Math.floor(Date.now()).toString(36);
}
function shortRandom() {
    return Math.random().toString(36).slice(2, 8);
}
export function generateId(prefix) {
    return `${prefix}-${base36Timestamp()}-${shortRandom()}`;
}
