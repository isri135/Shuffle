import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shuffle",
  description: "Randomly assign chores to room members with realtime updates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
