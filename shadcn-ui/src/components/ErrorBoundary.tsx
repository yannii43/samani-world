import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("💥 React crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          <h2 style={{ margin: 0 }}>💥 Crash React (pas normal)</h2>
          <p style={{ color: "#555" }}>
            Copie-colle ce message ici et on corrige.
          </p>
          <pre
            style={{
              marginTop: 12,
              padding: 12,
              background: "#111",
              color: "#fff",
              borderRadius: 8,
              whiteSpace: "pre-wrap",
            }}
          >
            {String(this.state.error?.message || this.state.error || "Unknown error")}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
