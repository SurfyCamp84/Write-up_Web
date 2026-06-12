import { getCTFEvents } from "@/app/lib/data";
import CTFCard from "@/app/components/CTFCard";

export const metadata = {
  title: "CTF Events — Surfy",
  description: "All CTF competitions I've participated in, with write-ups and solutions.",
};

export default function CTFsPage() {
  const events = getCTFEvents();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-sm text-text-secondary mb-2 tracking-wider">
            ~/ctfs
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
            CTF Events
          </h1>
          <p className="mt-2 text-text-secondary max-w-lg">
            All competitions I&apos;ve participated in. Click on an event to see
            individual challenge write-ups.
          </p>
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ctf) => (
              <CTFCard key={ctf.slug} ctf={ctf} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border-subtle bg-bg-card p-12 text-center">
            <p className="font-mono text-text-secondary">
              No CTF events yet. Stay tuned!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
