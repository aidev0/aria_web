"use client";

import Image from "next/image";
import Link from "next/link";

const agents = [
  {
    name: "Planner",
    icon: "\u{1F4CB}",
    color: "from-violet-500 to-purple-600",
    description: "Breaks requirements into structured development plans",
  },
  {
    name: "Developer",
    icon: "\u26A1",
    color: "from-blue-500 to-cyan-600",
    description: "Generates production-ready code from task specs",
  },
  {
    name: "Tester",
    icon: "\u{1F9EA}",
    color: "from-green-500 to-emerald-600",
    description: "Creates comprehensive test suites automatically",
  },
  {
    name: "Code Reviewer",
    icon: "\u{1F50D}",
    color: "from-amber-500 to-orange-600",
    description: "Reviews code for quality, security & performance",
  },
  {
    name: "Deployer",
    icon: "\u{1F680}",
    color: "from-pink-500 to-rose-600",
    description: "Handles build pipelines and deployment automation",
  },
  {
    name: "Reporter",
    icon: "\u{1F4CA}",
    color: "from-teal-500 to-cyan-600",
    description: "Delivers reports via WhatsApp, voice & glasses display",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Image
            src="/logos/aria_wf_bb_nodot.png"
            alt="Aria"
            width={180}
            height={180}
            className="mx-auto mb-8"
          />

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-gradient">Aria AI</span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 mb-4 max-w-2xl mx-auto">
            Development agents for your Meta glasses.
            <br />
            Plan. Develop. Test. Review. Deploy. Report.
          </p>

          <p className="text-lg text-zinc-500 mb-10 max-w-xl mx-auto">
            Pitch an idea on SF streets. Showcase your demo at Luma events.
            No laptop required.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-lg transition-colors"
            >
              Open Dashboard
            </Link>
            <a
              href="#agents"
              className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 rounded-xl font-semibold text-lg transition-colors text-zinc-300"
            >
              Explore Agents
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 text-zinc-600 text-sm">
          Powered by Claude &middot; Gemini &middot; OpenAI &middot; ElevenLabs &middot; Whisper
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Six Agents. One Pipeline.
          </h2>
          <p className="text-zinc-400 text-center mb-16 text-lg">
            From voice command to deployed app — without touching a keyboard.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 transition-colors group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  {agent.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
                <p className="text-zinc-400">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="text-4xl mb-4">{"\u{1F576}\uFE0F"}</div>
              <h3 className="text-lg font-semibold mb-2">Speak to Glasses</h3>
              <p className="text-zinc-400">
                Tell Aria what to build through your Meta glasses mic. Whisper transcribes your voice in real-time.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">{"\u{1F916}"}</div>
              <h3 className="text-lg font-semibold mb-2">Agents Work</h3>
              <p className="text-zinc-400">
                Six AI agents plan, code, test, review, and deploy your idea automatically using Claude, Gemini, or GPT.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">{"\u{1F4F1}"}</div>
              <h3 className="text-lg font-semibold mb-2">Get Reports</h3>
              <p className="text-zinc-400">
                Receive voice whispers on glasses, visual notifications on display, and WhatsApp messages with status updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800 text-center text-zinc-500 text-sm">
        <Image
          src="/logos/aria_yin_yang.png"
          alt="Aria"
          width={32}
          height={32}
          className="mx-auto mb-3 opacity-50"
        />
        Aria AI &copy; {new Date().getFullYear()} &mdash; Redefining software development with AR
      </footer>
    </main>
  );
}
