import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" aria-label="Opporbyte home" className="brand">
      <span className="brand-symbol" aria-hidden="true">
        <span />
      </span>
      <span>
        opporbyte<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
