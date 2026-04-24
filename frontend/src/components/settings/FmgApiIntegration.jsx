import { useState } from 'react';
import clsx from 'clsx';
import { Copy, CheckCircle2, ExternalLink, Terminal, Key, Server, Shield, AlertCircle } from 'lucide-react';
import { Tile } from '../common/Tile';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { toast } from '../common/Toast';

const ENV_TEMPLATE = `# FortiManager connection
FMG_HOST=fmg.corp.local
FMG_USERNAME=api-readonly
FMG_PASSWORD=change-me-in-railway-secrets
FMG_DEFAULT_ADOM=root
FMG_INSECURE_TLS=false

# Switch off mock data to hit the real FMG
USE_MOCK_DATA=false

# Supabase auth (required when not in demo mode)
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
DEV_SKIP_AUTH=false`;

const CURL_LOGIN = `curl -sk https://$FMG_HOST/jsonrpc \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "exec",
    "params": [{
      "url": "/sys/login/user",
      "data": { "user": "'$FMG_USERNAME'", "passwd": "'$FMG_PASSWORD'" }
    }],
    "id": 1
  }'
# Returns { "session": "<session-id>" }`;

const CURL_LIST = `curl -sk https://$FMG_HOST/jsonrpc \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "get",
    "params": [{ "url": "/dvmdb/adom/root/device" }],
    "session": "'$SESSION'",
    "id": 2
  }'
# Returns the device list as { "result": [{ "data": [...] }] }`;

const CURL_LOGOUT = `curl -sk https://$FMG_HOST/jsonrpc \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "exec",
    "params": [{ "url": "/sys/logout" }],
    "session": "'$SESSION'",
    "id": 3
  }'`;

function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.error('Copy failed'));
  };
  return (
    <div className="rounded-md overflow-hidden border border-surface-600/60 bg-surface-950">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-600/60 bg-surface-900">
        <div className="flex items-center gap-2">
          <Terminal className="h-3 w-3 text-ink-400" strokeWidth={1.7} />
          <span className="text-[10.5px] text-ink-400 uppercase tracking-wider">{label}</span>
        </div>
        <button
          onClick={onCopy}
          className="text-[11px] text-ink-400 hover:text-ink-200 transition inline-flex items-center gap-1"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-400" strokeWidth={2} />
              <span className="text-emerald-400">copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" strokeWidth={1.8} />
              <span>copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="text-[11px] font-mono leading-relaxed p-3 text-ink-200 overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 h-6 w-6 rounded-full bg-accent-soft text-sky-200 text-[11px] font-semibold grid place-items-center mt-0.5">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-semibold text-ink-50 mb-1">{title}</h4>
        <div className="text-[12px] text-ink-200 leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1 text-[11.5px] font-medium rounded transition',
        active ? 'bg-surface-700 text-ink-50' : 'text-ink-400 hover:text-ink-200'
      )}
    >
      {children}
    </button>
  );
}

