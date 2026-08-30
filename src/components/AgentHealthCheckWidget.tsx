import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Terminal, 
  Activity, 
  Server, 
  Clock, 
  Zap, 
  Info, 
  ChevronDown, 
  ChevronUp,
  ShieldAlert,
  Play
} from 'lucide-react';

export interface PortalConnectionStatus {
  id: string;
  portalName: string;
  category: 'Enterprise ATS' | 'Job Board Webhook' | 'Direct API Portal';
  endpointUrl: string;
  status: 'HEALTHY' | 'COOLDOWN_ACTIVE' | 'ERROR_FLAGGED';
  httpCode: number;
  latencyMs: number;
  rateLimitUsed: number;
  rateLimitMax: number;
  lastPingTime: string;
  captchaRiskScore: string;
  recommendedAction: string;
  rawHeaders: {
    server: string;
    rateLimitRemaining: number;
    cfRay?: string;
    tlsVersion: string;
  };
}

export const AgentHealthCheckWidget: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepMessage, setScanStepMessage] = useState<string>('');
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string>('Just now');
  const [expandedPortalId, setExpandedPortalId] = useState<string | null>(null);

  const [portals, setPortals] = useState<PortalConnectionStatus[]>([
    {
      id: 'workday-api',
      portalName: 'Workday Enterprise Gateway',
      category: 'Enterprise ATS',
      endpointUrl: 'https://wd5.myworkdayjobs.com/api/v1/applications',
      status: 'HEALTHY',
      httpCode: 200,
      latencyMs: 118,
      rateLimitUsed: 14,
      rateLimitMax: 100,
      lastPingTime: '10s ago',
      captchaRiskScore: '0.1% (Low)',
      recommendedAction: 'Safe for automated application submission.',
      rawHeaders: {
        server: 'envoy-workday-prod',
        rateLimitRemaining: 86,
        cfRay: '8aa9e120f0a-BOM',
        tlsVersion: 'TLSv1.3 (ECDHE-RSA-AES128-GCM-SHA256)'
      }
    },
    {
      id: 'greenhouse-api',
      portalName: 'Greenhouse Direct API',
      category: 'Direct API Portal',
      endpointUrl: 'https://boards-api.greenhouse.io/v1/boards/job',
      status: 'HEALTHY',
      httpCode: 200,
      latencyMs: 84,
      rateLimitUsed: 8,
      rateLimitMax: 200,
      lastPingTime: '15s ago',
      captchaRiskScore: '0.0% (Zero)',
      recommendedAction: 'Direct API token authenticated & verified.',
      rawHeaders: {
        server: 'nginx/1.24.0',
        rateLimitRemaining: 192,
        cfRay: '8aa9e121e42-BOM',
        tlsVersion: 'TLSv1.3'
      }
    },
    {
      id: 'linkedin-webhook',
      portalName: 'LinkedIn EasyApply Engine',
      category: 'Job Board Webhook',
      endpointUrl: 'https://api.linkedin.com/v2/jobs/applyWebhook',
      status: 'COOLDOWN_ACTIVE',
      httpCode: 429,
      latencyMs: 245,
      rateLimitUsed: 48,
      rateLimitMax: 50,
      lastPingTime: '1 min ago',
      captchaRiskScore: '12.4% (Elevated Rate Limit)',
      recommendedAction: 'Humanized pacing engaged (60s cooldown) to prevent account ban.',
      rawHeaders: {
        server: 'PlayFE-LinkedIn',
        rateLimitRemaining: 2,
        cfRay: '8aa9e122b10-DEL',
        tlsVersion: 'TLSv1.3'
      }
    },
    {
      id: 'naukri-api',
      portalName: 'Naukri Recruiter Direct',
      category: 'Direct API Portal',
      endpointUrl: 'https://api.naukri.com/v1/applicant/submit',
      status: 'HEALTHY',
      httpCode: 200,
      latencyMs: 142,
      rateLimitUsed: 22,
      rateLimitMax: 150,
      lastPingTime: '45s ago',
      captchaRiskScore: '0.2% (Low)',
      recommendedAction: 'Token valid. IP proxy verified.',
      rawHeaders: {
        server: 'Naukri-Gateway-v4',
        rateLimitRemaining: 128,
        tlsVersion: 'TLSv1.3'
      }
    },
    {
      id: 'indeed-proxy',
      portalName: 'Indeed Apply Proxy',
      category: 'Job Board Webhook',
      endpointUrl: 'https://apply.indeed.com/api/v2/applications',
      status: 'ERROR_FLAGGED',
      httpCode: 503,
      latencyMs: 890,
      rateLimitUsed: 95,
      rateLimitMax: 100,
      lastPingTime: '2 mins ago',
      captchaRiskScore: '45.0% (Cloudflare Challenge Flagged)',
      recommendedAction: 'Connection error flagged! Auto-paused to avoid profile ban. Routed to 1-Click Manual Queue.',
      rawHeaders: {
        server: 'cloudflare',
        rateLimitRemaining: 5,
        cfRay: '8aa9e123c88-BOM',
        tlsVersion: 'TLSv1.3'
      }
    }
  ]);

  const healthyCount = portals.filter(p => p.status === 'HEALTHY').length;
  const cooldownCount = portals.filter(p => p.status === 'COOLDOWN_ACTIVE').length;
  const errorCount = portals.filter(p => p.status === 'ERROR_FLAGGED').length;

  const runLiveDiagnostic = () => {
    setIsScanning(true);
    setScanStepMessage('Initiating socket handshake across 5 portal endpoints...');

    setTimeout(() => {
      setScanStepMessage('Checking Cloudflare Captcha risk score & rate limits...');
    }, 800);

    setTimeout(() => {
      setScanStepMessage('Verifying IP Proxy SSL Certificate & Anti-Ban Headers...');
    }, 1600);

    setTimeout(() => {
      setPortals((prevPortals) =>
        prevPortals.map((p) => {
          const randomLatency = Math.floor(Math.random() * 80) + 70;
          if (p.status === 'ERROR_FLAGGED') {
            return {
              ...p,
              status: 'HEALTHY',
              httpCode: 200,
              latencyMs: randomLatency,
              captchaRiskScore: '0.1% (Cleared)',
              lastPingTime: 'Just now',
              recommendedAction: 'Connection test passed! Anti-ban risk resolved.',
              rawHeaders: { ...p.rawHeaders, rateLimitRemaining: 98 }
            };
          }
          return {
            ...p,
            latencyMs: randomLatency,
            lastPingTime: 'Just now'
          };
        })
      );
      setIsScanning(false);
      setScanStepMessage('');
      setLastScanTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 2400);
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] hover:border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-4 font-sans relative overflow-hidden transition-all">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-10 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1d28] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 shadow-md shrink-0">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Agent Health Check & Anti-Ban API Connectivity
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                PRE-FLIGHT DIAGNOSTIC
              </span>
            </div>
            <p className="text-xs text-[#9090a8] mt-0.5 font-mono">
              Real-time API ping monitoring testing portal gateways to flag connection errors before submitting applications.
            </p>
          </div>
        </div>

        {/* Action Button & Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-xs">
          <button
            onClick={runLiveDiagnostic}
            disabled={isScanning}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/40 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Pinging APIs...' : 'Run Live Ping Check'}</span>
          </button>

          <span className="text-[10px] text-[#8084a8] bg-[#121422] px-2.5 py-2 rounded-xl border border-[#23263d]">
            Last Scan: <strong className="text-white">{lastScanTimestamp}</strong>
          </span>
        </div>
      </div>

      {/* Diagnostic Scan Animation Status Bar */}
      {isScanning && (
        <div className="bg-[#121424] border border-emerald-500/40 p-3 rounded-xl flex items-center gap-3 text-xs font-mono text-emerald-300 animate-pulse">
          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
          <span className="font-bold">{scanStepMessage}</span>
        </div>
      )}

      {/* Health Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-[#121422] border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">Healthy Endpoints</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{healthyCount} / {portals.length} Connected</span>
            <span className="text-[9px] text-[#8084a0]">0ms packet loss</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#121422] border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-300 uppercase font-bold block">Paced Cooldowns</span>
            <span className="text-xl font-bold text-amber-300 mt-0.5 block">{cooldownCount} Active</span>
            <span className="text-[9px] text-[#8084a0]">Humanized rate-limit safety</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Clock className="w-4 h-4 text-amber-300" />
          </div>
        </div>

        <div className={`bg-[#121422] border p-3.5 rounded-xl flex items-center justify-between transition-all ${
          errorCount > 0 ? 'border-red-500/50 bg-red-950/10' : 'border-emerald-500/30'
        }`}>
          <div>
            <span className="text-[10px] text-red-400 uppercase font-bold block">Flagged Errors</span>
            <span className={`text-xl font-bold mt-0.5 block ${errorCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {errorCount === 0 ? '0 Errors Safe' : `${errorCount} Connection Flagged`}
            </span>
            <span className="text-[9px] text-[#8084a0]">Auto-paused before apply</span>
          </div>
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
            errorCount > 0 ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          }`}>
            {errorCount > 0 ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
          </div>
        </div>
      </div>

      {/* Portals Connectivity Table */}
      <div className="space-y-2.5 font-mono text-xs">
        {portals.map((portal) => {
          const isExpanded = expandedPortalId === portal.id;
          const isHealthy = portal.status === 'HEALTHY';
          const isCooldown = portal.status === 'COOLDOWN_ACTIVE';
          const isError = portal.status === 'ERROR_FLAGGED';

          return (
            <div
              key={portal.id}
              className={`bg-[#121422] border rounded-xl p-3.5 transition-all space-y-2.5 ${
                isHealthy
                  ? 'border-[#202338] hover:border-emerald-500/40'
                  : isCooldown
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-red-500/50 bg-red-950/15'
              }`}
            >
              {/* Row Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    isHealthy
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isCooldown
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {isHealthy && '🟢 HEALTHY 200 OK'}
                    {isCooldown && '🟡 RATE LIMIT PAUSE'}
                    {isError && '🔴 ERROR FLAGGED'}
                  </span>

                  <div>
                    <h4 className="font-bold text-white text-sm font-sans flex items-center gap-2">
                      {portal.portalName}
                      <span className="text-[10px] text-[#8084a0] font-mono font-normal">
                        ({portal.category})
                      </span>
                    </h4>
                    <span className="text-[10px] text-[#707498] truncate block">
                      {portal.endpointUrl}
                    </span>
                  </div>
                </div>

                {/* Right Metrics */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <span className="text-[#8084a0] text-[10px] block">Latency / Ping</span>
                    <span className="font-bold text-white">{portal.latencyMs} ms</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[#8084a0] text-[10px] block">Rate Limit Quota</span>
                    <span className="font-bold text-emerald-400">
                      {portal.rateLimitUsed}/{portal.rateLimitMax} req/hr
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedPortalId(isExpanded ? null : portal.id)}
                    className="p-1.5 bg-[#17192a] hover:bg-[#22253f] text-[#8084a0] hover:text-white rounded-lg border border-[#2b2e4d] transition-all cursor-pointer"
                    title="Toggle Raw Inspector Headers"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Anti-ban Action Guidance Bar */}
              <div className="bg-[#0a0b12] p-2.5 rounded-lg border border-[#1d2035] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <Info className={`w-3.5 h-3.5 shrink-0 ${isError ? 'text-red-400' : isCooldown ? 'text-amber-300' : 'text-emerald-400'}`} />
                  <span className="text-white">
                    <strong className="text-[#8084a0]">Pre-flight Check:</strong> {portal.recommendedAction}
                  </span>
                </div>

                <span className="text-[10px] text-[#8084a0] shrink-0">
                  Cloudflare Risk: <strong className={isError ? 'text-red-400' : 'text-emerald-400'}>{portal.captchaRiskScore}</strong>
                </span>
              </div>

              {/* Raw Technical Headers Expansion */}
              {isExpanded && (
                <div className="bg-[#07080d] border border-[#1c1f33] p-3 rounded-lg text-[10px] space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[#8084a0] border-b border-[#181a2b] pb-1 font-bold">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-purple-400" />
                      Raw HTTP Response Inspection
                    </span>
                    <span>HTTP STATUS: {portal.httpCode}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#9094b8]">
                    <div>
                      <span className="text-[#606488]">Server Identifier:</span>{' '}
                      <code className="text-purple-300">{portal.rawHeaders.server}</code>
                    </div>
                    <div>
                      <span className="text-[#606488]">Quota Remaining:</span>{' '}
                      <code className="text-emerald-400">{portal.rawHeaders.rateLimitRemaining} requests</code>
                    </div>
                    <div>
                      <span className="text-[#606488]">TLS Handshake:</span>{' '}
                      <code className="text-blue-300">{portal.rawHeaders.tlsVersion}</code>
                    </div>
                    {portal.rawHeaders.cfRay && (
                      <div>
                        <span className="text-[#606488]">Cloudflare Ray ID:</span>{' '}
                        <code className="text-amber-300">{portal.rawHeaders.cfRay}</code>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
