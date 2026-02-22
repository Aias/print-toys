import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Notetaker - Print Toys',
  description: 'Write and print notes in Markdown format'
};

export default function NotetakerLayout({ children }: { children: ReactNode }) {
  return children;
}
