// makeId.js
// produce IDs in the form PREFIX-YYYYMMDDTHHMMSSZ-uuidv4
const { randomUUID } = require('crypto');

function pad(n) {
  return n.toString().padStart(2, '0');
}

function utcTimestampForId(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function makeId(prefix, date = new Date()) {
  if (!prefix || typeof prefix !== 'string' || prefix.length !== 1 || !/^[A-Z]$/.test(prefix)) {
    throw new Error('prefix must be a single uppercase letter');
  }
  const ts = utcTimestampForId(date);
  const uuid = randomUUID();
  return `${prefix}-${ts}-${uuid}`;
}

module.exports = { makeId };
