import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg text-center">
        {/* Terminal window */}
        <div className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden text-left">
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-border-subtle bg-bg-secondary px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs font-mono text-text-secondary">
              Surfy@ctf:~
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-6 font-mono text-sm leading-relaxed space-y-2">
            <p className="text-text-secondary">
              <span className="text-accent">$</span> cat flag.txt
            </p>
            <p className="text-red-400">
              cat: flag.txt: No such file or directory
            </p>
            <p className="text-text-secondary mt-4">
              <span className="text-accent">$</span> echo $?
            </p>
            <p className="text-text-primary font-bold text-4xl mt-1">404</p>
            <p className="text-text-secondary mt-4">
              <span className="text-accent">$</span>{" "}
              <span className="text-text-primary">
                # Flag not found
                <span className="inline-block w-[7px] h-[1em] bg-text-primary align-text-bottom ml-0.5 animate-[blink_1s_steps(2)_infinite]" />
              </span>
            </p>
          </div>
        </div>

        <p className="mt-6 text-text-secondary text-sm">
          Looks like this page has been pwned… or it never existed.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg-primary transition-opacity hover:opacity-90"
        >
          <span aria-hidden>←</span>
          Return to Home
        </Link>
      </div>
    </main>
  );
}
