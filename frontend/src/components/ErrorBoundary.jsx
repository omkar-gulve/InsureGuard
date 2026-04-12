import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[InsureGuard] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0F0F1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              background: '#1A1A2E',
              border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: 20,
              padding: '40px 36px',
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(248,113,113,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '2px solid rgba(248,113,113,0.3)',
              }}
            >
              <ShieldAlert style={{ width: 32, height: 32, color: '#F87171' }} />
            </div>

            <h2 style={{ color: '#F9FAFB', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
              InsureGuard encountered an unexpected error. This has been logged automatically.
            </p>

            {/* Error detail (collapsed) */}
            {this.state.error && (
              <div
                style={{
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.15)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 24,
                  textAlign: 'left',
                }}
              >
                <p style={{ color: '#F87171', fontSize: 11, fontFamily: 'monospace', margin: 0, wordBreak: 'break-word' }}>
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '10px 22px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(59,130,246,0.3)',
              }}
            >
              <RefreshCw style={{ width: 15, height: 15 }} />
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
