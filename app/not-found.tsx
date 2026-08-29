import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-[46ch] text-center">
        <p className="mb-3 text-[13.5px] font-medium text-[var(--accent)]">Nothing here</p>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">
          That page is not part of this infrastructure.
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--muted)]">
          Nothing you were doing was lost. Every journey in progress is saved against your identity, not against a URL.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-flex h-11 items-center rounded-[var(--r-md)] bg-[var(--accent)] px-5 text-[15px] font-medium text-[var(--accent-ink)]"
        >
          Go to your home
        </Link>
      </div>
    </div>
  );
}
