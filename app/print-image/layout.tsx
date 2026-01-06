import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Image Printer - Print Toys",
  description: "Print images from clipboard or file upload",
};

export default function PrintImageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
