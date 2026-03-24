"use client";

import Image from "next/image";
import Link from "next/link";

const pipeline = [
  { name: "plan", color: "#8b5cf6" },
  { name: "develop", color: "#3b82f6" },
  { name: "test", color: "#10b981" },
  { name: "review", color: "#f59e0b" },
  { name: "deploy", color: "#ec4899" },
  { name: "demo", color: "#06b6d4" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Logo — white on black, blends with black bg */}
          <div className="mb-12">
            <Image
              src="/logos/aria_wf_bb.png"
              alt="aria"
              width={220}
              height={220}
              className="mx-auto rounded-2xl"
              priority
            />
          </div>

          {/* Sub-brand */}
          <p className="text-[13px] text-zinc-400 tracking-[0.3em] mb-8">
            aria glasses ai
          </p>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-[1.15] tracking-tight">
            code from anywhere.
            <br />
            <span className="text-zinc-400">ship without a laptop.</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            speak your idea to meta glasses. aria ai agents build it
            while you walk, chill, or commute. demo at your next event.
          </p>

          {/* Pipeline */}
          <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
            {pipeline.map((step, i) => (
              <div key={step.name} className="flex items-center gap-3">
                <span
                  className="text-sm font-medium"
                  style={{ color: step.color }}
                >
                  {step.name}
                </span>
                {i < pipeline.length - 1 && (
                  <span className="text-zinc-600">{"/"}</span>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-white text-black rounded-lg font-medium text-sm transition-all hover:bg-zinc-200"
            >
              get started
            </Link>
            <a
              href="#about"
              className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 rounded-lg font-medium text-sm text-zinc-300 hover:text-white transition-all"
            >
              download testflight
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 text-zinc-500 text-[11px] tracking-wider">
          transcription &middot; voice &middot; planning &middot; development &middot; testing &middot; review &middot; deploy &middot; demo
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────────────── */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-2xl md:text-3xl text-zinc-300 leading-relaxed font-light">
            we know you{"'"}re addicted to{" "}
            <span className="text-white font-medium">productivity</span>.
            we{"'"}re bringing the ability to optimize your lifestyle and{" "}
            <span className="text-white font-medium">liberate you</span> from
            sitting behind a computer for hours. let{" "}
            <span className="text-white font-medium">aria ai agents</span> do
            the work for you.
          </p>

          <div className="mt-16 space-y-8 text-zinc-400 text-lg leading-relaxed">
            <p>
              talk to aria glasses while you chill at the beach, walk sf streets,
              commute or watch tv. aria ai agents plan, develop, test, review
              and deploy. you get a voice memo when it{"'"}s done.
            </p>
            <p>
              download the aria ios app. connect your meta glasses. speak an idea.
              aria develops apps, runs tests, deploys mvps. showcase your demo
              at luma events without typing a single letter.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pipeline ────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-20 text-zinc-300">
            voice to production
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-zinc-900 rounded-2xl overflow-hidden">
            {pipeline.map((step, i) => (
              <div
                key={step.name}
                className="bg-black p-6 text-center hover:bg-zinc-950 transition-colors"
              >
                <div className="text-[11px] text-zinc-500 font-mono mb-4">
                  0{i + 1}
                </div>
                <div
                  className="text-lg font-semibold mb-1"
                  style={{ color: step.color }}
                >
                  {step.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ────────────────────────────────────────────────── */}
      <section className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-20 text-zinc-300">
            everything connected
          </h2>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              ["meta glasses", "camera, mic, speaker, display. full ar integration with any meta glasses."],
              ["transcription agent", "aria listens through your glasses mic and transcribes in real-time."],
              ["dev agents", "six ai agents with configurable models and cli tools. your pick per agent."],
              ["ios app", "connect glasses, stream video, control agents from your phone."],
              ["voice agent", "aria whispers results directly into your ear through glasses speaker."],
              ["notification agent", "pipeline status delivered via whatsapp and glasses display."],
            ].map(([title, desc]) => (
              <div key={title}>
                <h3 className="text-white font-medium mb-1">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-sm mx-auto text-center">
          <p className="text-zinc-400 text-sm mb-3 tracking-wider">one plan</p>
          <div className="flex items-baseline justify-center gap-1 mb-3">
            <span className="text-5xl font-bold text-white">$199</span>
            <span className="text-zinc-400">/mo</span>
          </div>
          <p className="text-zinc-400 text-sm mb-8">
            all aria agents. all models. all clis. unlimited.
          </p>

          <p className="text-zinc-300 text-sm leading-loose mb-8">
            meta glasses integration &middot; aria ios app &middot; software developer agents &middot; transcription &middot; voice reports &middot; whatsapp notifications &middot; configurable models + cli
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { label: "Claude Opus 4.6", color: "#f97316" },
              { label: "Gemini 3.1 Pro", color: "#3b82f6" },
              { label: "GPT-5.4", color: "#10b981" },
              { label: "Claude Code CLI", color: "#a78bfa" },
              { label: "Gemini CLI", color: "#60a5fa" },
              { label: "Codex CLI", color: "#34d399" },
            ].map((m) => (
              <span
                key={m.label}
                className="text-xs px-3 py-1 rounded-full border"
                style={{ color: m.color, borderColor: m.color + "30" }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <Link
            href="/dashboard"
            className="inline-block px-10 py-3 bg-white text-black rounded-lg font-medium text-sm transition-all hover:bg-zinc-200"
          >
            get started
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-zinc-900 text-center">
        <p className="text-zinc-500 text-xs tracking-wider">
          aria glasses ai &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
