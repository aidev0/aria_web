"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWebSocket, useAgents } from "@/lib/hooks";

const AGENT_META: Record<string, { icon: string; color: string }> = {
  planner: { icon: "\u{1F4CB}", color: "from-violet-500 to-purple-600" },
  developer: { icon: "\u26A1", color: "from-blue-500 to-cyan-600" },
  tester: { icon: "\u{1F9EA}", color: "from-green-500 to-emerald-600" },
  code_reviewer: { icon: "\u{1F50D}", color: "from-amber-500 to-orange-600" },
  deployer: { icon: "\u{1F680}", color: "from-pink-500 to-rose-600" },
  reporter: { icon: "\u{1F4CA}", color: "from-teal-500 to-cyan-600" },
};

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-zinc-600",
  working: "bg-amber-500 animate-pulse",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

const MODEL_OPTIONS = [
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "openai", label: "GPT-4o" },
];

export default function Dashboard() {
  const ws = useWebSocket();
  const {
    agents,
    pipelineRunning,
    pipelineResult,
    runPipeline,
  } = useAgents();

  const [requirement, setRequirement] = useState("");
  const [model, setModel] = useState("claude");
  const [activeTab, setActiveTab] = useState<"pipeline" | "stream" | "agents">(
    "pipeline"
  );

  const handleRunPipeline = useCallback(async () => {
    if (!requirement.trim()) return;
    await runPipeline(requirement, { model });
  }, [requirement, model, runPipeline]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/logos/aria_wf_bb_nodot.png"
              alt="Aria"
              width={36}
              height={36}
            />
          </Link>
          <h1 className="text-lg font-semibold">Aria Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* WebSocket status */}
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
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors"
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
                        {agent.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stream controls when connected */}
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
                Describe what you want to build. Aria agents will plan, develop,
                test, review, deploy, and report.
              </p>

              <div className="max-w-3xl">
                {/* Input area */}
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
                      <span className="text-xs text-zinc-500">Model:</span>
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

                {/* Pipeline stages */}
                {pipelineRunning && (
                  <div className="space-y-2">
                    {[
                      "Planning",
                      "Developing",
                      "Testing",
                      "Reviewing",
                      "Deploying",
                      "Reporting",
                    ].map((stage, i) => {
                      const agentKeys = [
                        "planner",
                        "developer",
                        "tester",
                        "code_reviewer",
                        "deployer",
                        "reporter",
                      ];
                      const agent = agents.find(
                        (a) => a.agent_type === agentKeys[i]
                      );
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
                          <span className="text-sm font-medium flex-1">
                            {stage}
                          </span>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              STATUS_COLORS[agent?.status || "idle"]
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pipeline Result */}
                {pipelineResult && (
                  <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Pipeline Complete
                    </h3>
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
                {/* Video feed */}
                <div className="lg:col-span-2">
                  <div className="aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden">
                    {ws.status !== "connected" ? (
                      <div className="text-center">
                        <p className="text-zinc-600 mb-3">
                          Connect to glasses to view stream
                        </p>
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

                {/* Transcripts + AI Responses */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 max-h-[300px] overflow-auto">
                    <h3 className="text-sm font-semibold text-zinc-400 mb-3">
                      Transcriptions
                    </h3>
                    {ws.transcripts.length === 0 ? (
                      <p className="text-xs text-zinc-600">
                        Speak through glasses mic...
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {ws.transcripts.map((t, i) => (
                          <p key={i} className="text-sm">
                            {t.text}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 max-h-[300px] overflow-auto">
                    <h3 className="text-sm font-semibold text-zinc-400 mb-3">
                      AI Responses
                    </h3>
                    {ws.aiResponses.length === 0 ? (
                      <p className="text-xs text-zinc-600">
                        AI responses will appear here...
                      </p>
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

          {/* Agents Tab */}
          {activeTab === "agents" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Agent Status</h2>
              <p className="text-zinc-400 mb-6">
                View detailed status and results for each agent.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => {
                  const meta = AGENT_META[agent.agent_type] || {
                    icon: "\u{1F916}",
                    color: "from-zinc-500 to-zinc-600",
                  };
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
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                STATUS_COLORS[agent.status]
                              }`}
                            />
                            <span className="text-xs text-zinc-400 capitalize">
                              {agent.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {agent.current_task && (
                        <pre className="text-xs text-zinc-500 bg-zinc-950 rounded-lg p-3 overflow-auto max-h-40">
                          {JSON.stringify(agent.current_task, null, 2)}
                        </pre>
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
