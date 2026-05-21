export interface AiCallLog {
  correlationId: string;
  endpoint: string;
  model: string;
  promptVersion?: string;
  userId?: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  success: boolean;
  zodValid: boolean;
  errorCode?: string;
}

export function logAiCall(entry: AiCallLog): void {
  console.log(JSON.stringify({ level: "ai_call", ...entry }));
}
