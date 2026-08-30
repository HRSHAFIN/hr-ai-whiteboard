import Link from "next/link";
import {
  ArrowRight,
  Check,
  MessageSquare,
  MousePointer2,
  Pencil,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#workspace", label: "Workspace" },
  { href: "#workflow", label: "Workflow" },
  { href: "#features", label: "Features" },
];

const WORKFLOW_STEPS = [
  {
    title: "Start from a blank board",
    description: "Open a whiteboard and sketch ideas freely, or describe what you want in plain English.",
  },
  {
    title: "AI turns it into structure",
    description: "Gemini reads your prompt and adds real, editable shapes, flows, and wireframes to the canvas.",
  },
  {
    title: "Refine, save, and revisit",
    description: "Drag, edit, and re-generate as your thinking evolves. Everything autosaves to your workspace.",
  },
];

const CAPABILITIES = [
  {
    icon: Wand2,
    title: "Think with an AI partner",
    description: "Ask for a flowchart, architecture diagram, or wireframe and get a real editable diagram back, not just an image.",
  },
  {
    icon: Pencil,
    title: "Organize messy ideas",
    description: "Sketch freely with a full drawing toolkit, then let AI group and connect your thinking into something structured.",
  },
  {
    icon: MessageSquare,
    title: "Move from prompt to board",
    description: "Describe a project in one sentence and get a starting point on the canvas in seconds, ready to iterate on.",
  },
];

function Logo() {
  return (
    <span
      className="size-6 rounded-full"
      style={{
        background:
          "conic-gradient(from 0deg, #2563eb 0deg 90deg, #16a34a 90deg 180deg, #f59e0b 180deg 270deg, #ec4899 270deg 360deg)",
      }}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Logo />
          HR AI Whiteboard
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-neutral-900">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
            Sign in
          </Link>
          <Button render={<Link href="/dashboard" />} className="rounded-full">
            Open dashboard
            <ArrowRight />
          </Button>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-12 overflow-hidden px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium text-blue-600">
            <Sparkles className="size-3.5" />
            Agentic canvas for ideas, systems, and strategy
          </div>

          <h1 className="font-heading text-5xl leading-[1.05] font-bold tracking-tight text-neutral-950 sm:text-6xl">
            Build clearer ideas on an AI whiteboard.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-neutral-600">
            HR AI Whiteboard helps teams turn rough thinking into structured diagrams,
            wireframes, and project boards with an AI collaborator built into the canvas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" className="rounded-full" render={<Link href="/dashboard" />}>
              Create your first board
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" render={<Link href="/dashboard" />}>
              View workspace
              <ArrowRight />
            </Button>
          </div>

          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6">
            <div>
              <dt className="font-heading text-3xl font-bold">AI</dt>
              <dd className="text-sm text-neutral-500">assisted thinking</dd>
            </div>
            <div>
              <dt className="font-heading text-3xl font-bold">∞</dt>
              <dd className="text-sm text-neutral-500">canvas space</dd>
            </div>
            <div>
              <dt className="font-heading text-3xl font-bold">1</dt>
              <dd className="text-sm text-neutral-500">place for projects</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-400" />
                <span className="size-2.5 rounded-full bg-amber-400" />
                <span className="size-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-neutral-600">
                <Sparkles className="size-3 text-blue-600" />
                AI workspace active
              </div>
            </div>

            <div className="flex">
              <div className="flex flex-col gap-1 border-r bg-neutral-50/50 p-2">
                {[MousePointer2, Pencil, Sparkles, MessageSquare].map((Icon, i) => (
                  <div
                    key={i}
                    className="flex size-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600"
                  >
                    <Icon className="size-4" />
                  </div>
                ))}
              </div>

              <div
                className="relative h-[340px] flex-1 bg-[radial-gradient(circle,#e5e5e5_1px,transparent_1px)] bg-[length:18px_18px]"
              >
                <svg className="pointer-events-none absolute inset-0 size-full">
                  <path
                    d="M 110 55 C 200 20, 300 20, 355 55"
                    stroke="#d4d4d4"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  <path
                    d="M 300 100 C 320 160, 300 190, 275 210"
                    stroke="#d4d4d4"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                </svg>

                <div className="absolute top-11 left-5 rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-800 shadow-sm">
                  User goal
                </div>
                <div className="absolute top-16 right-5 rounded-lg bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-800 shadow-sm">
                  AI expands context
                </div>
                <div className="absolute top-32 left-8 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm">
                  Sketch the flow
                </div>
                <div className="absolute top-52 right-8 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 shadow-sm">
                  Ship-ready plan
                </div>

                <div className="absolute top-24 left-1/2 w-52 -translate-x-1/2 rounded-xl border bg-white p-3 shadow-md">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="size-3.5 text-blue-600" />
                    AI synthesis
                  </p>
                  <ul className="space-y-1 text-xs text-neutral-600">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-green-600" /> Map the decision path
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-green-600" /> Find missing assumptions
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-green-600" /> Create next actions
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Product strategy board</p>
                <p className="text-xs text-neutral-500">18 elements, 4 AI-generated clusters</p>
              </div>
              <Button size="sm" className="rounded-full">
                Ask AI
                <ArrowRight />
              </Button>
            </div>
          </div>

          <div className="absolute -bottom-4 left-8 rounded-full border bg-white px-4 py-1.5 text-xs font-medium shadow-md">
            From sketch to structured plan
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center font-heading text-3xl font-bold tracking-tight">
          From sketch to structured plan
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border p-6">
              <span className="mb-4 flex size-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-heading text-3xl font-bold tracking-tight">
            Capabilities
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} className="rounded-2xl border bg-white p-6">
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <cap.icon className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{cap.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="workspace" className="mx-auto max-w-7xl px-6 py-10 text-center text-sm text-neutral-500">
        HR AI Whiteboard — build clearer ideas, together with AI.
      </footer>
    </main>
  );
}
