import { useState, useEffect, useRef, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8888";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";

// ── WebSocket Hook ───────────────────────────────────────────────────────────

export type WSStatus = "disconnected" | "connecting" | "connected";

interface WSMessage {
  type: string;
  [key: string]: unknown;
}

export function useWebSocket() {
  const [status, setStatus] = useState<WSStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [transcripts, setTranscripts] = useState<
    { text: string; timestamp: number }[]
  >([]);
  const [aiResponses, setAiResponses] = useState<
    { text: string; timestamp: number }[]
  >([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setStatus("connecting");

    const ws = new WebSocket(`${WS_URL}/view`);
    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        setLastMessage(msg);

        if (msg.type === "transcription") {
          setTranscripts((prev) => [
            ...prev.slice(-49),
            { text: msg.text as string, timestamp: Date.now() },
          ]);
        } else if (msg.type === "ai_response") {
          setAiResponses((prev) => [
            ...prev.slice(-49),
            { text: msg.text as string, timestamp: Date.now() },
          ]);
        }
      } catch {
        // ignore
      }
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return {
    status,
    lastMessage,
    transcripts,
    aiResponses,
    connect,
    disconnect,
    send,
  };
}

// ── Agent Config Types ───────────────────────────────────────────────────────

export interface AgentConfigData {
  model: string;  // claude | gemini | openai
  cli: string;    // claude | gemini | codex | none
  use_cli: boolean;
}

export interface AgentStatus {
  agent_type: string;
  name: string;
  status: string;
  config: AgentConfigData;
  current_task: Record<string, unknown> | null;
}

// ── Agents API Hook ──────────────────────────────────────────────────────────

export function useAgents() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<Record<
    string,
    unknown
  > | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/agents`);
      const data = await res.json();
      setAgents(data.agents || []);
    } catch {
      // server not available
    }
  }, []);

  const configureAgent = useCallback(
    async (agentType: string, config: AgentConfigData) => {
      try {
        const res = await fetch(`${API_URL}/agents/${agentType}/config`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });
        const data = await res.json();
        await fetchAgents();
        return data;
      } catch {
        // server not available
      }
    },
    [fetchAgents]
  );

  const runAgent = useCallback(
    async (agentType: string, taskInput: Record<string, unknown>, model?: string) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/agents/${agentType}/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task_input: taskInput, model }),
        });
        const data = await res.json();
        await fetchAgents();
        return data;
      } finally {
        setLoading(false);
      }
    },
    [fetchAgents]
  );

  const runPipeline = useCallback(
    async (
      requirement: string,
      options: { context?: string; model?: string; whatsapp_phone?: string; deploy_target?: string } = {}
    ) => {
      setPipelineRunning(true);
      setPipelineResult(null);
      try {
        const res = await fetch(`${API_URL}/pipeline/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirement, ...options }),
        });
        const data = await res.json();
        setPipelineResult(data);
        await fetchAgents();
        return data;
      } finally {
        setPipelineRunning(false);
      }
    },
    [fetchAgents]
  );

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  return {
    agents,
    loading,
    pipelineRunning,
    pipelineResult,
    fetchAgents,
    configureAgent,
    runAgent,
    runPipeline,
  };
}
