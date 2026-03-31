"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useWebSocket, useAgents, type AgentConfigData } from "@/lib/hooks";

const AGENT_META: Record<string, { icon: string; color: string }> = {
  planner: { icon: "\u{1F4CB}", color: "from-violet-500 to-purple-600" },
  developer: { icon: "\u26A1", color: "from-blue-500 to-cyan-600" },
  tester: { icon: "\u{1F9EA}", color: "from-green-500 to-emerald-600" },
  code_reviewer: { icon: "\u{1F50D}", color: "from-amber-500 to-orange-600" },
  deployer: { icon: "\u{1F680}", color: "from-pink-500 to-rose-600" },
  reporter: { icon: "\u{1F3AC}", color: "from-teal-500 to-cyan-600" },
};

const AGENT_DEFAULTS: Record<string, AgentConfigData> = {
  planner:       { model: "", cli: "claude", use_cli: true },
  developer:     { model: "", cli: "claude", use_cli: true },
  tester:        { model: "", cli: "gemini", use_cli: true },
  code_reviewer: { model: "", cli: "codex",  use_cli: true },
  deployer:      { model: "", cli: "claude", use_cli: true },
  reporter:      { model: "claude", cli: "none", use_cli: false },
};

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-zinc-600",
  working: "bg-amber-500 animate-pulse",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

const MODEL_OPTIONS = [
  { value: "claude", label: "Claude Opus 4.6" },
  { value: "gemini", label: "Gemini 3.1 Pro" },
  { value: "openai", label: "GPT-5.4" },
];

