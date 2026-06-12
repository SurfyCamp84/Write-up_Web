import Link from "next/link";
import { getRecentChallenges, getCTFEvents, getAllChallenges } from "@/app/lib/data";
import ChallengeCard from "@/app/components/ChallengeCard";

export default function Home() {
  const recentChallenges = getRecentChallenges(4);
  const ctfEvents = getCTFEvents();
  const allChallenges = getAllChallenges();

  const totalCTFs = ctfEvents.length;
  const totalSolves = allChallenges.length;
  const categories = new Set(allChallenges.map((c) => c.category));
  const totalCategories = categories.size;

  return (
    <main className="flex-1">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        {/* faint grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 py-28 sm:py-36">
          <p className="font-mono text-sm text-text-secondary mb-4 tracking-wider">
            ~/whoami
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-text-primary leading-[1.1]">
            Hey, I&apos;m{" "}
            <span className="text-accent">
              Surfy
              <span className="inline-block w-[3px] h-[1em] bg-accent align-text-bottom ml-0.5 animate-[blink_1s_steps(2)_infinite]" />
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-lg text-text-secondary leading-relaxed">
            Security enthusiast · CTF player · Breaking things to learn how they
            work
          </p>

          <p className="mt-3 max-w-lg text-text-secondary/70 text-sm leading-relaxed">
            I document my CTF solves and security research here — flags captured,
            lessons learned, and rabbit holes explored.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/ctfs"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg-primary transition-opacity hover:opacity-90"
            >
              <span>View Write-ups</span>
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-secondary"
            >
              About Me
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recent Write-ups ── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Latest Write-ups
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Recently published challenge solutions
            </p>
          </div>
          <Link
            href="/ctfs"
            className="text-sm font-medium text-accent hover:underline underline-offset-4"
          >
            View all →
          </Link>
        </div>

        {recentChallenges.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {recentChallenges.map((challenge) => (
              <ChallengeCard key={`${challenge.ctfSlug}-${challenge.slug}`} challenge={challenge} ctfSlug={challenge.ctfSlug} ctfName={challenge.ctfName} />
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm">
            No write-ups published yet. Check back soon!
          </p>
        )}
      </section>

      {/* ── Stats Section ── */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-2xl font-bold text-text-primary mb-8">
            Stats
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
              <p className="font-mono text-3xl font-bold text-accent">
                {totalCTFs}
              </p>
              <p className="mt-1 text-sm text-text-secondary">CTFs Played</p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
              <p className="font-mono text-3xl font-bold text-accent-secondary">
                {totalSolves}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Challenges Solved
              </p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-bg-card p-6">
              <p className="font-mono text-3xl font-bold text-accent">
                {totalCategories}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Categories Covered
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
