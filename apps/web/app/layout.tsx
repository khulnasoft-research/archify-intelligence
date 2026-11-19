import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Archify Intelligence",
  description:
    "Evidence-backed architecture intelligence and decision support.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
