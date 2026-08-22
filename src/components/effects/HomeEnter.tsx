"use client";

import { usePathname } from "next/navigation";

/** Wraps homepage sections — stagger is triggered under boot/transition cover. */
export function HomeEnter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname !== "/") return <>{children}</>;

  return <div className="home-enter">{children}</div>;
}
