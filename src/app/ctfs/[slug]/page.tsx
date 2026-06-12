import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCTFEvents, getCTFBySlug } from "@/app/lib/data";
import ChallengeCard from "@/app/components/ChallengeCard";

export async function generateStaticParams() {
  return getCTFEvents().map((ctf) => ({ slug: ctf.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ctf = getCTFBySlug(slug);
  if (!ctf) return { title: "CTF Not Found — Surfy" };
  return {
    title: `${ctf.name} — Surfy`,
    description: `Write-ups from ${ctf.name}. ${ctf.challenges.length} challenge(s) solved.`,
  };
}

export default async function CTFDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ctf = getCTFBySlug(slug);

  if (!ctf) notFound();

  // collect unique categories for filter hints
  const categories = Array.from(
    new Set(ctf.challenges.map((c) => c.category))
  ).sort();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-text-secondary font-mono">
          <Link href="/ctfs" className="hover:text-accent transition-colors">
            CTFs
          </Link>
          <span className="text-accent font-bold">/</span>
          <span className="text-text-primary">{ctf.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
            {ctf.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {ctf.date}
            </span>

            {ctf.teamName && (
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {ctf.teamName}
              </span>
            )}

            {ctf.placement && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l3.057-3L12 3.5 15.943 0 19 3l-7 21L5 3z" />
                </svg>
                {ctf.placement}
              </span>
            )}
          </div>

        </div>

        {/* Category pills */}
        {categories.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-border-subtle bg-bg-secondary px-3 py-1 text-xs font-mono text-text-secondary"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Challenges Grid */}
        {ctf.challenges.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {ctf.challenges.map((challenge) => (
              <ChallengeCard key={challenge.slug} challenge={challenge} ctfSlug={ctf.slug} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border-subtle bg-bg-card p-12 text-center">
            <p className="font-mono text-text-secondary">
              No write-ups for this event yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
