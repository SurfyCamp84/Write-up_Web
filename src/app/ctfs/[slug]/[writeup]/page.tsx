import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getCTFEvents,
  getCTFBySlug,
  getChallengeBySlug,
} from "@/app/lib/data";
import CategoryBadge from "@/app/components/CategoryBadge";

export async function generateStaticParams() {
  const events = getCTFEvents();
  const paths: { slug: string; writeup: string }[] = [];

  for (const ctf of events) {
    for (const challenge of ctf.challenges) {
      paths.push({ slug: ctf.slug, writeup: challenge.slug });
    }
  }

  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; writeup: string }>;
}): Promise<Metadata> {
  const { slug, writeup } = await params;
  const result = getChallengeBySlug(slug, writeup);
  if (!result) return { title: "Write-up Not Found — Surfy" };

  const { ctf, challenge } = result;
  return {
    title: `${challenge.title} — ${ctf.name} — Surfy`,
    description: `Write-up for "${challenge.title}" (${challenge.category}) from ${ctf.name}.`,
  };
}

export default async function WriteupPage({
  params,
}: {
  params: Promise<{ slug: string; writeup: string }>;
}) {
  const { slug, writeup } = await params;
  const result = getChallengeBySlug(slug, writeup);

  if (!result) notFound();

  const { ctf, challenge } = result;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-text-secondary font-mono">
          <Link href="/ctfs" className="hover:text-accent transition-colors">
            CTFs
          </Link>
          <span className="text-accent font-bold">/</span>
          <Link
            href={`/ctfs/${slug}`}
            className="hover:text-accent transition-colors"
          >
            {ctf?.name ?? slug}
          </Link>
          <span className="text-accent font-bold">/</span>
          <span className="text-text-primary">{challenge.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
            {challenge.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <CategoryBadge category={challenge.category} />
          </div>
        </header>

        {/* Write-up Content */}
        <article
          className="prose-writeup"
          dangerouslySetInnerHTML={{ __html: challenge.content }}
        />

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-border-subtle">
          <Link
            href={`/ctfs/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline underline-offset-4"
          >
            <span aria-hidden>←</span>
            Back to {ctf.name}
          </Link>
        </div>
      </div>
    </main>
  );
}