export function FmgApiIntegration() {
  const [tab, setTab] = useState('overview');

  return (
    <Tile
      title="FortiManager API integration"
      subtitle="connect this console to a real FMG instance"
      icon={Key}
      action={
        <div className="inline-flex bg-surface-800 rounded-md p-0.5 gap-0.5 ring-1 ring-surface-600/60">
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>Overview</TabButton>
          <TabButton active={tab === 'setup'}    onClick={() => setTab('setup')}>Setup</TabButton>
          <TabButton active={tab === 'curl'}     onClick={() => setTab('curl')}>Raw API</TabButton>
          <TabButton active={tab === 'perms'}    onClick={() => setTab('perms')}>Permissions</TabButton>
        </div>
      }
    >
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="rounded-md bg-sky-500/5 border border-sky-500/20 p-3 text-[12px] text-ink-200 leading-relaxed">
            <div className="flex items-start gap-2">
              <Shield className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" strokeWidth={1.8} />
              <div>
                You are currently running in <Badge variant="warning">demo mode</Badge> with fixture data.
                To connect to a live FortiManager, flip <code className="code">USE_MOCK_DATA=false</code> in your Railway environment
                and provide the FMG credentials below. Mutations are blocked in demo.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-800 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
                <span className="text-[12px] font-semibold">How the backend connects</span>
              </div>
              <p className="text-[11.5px] text-ink-200 leading-relaxed">
                This console proxies requests to FMG's JSON-RPC API at <code className="code">/jsonrpc</code>. It
                handles session lifecycle (login, keep-alive, logout) server-side and never exposes credentials
                to the browser.
              </p>
            </div>
            <div className="bg-surface-800 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
                <span className="text-[12px] font-semibold">Authentication model</span>
              </div>
              <p className="text-[11.5px] text-ink-200 leading-relaxed">
                FMG session IDs from <code className="code">/sys/login/user</code> are cached with transparent
                re-auth on 401. User-facing access is gated by Supabase (or JWT) — so console users aren't
                the same as FMG admins.
              </p>
            </div>
          </div>

          <a
            href="https://docs.fortinet.com/document/fortimanager/8.0.0/api-best-practices"
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] text-sky-300 hover:text-sky-200 transition"
          >
            <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
            Fortinet API best practices reference
          </a>
        </div>
      )}

      {tab === 'setup' && (
        <div className="space-y-5">
          <Step n={1} title="Create an API user in FortiManager">
            <p>In FMG: <span className="code">System Settings → Admin → Administrators → + Create New</span></p>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-ink-400 text-[11.5px]">
              <li>User name: <span className="code">api-readonly</span></li>
              <li>Type: <span className="code">Local</span> (or <span className="code">RADIUS</span> if integrated)</li>
              <li>Admin profile: custom read-only (see Permissions tab)</li>
              <li>Trusted hosts: restrict to the Railway egress IP or deploy IP range</li>
              <li>JSON API Access: <span className="code">Read-Write</span> (needed for session, not for objects)</li>
            </ul>
          </Step>

          <Step n={2} title="Set Railway environment variables">
            <p>In your Railway service → <span className="code">Variables</span>, paste the template below. Replace placeholders with your values.</p>
            <CodeBlock code={ENV_TEMPLATE} label=".env template" />
            <p className="text-[11px] text-ink-400 leading-relaxed">
              <AlertCircle className="h-3 w-3 inline-block mr-1 -mt-0.5 text-amber-400" strokeWidth={1.8} />
              Railway encrypts variables at rest. Never commit <span className="code">FMG_PASSWORD</span> to git.
              Rotate the password if the repo was ever public.
            </p>
          </Step>

          <Step n={3} title="Restart the Railway service">
            <p>
              Railway auto-restarts on environment-variable change. Watch logs for
              <span className="code mx-1">fmg-console backend listening</span> and
              <span className="code mx-1">mock: false</span> — that confirms you're hitting real FMG.
            </p>
          </Step>

          <Step n={4} title="Verify the connection">
            <p>Hit the health endpoint:</p>
            <CodeBlock code={`curl https://fmg.tannerharrison.com/api/health`} label="verify" />
            <p>Expected response: <span className="code">{`{ "ok": true, "mock": false, "adoms": N }`}</span></p>
          </Step>
        </div>
      )}

      {tab === 'curl' && (
        <div className="space-y-4">
          <p className="text-[12px] text-ink-200 leading-relaxed">
            FMG's JSON-RPC API is a single endpoint. All calls are POST, all bodies include an <span className="code">id</span> for
            correlation, and any call after the initial login must include the <span className="code">session</span> token.
          </p>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-ink-400 mb-2">1. Log in, capture session</div>
            <CodeBlock code={CURL_LOGIN} label="login" />
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-ink-400 mb-2">2. Make an API call</div>
            <CodeBlock code={CURL_LIST} label="list devices" />
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-widest text-ink-400 mb-2">3. Log out when done</div>
            <CodeBlock code={CURL_LOGOUT} label="logout" />
          </div>

          <div className="rounded-md bg-amber-500/5 border border-amber-500/20 p-3 text-[11.5px] text-amber-200 leading-relaxed">
            <AlertCircle className="h-3.5 w-3.5 inline-block mr-1 -mt-0.5" strokeWidth={1.8} />
            FMG session timeout defaults to 5 minutes of idle. The console's <span className="code">fmgClient.js</span> layer
            handles transparent re-auth — if you see repeated logins in audit, that's normal under low traffic.
          </div>
        </div>
      )}

      {tab === 'perms' && (
        <div className="space-y-4">
          <p className="text-[12px] text-ink-200 leading-relaxed">
            The console only needs read access to most objects. Create a custom admin profile in FMG with the
            minimum set below — don't use <span className="code">Super_User</span>.
          </p>

          <div className="bg-surface-800 rounded-md overflow-hidden">
            <table className="w-full text-left text-[11.5px]">
              <thead className="text-ink-400 text-[10.5px] border-b border-surface-600/60">
                <tr>
                  <th className="py-2 px-3 font-medium">FMG object</th>
                  <th className="py-2 px-3 font-medium">Required access</th>
                  <th className="py-2 px-3 font-medium">Used for</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800">
                <tr><td className="py-1.5 px-3 font-mono text-[10.5px]">Device Manager</td>            <td className="py-1.5 px-3"><Badge variant="info">Read</Badge></td>         <td className="py-1.5 px-3 text-ink-400">Fleet, HA, drift</td></tr>
                <tr><td className="py-1.5 px-3 font-mono text-[10.5px]">Policy &amp; Objects</td>       <td className="py-1.5 px-3"><Badge variant="info">Read</Badge></td>         <td className="py-1.5 px-3 text-ink-400">Packages, rules, objects, profiles</td></tr>
                <tr><td className="py-1.5 px-3 font-mono text-[10.5px]">ADOM Switch</td>                <td className="py-1.5 px-3"><Badge variant="info">Read</Badge></td>         <td className="py-1.5 px-3 text-ink-400">Multi-ADOM support</td></tr>
                <tr><td className="py-1.5 px-3 font-mono text-[10.5px]">System Settings</td>            <td className="py-1.5 px-3"><Badge variant="neutral">None</Badge></td>      <td className="py-1.5 px-3 text-ink-400">Not used</td></tr>
                <tr><td className="py-1.5 px-3 font-mono text-[10.5px]">Install Wizard</td>             <td className="py-1.5 px-3"><Badge variant="warning">Read-Write</Badge></td> <td className="py-1.5 px-3 text-ink-400">Only if you enable push/install from console</td></tr>
                <tr><td className="py-1.5 px-3 font-mono text-[10.5px]">Script</td>                     <td className="py-1.5 px-3"><Badge variant="warning">Read-Write</Badge></td> <td className="py-1.5 px-3 text-ink-400">Only if you enable script execution</td></tr>
                <tr><td className="py-1.5 px-3 font-mono text-[10.5px]">FortiGuard</td>                 <td className="py-1.5 px-3"><Badge variant="info">Read</Badge></td>         <td className="py-1.5 px-3 text-ink-400">CVE / IPS signature metadata</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-md bg-emerald-500/5 border border-emerald-500/20 p-3 text-[11.5px] text-ink-200 leading-relaxed">
            <Shield className="h-3.5 w-3.5 inline-block mr-1 -mt-0.5 text-emerald-400" strokeWidth={1.8} />
            <span className="font-medium text-emerald-300">Read-only recommended.</span> Keep the API profile read-only and use
            a separate elevated user for install/push operations triggered by humans. This way a compromised
            console credential can't change policy.
          </div>
        </div>
      )}
    </Tile>
  );
}
