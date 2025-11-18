// trueData/utils/provenanceModel.ts
export interface Provenance {
  method: "entered" | "inferred" | "system-default";
  source: string; // "coordinates" | "tzName" | "system" | "api"
  confirmedByUser?: boolean;
  timestamp: string;
  resolverVersion?: string; // e.g., "geo-tz@1.0.0"
  datasetVersion?: string; // e.g., "countryToContinent@2025-11-13"
  confidence?: number; // 0..1
  rawResolverOutput?: any;
  auditId?: string; // uuid
  signature?: string; // optional HMAC or signature over the record
}
