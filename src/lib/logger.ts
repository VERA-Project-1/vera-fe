// Server-side terminal logger for route handlers: "HH:MM:SS LEVEL [scope] [request-id] message".
const COLORS = { debug: "\x1b[90m", info: "\x1b[32m", warn: "\x1b[33m", error: "\x1b[31m" } as const;
const RESET = "\x1b[0m";
const useColor = process.stdout.isTTY;

type Level = keyof typeof COLORS;

function write(level: Level, scope: string, requestId: string, message: string) {
  const time = new Date().toTimeString().slice(0, 8);
  const tag = level.toUpperCase().padEnd(5);
  const coloredTag = useColor ? `${COLORS[level]}${tag}${RESET}` : tag;
  const line = `${time} ${coloredTag} [${scope}] [${requestId}] ${message}`;
  (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line);
}

export function createLogger(scope: string, requestId: string) {
  return {
    debug: (msg: string) => write("debug", scope, requestId, msg),
    info: (msg: string) => write("info", scope, requestId, msg),
    warn: (msg: string) => write("warn", scope, requestId, msg),
    error: (msg: string) => write("error", scope, requestId, msg),
  };
}
