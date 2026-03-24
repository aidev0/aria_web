"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWebSocket, useAgents, type AgentConfigData } from "@/lib/hooks";

const AGENT_META: Record<string, { icon: string; color: string }> = {
  planner: { icon: "\u{1F4CB}", color: "from-violet-500 to-purple-600" },
  developer: { icon: "\u26A1", color: "from-blue-500 to-cyan-600" },
  tester: { icon: "\u{1F9EA}", color: "from-green-500 to-emerald-600" },
  code_reviewer: { icon: "\u{1F50D}", color: "from-amber-500 to-orange-600" },
  deployer: { icon: "\u{1F680}", color: "from-pink-500 to-rose-600" },
  reporter: { icon: "\u{1F3AC}", color: "from-teal-500 to-cyan-600" },
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
  { value: "claude", label: "Claude Code CLI" },
  { value: "gemini", label: "Gemini CLI" },
  { value: "codex", label: "Codex CLI" },
];

export default function Dashboard() {
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
    "pipeline" | "stream" | "agents"
  >("pipeline");
  const [editingAgent, setEditingAgent] = useState<string | null>(null);

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
            <div
              className={`w-2 h-2 rounded-full ${
                ws.status === "connected"
                  ? "bg-green-500"
                  : ws.status === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-zinc-600"
              }`}
            />
            <span className="text-xs text-zinc-400">
              {ws.status === "connected" ? "Live" : "Offline"}
            </span>
          </div>

          <button
            onClick={ws.status === "connected" ? ws.disconnect : ws.connect}
            className="text-xs px-3 py-1 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white transition-colors"
          >
            {ws.status === "connected" ? "Disconnect" : "Connect Glasses"}
          </button>
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
                        {agent.config?.model || "claude"}
                        {agent.config?.use_cli ? ` + ${agent.config.cli}` : ""}
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
                Glasses
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    ws.send({ type: "command", action: "session_start" })
                  }
                  className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 transition-colors"
                >
                  Start Session
                </button>
                <button
                  onClick={() =>
                    ws.send({ type: "command", action: "video_start" })
                  }
                  className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 transition-colors"
                >
                  Start Video
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
            {(["pipeline", "stream", "agents"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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

                      {/* Current config display */}
                      {!isEditing && (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Model</span>
                            <span className="text-zinc-300">
                              {MODEL_OPTIONS.find(
                                (m) => m.value === agent.config?.model
                              )?.label || agent.config?.model || "Claude Opus 4.6"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">CLI</span>
                            <span className="text-zinc-300">
                              {CLI_OPTIONS.find(
                                (c) => c.value === agent.config?.cli
                              )?.label || "API Only"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Use CLI</span>
                            <span className="text-zinc-300">
                              {agent.config?.use_cli ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Edit config form */}
                      {isEditing && (
                        <AgentConfigForm
                          config={agent.config || { model: "claude", cli: "none", use_cli: false }}
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
        </main>
      </div>
    </div>
  );
}

function AgentConfigForm({
  config,
  onSave,
}: {
  config: AgentConfigData;
  onSave: (config: AgentConfigData) => void;
}) {
  const [localConfig, setLocalConfig] = useState<AgentConfigData>(config);

  return (
    <div className="space-y-3">
      {/* Model selection */}
      <div>
        <label className="text-xs text-zinc-500 block mb-1">LLM Model</label>
        <div className="flex flex-wrap gap-1.5">
          {MODEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setLocalConfig((c) => ({ ...c, model: opt.value }))
              }
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                localConfig.model === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* CLI selection */}
      <div>
        <label className="text-xs text-zinc-500 block mb-1">CLI Tool</label>
        <div className="flex flex-wrap gap-1.5">
          {CLI_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                setLocalConfig((c) => ({
                  ...c,
                  cli: opt.value,
                  use_cli: opt.value !== "none",
                }))
              }
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                localConfig.cli === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Use CLI toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">Use CLI instead of API</span>
        <button
          onClick={() =>
            setLocalConfig((c) => ({ ...c, use_cli: !c.use_cli }))
          }
          className={`w-10 h-5 rounded-full transition-colors relative ${
            localConfig.use_cli ? "bg-indigo-600" : "bg-zinc-700"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
              localConfig.use_cli ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <button
        onClick={() => onSave(localConfig)}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
      >
        Save Configuration
      </button>
    </div>
  );
}
