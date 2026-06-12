import Link from 'next/link';
import type { Challenge } from '@/app/lib/data';
import CategoryBadge from './CategoryBadge';

type ChallengeCardProps = {
  challenge: Challenge;
  ctfSlug: string;
  ctfName?: string;
};

export default function ChallengeCard({ challenge, ctfSlug, ctfName }: ChallengeCardProps) {
  return (
    <Link
      href={`/ctfs/${ctfSlug}/${challenge.slug}`}
      className="group block rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-200 hover:border-amber-400/40 hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={challenge.category} />
      </div>

      {/* Title */}
      <h3 className="mb-1 text-lg font-semibold text-zinc-100 transition-colors group-hover:text-amber-400">
        {challenge.title}
      </h3>

      {/* CTF name (optional) */}
      {ctfName && (
        <p className="mb-3 text-sm text-zinc-500">{ctfName}</p>
      )}

      {/* Description */}
      <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
        {challenge.description}
      </p>
    </Link>
  );
}