const CLI_OPTIONS = [
  { value: "none", label: "API Only" },
  { value: "claude", label: "Claude Code" },
  { value: "gemini", label: "Gemini CLI" },
  { value: "codex", label: "Codex CLI" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const ws = useWebSocket();
  const {
    agents,
    pipelineRunning,
    pipelineResult,
    configureAgent,
    runPipeline,
  } = useAgents();

  const [requirement, setRequirement] = useState("");
  const [model, setModel] = useState("claude");
  const [activeTab, setActiveTab] = useState<
    "pipeline" | "stream" | "agents" | "transcripts"
  >("stream");
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Auto-connect to server
  useEffect(() => {
    ws.connect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";
      const res = await fetch(`${API_URL}/voice/sessions?limit=100`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      // server not available
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const handleRunPipeline = useCallback(async () => {
    if (!requirement.trim()) return;
    await runPipeline(requirement, { model });
  }, [requirement, model, runPipeline]);

  const handleSaveConfig = useCallback(
    async (agentType: string, config: AgentConfigData) => {
      await configureAgent(agentType, config);
      setEditingAgent(null);
    },
    [configureAgent]
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logos/logo.png"
              alt="aria"
              width={28}
              height={28}
            />
            <h1 className="text-lg font-medium text-zinc-400 tracking-wide">aria glasses</h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${ws.glassesConnected ? "bg-green-500" : "bg-zinc-600"}`} />
            <span className="text-xs text-zinc-400">
              {ws.glassesConnected ? "Glasses connected" : "Glasses offline"}
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-zinc-700">
              <span className="text-xs text-zinc-400">
                {user.firstName || user.email}
              </span>
              <a
                href="/auth/signout"
                className="text-xs px-3 py-1 rounded-lg border border-zinc-700 hover:border-red-500/50 text-zinc-400 hover:text-red-400 transition-colors"
              >
                Sign out
              </a>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 p-4 hidden md:block">
          <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-semibold">
            Agents
          </h2>
          <div className="space-y-2">
            {agents.map((agent) => {
              const meta = AGENT_META[agent.agent_type] || {
                icon: "\u{1F916}",
                color: "from-zinc-500 to-zinc-600",
              };
              return (
                <div
                  key={agent.agent_type}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                  onClick={() => setActiveTab("agents")}
                >
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center text-sm`}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {agent.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          STATUS_COLORS[agent.status] || "bg-zinc-600"
                        }`}
                      />
                      <span className="text-xs text-zinc-500">
                        {agent.config?.use_cli
                          ? CLI_OPTIONS.find((c) => c.value === agent.config?.cli)?.label || "CLI"
                          : MODEL_OPTIONS.find((m) => m.value === agent.config?.model)?.label || "Claude Opus 4.6"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {ws.status === "connected" && (
            <div className="mt-6">
              <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-semibold">
                Server
              </h2>
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-green-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Connected
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
            {(["pipeline", "stream", "transcripts", "agents"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "transcripts") fetchSessions();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Pipeline Tab */}
          {activeTab === "pipeline" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Run Pipeline</h2>
              <p className="text-zinc-400 mb-6">
                Describe what you want to build. Each agent uses its configured model & CLI.
              </p>

              <div className="max-w-3xl">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 mb-4">
                  <textarea
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="Describe your project idea... e.g., 'Build a REST API for a todo app with authentication and PostgreSQL'"
                    rows={4}
                    className="w-full bg-transparent resize-none outline-none text-white placeholder:text-zinc-600 mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">Override all:</span>
                      {MODEL_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setModel(opt.value)}
                          className={`text-xs px-3 py-1 rounded-full transition-colors ${
                            model === opt.value
                              ? "bg-indigo-600 text-white"
                              : "bg-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleRunPipeline}
                      disabled={pipelineRunning || !requirement.trim()}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      {pipelineRunning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Running...
                        </>
                      ) : (
                        "Run Pipeline"
                      )}
                    </button>
                  </div>
                </div>

                {pipelineRunning && (
                  <div className="space-y-2">
                    {["Planning", "Developing", "Testing", "Reviewing", "Deploying", "Reporting"].map(
                      (stage, i) => {
                        const agentKeys = [
                          "planner", "developer", "tester", "code_reviewer", "deployer", "reporter",
                        ];
                        const agent = agents.find((a) => a.agent_type === agentKeys[i]);
                        const meta = AGENT_META[agentKeys[i]];
                        return (
                          <div
                            key={stage}
                            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center text-sm`}
                            >
                              {meta.icon}
                            </div>
                            <span className="text-sm font-medium flex-1">{stage}</span>
                            <span className="text-xs text-zinc-500">
                              {agent?.config?.model || "claude"}
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                STATUS_COLORS[agent?.status || "idle"]
                              }`}
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {pipelineResult && (
                  <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <h3 className="text-lg font-semibold mb-3">Pipeline Complete</h3>
                    <pre className="text-xs text-zinc-400 overflow-auto max-h-96 bg-zinc-950 rounded-xl p-4">
                      {JSON.stringify(pipelineResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stream Tab */}
          {activeTab === "stream" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Live Stream</h2>
              <p className="text-zinc-400 mb-6">
                View live video from glasses and real-time transcriptions.
              </p>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden">
                    {ws.status !== "connected" ? (
                      <div className="text-center">
                        <p className="text-zinc-600 mb-3">Connect to glasses to view stream</p>
                        <button
                          onClick={ws.connect}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
                        >
                          Connect
                        </button>
                      </div>
                    ) : ws.lastMessage?.type === "frame" ? (
                      <img
                        src={`data:image/jpeg;base64,${ws.lastMessage.data}`}
                        alt="Live feed"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <p className="text-zinc-600">Waiting for video...</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 max-h-[300px] overflow-auto">
                    <h3 className="text-sm font-semibold text-zinc-400 mb-3">Transcriptions</h3>
                    {ws.transcripts.length === 0 ? (
                      <p className="text-xs text-zinc-600">Speak through glasses mic...</p>
                    ) : (
                      <div className="space-y-2">
                        {ws.transcripts.map((t, i) => (
                          <p key={i} className="text-sm">{t.text}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 max-h-[300px] overflow-auto">
                    <h3 className="text-sm font-semibold text-zinc-400 mb-3">AI Responses</h3>
                    {ws.aiResponses.length === 0 ? (
                      <p className="text-xs text-zinc-600">AI responses will appear here...</p>
                    ) : (
                      <div className="space-y-2">
                        {ws.aiResponses.map((r, i) => (
                          <div
                            key={i}
                            className="text-sm p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
                          >
                            {r.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Agents Tab — per-agent model/CLI config */}
          {activeTab === "agents" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Agent Configuration</h2>
              <p className="text-zinc-400 mb-6">
                Choose the LLM model and CLI for each agent. Configs are saved to MongoDB.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => {
                  const meta = AGENT_META[agent.agent_type] || {
                    icon: "\u{1F916}",
                    color: "from-zinc-500 to-zinc-600",
                  };
                  const isEditing = editingAgent === agent.agent_type;

                  return (
                    <div
                      key={agent.agent_type}
                      className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl`}
                        >
                          {meta.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{agent.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 rounded-full ${STATUS_COLORS[agent.status]}`}
                            />
                            <span className="text-xs text-zinc-400 capitalize">
                              {agent.status}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setEditingAgent(isEditing ? null : agent.agent_type)
                          }
                          className="text-xs px-2 py-1 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white transition-colors"
                        >
                          {isEditing ? "Cancel" : "Configure"}
                        </button>
                      </div>

                      {/* Current config summary */}
                      {!isEditing && (
                        <div className="text-xs text-zinc-400">
                          {agent.config?.use_cli
                            ? CLI_OPTIONS.find((c) => c.value === agent.config?.cli)?.label || "CLI"
                            : MODEL_OPTIONS.find((m) => m.value === agent.config?.model)?.label || "Claude Opus 4.6"}
                          <span className="text-zinc-600 ml-1">
                            {agent.config?.use_cli ? "· CLI" : "· API"}
                          </span>
                        </div>
                      )}

                      {/* Edit config — iOS style */}
                      {isEditing && (
                        <AgentConfigForm
                          agentColor={meta.color}
                          config={agent.config || AGENT_DEFAULTS[agent.agent_type] || { model: "", cli: "claude", use_cli: true }}
                          onSave={(config) =>
                            handleSaveConfig(agent.agent_type, config)
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transcripts Tab */}
          {activeTab === "transcripts" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Transcripts</h2>
              <p className="text-zinc-400 mb-6">
                Voice sessions from glasses microphone.
              </p>

              {loadingSessions ? (
                <div className="flex items-center gap-2 text-zinc-400">
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-zinc-500">No transcription sessions yet.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, i) => {
                    const text = (session.transcription as string) || "";
                    const createdAt = session.created_at as string;
                    const language = (session.language as string) || "en";
                    const durationMs = (session.duration_ms as number) || 0;
                    const durationSec = Math.round(durationMs / 1000);
                    const date = createdAt ? new Date(createdAt) : null;

                    return (
                      <div
                        key={(session.session_id as string) || i}
                        className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">
                              {date ? date.toLocaleString() : "Unknown date"}
                            </span>
                            <span className="text-xs text-zinc-600">
                              {durationSec > 0 ? `${durationSec}s` : ""}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                              {language}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-zinc-200 leading-relaxed">
                          {text || <span className="text-zinc-600 italic">Empty transcription</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const MODEL_DETAILS: Record<string, string> = {
  claude: "claude-opus-4-6 · 1M context · Vision + Tools",
  gemini: "gemini-3.1-pro-preview · 2M context · Multimodal",
  openai: "gpt-5.4 · 1M context · Function calling",
};

const CLI_DETAILS: Record<string, string> = {
  claude: "@anthropic-ai/claude-code \u00b7 Agentic coding",
  gemini: "@google/gemini-cli \u00b7 Google AI terminal",
  codex: "@openai/codex \u00b7 Code generation + execution",
};

const MODEL_COLORS: Record<string, string> = {
  claude: "bg-orange-500",
  gemini: "bg-blue-500",
  openai: "bg-green-500",
};

function AgentConfigForm({
  agentColor,
  config,
  onSave,
}: {
  agentColor: string;
  config: AgentConfigData;
  onSave: (config: AgentConfigData) => void;
}) {
  const [localConfig, setLocalConfig] = useState<AgentConfigData>(() => {
    // Only one can be active — clean the other side
    if (config.use_cli) {
      return { model: "", cli: config.cli || "claude", use_cli: true };
    }
    return { model: config.model || "claude", cli: "none", use_cli: false };
  });
  const showCli = localConfig.use_cli;

  return (
    <div className="space-y-4">
      {/* API / CLI toggle — just switches the view, doesn't select anything */}
      <div className="flex rounded-xl overflow-hidden">
        <button
          onClick={() =>
            setLocalConfig({ model: "", cli: "none", use_cli: false })
          }
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            !showCli
              ? "bg-indigo-600 text-white"
              : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          API
        </button>
        <button
          onClick={() =>
            setLocalConfig({ model: "", cli: "", use_cli: true })
          }
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            showCli
              ? "bg-indigo-600 text-white"
              : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          CLI
        </button>
      </div>

      {showCli ? (
        /* CLI tool list — model is cleared */
        <div className="space-y-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">CLI Tool</p>
          {CLI_OPTIONS.filter((o) => o.value !== "none").map((opt) => {
            const selected = localConfig.cli === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() =>
                  setLocalConfig({ model: "", cli: opt.value, use_cli: true })
                }
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  selected
                    ? "bg-indigo-500/15 border border-indigo-500/30"
                    : "bg-zinc-800/50 border border-transparent hover:border-zinc-700"
                }`}
              >
                <span className="text-indigo-400 text-sm">&#9654;</span>
                <div className="flex-1 text-left">
                  <p className="text-sm text-white">{opt.label}</p>
                  <p className="text-[10px] text-zinc-500">{CLI_DETAILS[opt.value] || ""}</p>
                </div>
                {selected && (
                  <span className="text-indigo-400 text-sm">&#10003;</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* LLM model list — cli is cleared */
        <div className="space-y-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">LLM Model</p>
          {MODEL_OPTIONS.map((opt) => {
            const selected = localConfig.model === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() =>
                  setLocalConfig({ model: opt.value, cli: "none", use_cli: false })
                }
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  selected
                    ? "bg-indigo-500/15 border border-indigo-500/30"
                    : "bg-zinc-800/50 border border-transparent hover:border-zinc-700"
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${MODEL_COLORS[opt.value] || "bg-zinc-500"}`} />
                <div className="flex-1 text-left">
                  <p className="text-sm text-white">{opt.label}</p>
                  <p className="text-[10px] text-zinc-500">{MODEL_DETAILS[opt.value] || ""}</p>
                </div>
                {selected && (
                  <span className="text-indigo-400 text-sm">&#10003;</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => onSave(localConfig)}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-colors"
      >
        Save
      </button>
    </div>
  );
}
