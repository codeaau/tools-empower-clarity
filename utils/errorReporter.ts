// utils/errorReporter.ts
export type ErrorContext = {
  source?: string; // repo-relative path, e.g., "trueData/validator.ts"
  func?: string;   // function name, e.g., "run"
  location?: string; // best-effort line:column if available
};

export function formatError(err: Error, context: ErrorContext = {}) {
  return {
    message: err.message,
    name: err.name,
    source: context.source ?? "unknown",
    function: context.func ?? "unknown",
    location: context.location ?? "unknown",
    stack: err.stack,
  };
}
