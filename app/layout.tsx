import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Provider from './provider';

export const metadata: Metadata = {
  title: "HR AI Whiteboard",
  description: "An agentic AI whiteboard for turning ideas into structured diagrams and boards.",
};

// The app has no dark theme, and Excalidraw's canvas is opaque to it anyway --
// without this, some mobile browsers (Android "forced dark mode") auto-invert
// the DOM chrome while leaving the canvas untouched, producing a broken,
// half-inverted look. Declaring light-only opts out of that heuristic.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

const isClerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isClerkConfigured) {
    return (
      <html lang="en">
        <body style={{ margin: 0, padding: 0 }}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, padding: 0 }}>
          <Provider>
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
