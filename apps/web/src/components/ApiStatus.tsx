// ApiStatus.tsx - Component to display API connection status
'use client';

import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import { checkApiHealth } from '../lib/api';
import { testBackendConnection } from '../lib/api-test';

interface ApiStatusProps {
  onConnectionStatusChange?: (connected: boolean) => void;
  compact?: boolean;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({
  onConnectionStatusChange,
  compact = false
}) => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [details, setDetails] = useState<any>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const checkConnection = async () => {
    setTesting(true);
    setStatus('loading');

    try {
      const health = await checkApiHealth();

      if (health.healthy) {
        setStatus('connected');
        setResponseTime(health.responseTime);

        // Notify parent component
        onConnectionStatusChange?.(true);
      } else {
        setStatus('disconnected');
        setDetails({ error: health.error });

        // Notify parent component
        onConnectionStatusChange?.(false);
      }
    } catch (error) {
      setStatus('disconnected');
      setDetails({ error: (error as Error).message });

      // Notify parent component
      onConnectionStatusChange?.(false);
    } finally {
      setTesting(false);
    }
  };

  const runDetailedTest = async () => {
    setTesting(true);
    setStatus('loading');

    try {
      const results = await testBackendConnection();
      setDetails(results);

      if (results.success) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }

      // Notify parent component
      onConnectionStatusChange?.(results.success);
    } catch (error) {
      setStatus('disconnected');
      setDetails({ error: (error as Error).message });

      // Notify parent component
      onConnectionStatusChange?.(false);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (compact) {
    return (
      <div
        className="api-status-compact"
        title={status === 'connected' ? 'API Connected' : status === 'loading' ? 'Checking API Connection' : 'API Disconnected'}
      >
        <div className={`status-indicator ${status}`}></div>
        <style jsx>{`
          .api-status-compact {
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          
          .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            transition: all 0.3s ease;
          }
          
          .status-indicator.connected {
            background: #10b981;
            box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
          }
          
          .status-indicator.loading {
            background: #f59e0b;
            box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
            animation: pulse 1.5s infinite;
          }
          
          .status-indicator.disconnected {
            background: #ef4444;
            box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="api-status">
      <div className={`status-card ${status}`}>
        <div className="status-header" onClick={() => setExpanded(!expanded)}>
          <div className="status-icon">
            {status === 'connected' && <CheckCircle size={18} />}
            {status === 'disconnected' && <XCircle size={18} />}
            {status === 'loading' && <Activity size={18} />}
          </div>
          <div className="status-title">
            {status === 'connected' && 'API Connected'}
            {status === 'disconnected' && 'API Disconnected'}
            {status === 'loading' && 'Checking API Connection'}
          </div>
          <div className="status-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                checkConnection();
              }}
              className="refresh-button"
              disabled={testing}
              title="Quick check"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="status-details">
            {status === 'connected' && responseTime && (
              <div className="status-metric">
                <span>Response time:</span>
                <span className="metric-value">{responseTime}ms</span>
              </div>
            )}

            {status === 'disconnected' && details?.error && (
              <div className="error-message">
                <AlertCircle size={14} />
                <span>{details.error}</span>
              </div>
            )}

            <div className="status-actions-full">
              <button
                onClick={runDetailedTest}
                className="test-button"
                disabled={testing}
              >
                {testing ? 'Testing...' : 'Run Detailed Test'}
              </button>
            </div>

            {details && details.endpoints && (
              <div className="endpoint-status">
                <h4>Endpoint Status</h4>
                <div className="endpoints-grid">
                  {Object.entries(details.endpoints).map(([name, working]: [string, any]) => (
                    <div key={name} className={`endpoint ${working ? 'working' : 'failed'}`}>
                      {working ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .api-status {
          width: 100%;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .status-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .status-card.connected {
          border-left: 3px solid #10b981;
        }
        
        .status-card.disconnected {
          border-left: 3px solid #ef4444;
        }
        
        .status-card.loading {
          border-left: 3px solid #f59e0b;
        }
        
        .status-header {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .status-header:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .status-icon {
          display: flex;
          align-items: center;
          margin-right: 0.75rem;
        }
        
        .status-card.connected .status-icon {
          color: #10b981;
        }
        
        .status-card.disconnected .status-icon {
          color: #ef4444;
        }
        
        .status-card.loading .status-icon {
          color: #f59e0b;
          animation: pulse 1.5s infinite;
        }
        
        .status-title {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .status-actions {
          display: flex;
          align-items: center;
        }
        
        .refresh-button {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .refresh-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .status-details {
          padding: 0.75rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.8125rem;
        }
        
        .status-metric {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .metric-value {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          margin-bottom: 0.75rem;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
        }
        
        .status-actions-full {
          display: flex;
          justify-content: center;
          margin: 0.75rem 0;
        }
        
        .test-button {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .test-button:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        .test-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .endpoint-status {
          margin-top: 0.75rem;
        }
        
        .endpoint-status h4 {
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 0.5rem 0;
        }
        
        .endpoints-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        
        .endpoint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          padding: 0.375rem 0.5rem;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .endpoint.working {
          color: #10b981;
        }
        
        .endpoint.failed {
          color: #ef4444;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ApiStatus;
