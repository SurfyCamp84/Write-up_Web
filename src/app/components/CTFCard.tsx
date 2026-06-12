import Link from 'next/link';
import type { CTFEvent } from '@/app/lib/data';

export default function CTFCard({ ctf }: { ctf: CTFEvent }) {
  return (
    <Link
      href={`/ctfs/${ctf.slug}`}
      className="group block rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 transition-all duration-200 hover:border-amber-400/40 hover:-translate-y-0.5"
    >
      {/* Date */}
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {ctf.date}
      </p>

      {/* Name */}
      <h3 className="mb-2 text-xl font-bold text-zinc-100 transition-colors group-hover:text-amber-400">
        {ctf.name}
      </h3>

      {/* Team */}
      <p className="mb-4 text-sm text-zinc-400">
        Team: <span className="text-zinc-300">{ctf.teamName}</span>
      </p>

      {/* Description */}
      <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-zinc-500">
        {ctf.description}
      </p>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Placement */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-400">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {ctf.placement} / {ctf.totalTeams.toLocaleString()}
        </span>

        {/* Challenge count */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-zinc-400">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {ctf.challenges.length} write-up{ctf.challenges.length !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}
