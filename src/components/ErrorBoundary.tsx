import React from 'react';

/** Catches render errors so one broken page does not blank the app. Shows the real message. */
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('App error:', error); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="display text-5xl">Something broke.</h1>
        <p className="mt-4 text-muted-foreground">Your data is safe in this browser. The error was: <code className="break-words">{this.state.error.message}</code></p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="cursor-pointer rounded-full bg-primary px-5 py-2 text-primary-foreground" onClick={() => { this.setState({ error: null }); location.reload(); }}>Reload</button>
          <a className="rounded-full border border-border px-5 py-2" href="#/app/feedback">Report it</a>
        </div>
      </div>
    );
  }
}
