import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Typewriter - Print Toys",
  description: "Print lines of text one at a time",
};

export default function TypewriterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
