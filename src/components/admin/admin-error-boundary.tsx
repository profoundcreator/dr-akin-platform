"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface AdminErrorBoundaryProps {
  children: ReactNode;
}

interface AdminErrorBoundaryState {
  error: Error | null;
}

export class AdminErrorBoundary extends Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  state: AdminErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[admin] render error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
          style={{ background: "#f5f3ef", color: "#1a1a1a" }}
        >
          <h1 className="text-lg font-semibold">Admin workspace error</h1>
          <p className="max-w-md text-sm opacity-80">
            Something prevented the admin screen from loading. Try signing in again or refresh
            the page.
          </p>
          <a
            href="/admin/login"
            className="rounded-md bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white no-underline"
          >
            Back to admin sign in
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
