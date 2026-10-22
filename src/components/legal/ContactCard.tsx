import type { ReactNode } from "react";

interface ContactCardProps {
  children: ReactNode;
}

export default function ContactCard({ children }: ContactCardProps) {
  return (
    <div className="rounded-xl border border-gf-line bg-gf-surface px-6 py-5 text-sm text-gf-gray1 leading-loose">
      {children}
    </div>
  );
}
