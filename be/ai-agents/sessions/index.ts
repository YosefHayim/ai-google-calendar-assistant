// Session factory (Supabase sessions removed - agent_sessions table dropped)
export {
  createAgentSession,
  getSessionInfo,
  type CreateSessionOptions,
  type SessionType,
  type CompactionStrategy,
  type CompactionConfig,
} from "./session-factory";
