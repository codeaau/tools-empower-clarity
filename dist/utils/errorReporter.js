export function formatError(err, context = {}) {
    return {
        message: err.message,
        name: err.name,
        source: context.source ?? "unknown",
        function: context.func ?? "unknown",
        location: context.location ?? "unknown",
        stack: err.stack,
    };
}
