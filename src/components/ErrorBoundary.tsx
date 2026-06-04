// @ts-nocheck
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught rendering error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-view"
          className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center p-8 font-sans"
        >
          <div
            id="error-boundary-card"
            className="max-w-md w-full bg-[#141416] border border-red-900 rounded-xl p-8 shadow-2xl text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-red-950 flex items-center justify-center text-[#FF4D00] mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-semibold mb-3 tracking-tight">Render Interface Timeout</h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              We encountered an unexpected layout crash on this screen format:
              <span className="block mt-2 font-mono text-xs bg-black p-2 rounded text-red-400 overflow-x-auto text-left">
                {this.state.error?.message || "Unknown rendering exception"}
              </span>
            </p>
            <button
              id="error-boundary-recovery-btn"
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-[#FF4D00] text-white rounded-lg hover:bg-[#E04400] transition-colors font-medium text-sm shadow-md cursor-pointer"
            >
              Try Again & Refresh App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
