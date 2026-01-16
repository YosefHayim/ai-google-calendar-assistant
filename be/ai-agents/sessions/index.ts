// Session factory (Supabase sessions removed - agent_sessions table dropped)
export {
  type CompactionConfig,
  type CompactionStrategy,
  type CreateSessionOptions,
  createAgentSession,
  getSessionInfo,
  type SessionType,
} from "./session-factory";
