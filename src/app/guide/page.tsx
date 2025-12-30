'use client';

import { useState } from 'react';
import Link from 'next/link';

// Guide Section Data
const sections = [
  {
    id: 'overview',
    title: 'Platform Overview',
    icon: '🎯',
    articles: [
      {
        id: 'what-is-sales',
        title: 'What is PROVENIQ Sales?',
        content: `
          <p>PROVENIQ Sales is the enterprise sales command center for the PROVENIQ ecosystem. It's where deals are qualified, tracked, and closed with full policy enforcement and audit trail.</p>
          
          <h3>Core Capabilities</h3>
          <ul>
            <li><strong>Deal Pipeline Management</strong> — Track opportunities from first touch to closed-won with stage-gated progression</li>
            <li><strong>Policy Enforcement Engine</strong> — Automated compliance checks with configurable rules and override workflows</li>
            <li><strong>MEDDPICC Scoring</strong> — Quantified deal health metrics based on evidence, not gut feel</li>
            <li><strong>DRI Accountability</strong> — Every deal has a single Directly Responsible Individual with clear escalation paths</li>
            <li><strong>Full Audit Trail</strong> — Every action logged, immutable, and queryable</li>
          </ul>
          
          <div class="callout info">
            <strong>💡 Pro Tip</strong>
            <p>Use <kbd>⌘K</kbd> anywhere in the app to open the command palette for quick navigation.</p>
          </div>
        `,
      },
      {
        id: 'architecture',
        title: 'System Architecture',
        content: `
          <p>PROVENIQ Sales is built on a modern stack designed for speed, reliability, and auditability.</p>
          
          <h3>Technology Stack</h3>
          <table>
            <tr><td><strong>Frontend</strong></td><td>Next.js 16, React 19, TypeScript</td></tr>
            <tr><td><strong>Backend</strong></td><td>Next.js API Routes, Prisma ORM</td></tr>
            <tr><td><strong>Database</strong></td><td>Supabase PostgreSQL</td></tr>
            <tr><td><strong>Authentication</strong></td><td>Firebase Auth (shared with PROVENIQ ecosystem)</td></tr>
            <tr><td><strong>Deployment</strong></td><td>Vercel / Railway</td></tr>
          </table>
          
          <h3>Integration Points</h3>
          <ul>
            <li><strong>PROVENIQ Core</strong> — Asset valuations, fraud scoring, PAID registry</li>
            <li><strong>PROVENIQ Memory</strong> — Immutable event logging for audit trail</li>
            <li><strong>Firebase</strong> — Unified identity across all PROVENIQ apps</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: 'deals',
    title: 'Deal Management',
    icon: '💼',
    articles: [
      {
        id: 'pipeline-stages',
        title: 'Pipeline Stages',
        content: `
          <p>Every deal progresses through defined stages. The enforcement engine validates requirements before allowing advancement.</p>
          
          <div class="stage-list">
            <div class="stage" data-color="gray">
              <span class="stage-name">INTAKE</span>
              <span class="stage-desc">New opportunity entered into system</span>
            </div>
            <div class="stage" data-color="blue">
              <span class="stage-name">QUALIFIED</span>
              <span class="stage-desc">Budget, authority, need, timeline confirmed</span>
            </div>
            <div class="stage" data-color="purple">
              <span class="stage-name">DISCOVERY</span>
              <span class="stage-desc">Deep needs analysis complete</span>
            </div>
            <div class="stage" data-color="pink">
              <span class="stage-name">SOLUTION FIT</span>
              <span class="stage-desc">Technical requirements mapped to solution</span>
            </div>
            <div class="stage" data-color="orange">
              <span class="stage-name">POV / TRIAL</span>
              <span class="stage-desc">Proof of value or pilot in progress</span>
            </div>
            <div class="stage" data-color="yellow">
              <span class="stage-name">PROPOSAL</span>
              <span class="stage-desc">Commercial offer submitted</span>
            </div>
            <div class="stage" data-color="lime">
              <span class="stage-name">NEGOTIATION</span>
              <span class="stage-desc">Legal and commercial terms in discussion</span>
            </div>
            <div class="stage" data-color="green">
              <span class="stage-name">COMMIT</span>
              <span class="stage-desc">Verbal commitment received, paperwork in flight</span>
            </div>
            <div class="stage" data-color="emerald">
              <span class="stage-name">CLOSED WON</span>
              <span class="stage-desc">Contract signed, revenue recognized</span>
            </div>
            <div class="stage" data-color="red">
              <span class="stage-name">CLOSED LOST</span>
              <span class="stage-desc">Opportunity ended — requires post-mortem</span>
            </div>
          </div>
          
          <div class="callout warning">
            <strong>⚠️ Stage Gate Enforcement</strong>
            <p>You cannot advance a deal unless all required fields and evidence are attached. The system will block advancement and tell you what's missing.</p>
          </div>
        `,
      },
      {
        id: 'meddpicc',
        title: 'MEDDPICC Scoring',
        content: `
          <p>Every deal is scored using the MEDDPICC framework. Scores update automatically based on evidence attached to the deal record.</p>
          
          <table class="meddpicc-table">
            <thead>
              <tr>
                <th>Letter</th>
                <th>Category</th>
                <th>Weight</th>
                <th>What It Measures</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>M</strong></td><td>Metrics</td><td>15%</td><td>Quantified business impact the customer expects</td></tr>
              <tr><td><strong>E</strong></td><td>Economic Buyer</td><td>15%</td><td>Person with budget authority identified and engaged</td></tr>
              <tr><td><strong>D</strong></td><td>Decision Criteria</td><td>10%</td><td>How the customer will evaluate solutions</td></tr>
              <tr><td><strong>D</strong></td><td>Decision Process</td><td>10%</td><td>Steps and timeline to reach a decision</td></tr>
              <tr><td><strong>P</strong></td><td>Paper Process</td><td>10%</td><td>Legal, procurement, and contract requirements</td></tr>
              <tr><td><strong>I</strong></td><td>Identify Pain</td><td>15%</td><td>Business problems driving the initiative</td></tr>
              <tr><td><strong>C</strong></td><td>Champion</td><td>15%</td><td>Internal advocate with influence and access</td></tr>
              <tr><td><strong>C</strong></td><td>Competition</td><td>10%</td><td>Alternatives being considered</td></tr>
            </tbody>
          </table>
          
          <h3>Score Thresholds</h3>
          <div class="threshold-grid">
            <div class="threshold red">
              <span class="threshold-range">0–40</span>
              <span class="threshold-label">At Risk</span>
              <span class="threshold-action">Immediate action required</span>
            </div>
            <div class="threshold yellow">
              <span class="threshold-range">41–70</span>
              <span class="threshold-label">Developing</span>
              <span class="threshold-action">On track but gaps remain</span>
            </div>
            <div class="threshold green">
              <span class="threshold-range">71–100</span>
              <span class="threshold-label">Strong</span>
              <span class="threshold-action">Well-qualified opportunity</span>
            </div>
          </div>
        `,
      },
      {
        id: 'creating-deals',
        title: 'Creating & Editing Deals',
        content: `
          <h3>Creating a New Deal</h3>
          <ol>
            <li>Click <strong>+ New Deal</strong> in the header or press <kbd>⌘N</kbd></li>
            <li>Enter the deal name and select the account</li>
            <li>Set the estimated value and close date</li>
            <li>Assign the DRI (yourself by default)</li>
            <li>Click <strong>Create Deal</strong></li>
          </ol>
          
          <h3>Required Fields by Stage</h3>
          <p>As deals progress, more fields become required:</p>
          <ul>
            <li><strong>QUALIFIED</strong> — Account, Value, Close Date, DRI</li>
            <li><strong>DISCOVERY</strong> — Pain points, Stakeholder map</li>
            <li><strong>PROPOSAL</strong> — Pricing approved, Legal terms drafted</li>
            <li><strong>CLOSED WON</strong> — Signed contract uploaded</li>
            <li><strong>CLOSED LOST</strong> — Loss reason documented</li>
          </ul>
          
          <div class="callout info">
            <strong>💡 Evidence Uploads</strong>
            <p>Attach call recordings, meeting notes, and emails to MEDDPICC categories to automatically increase your deal score.</p>
          </div>
        `,
      },
    ],
  },
  {
    id: 'enforcement',
    title: 'Policy Enforcement',
    icon: '🛡️',
    articles: [
      {
        id: 'how-enforcement-works',
        title: 'How Enforcement Works',
        content: `
          <p>The Enforcement Gateway is the policy engine governing all deal actions. Every action is authorized against configurable rules before execution.</p>
          
          <h3>Authorization Flow</h3>
          <div class="flow-diagram">
            <div class="flow-step">
              <span class="flow-number">1</span>
              <span class="flow-text">User initiates action (e.g., advance deal stage)</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <span class="flow-number">2</span>
              <span class="flow-text">Gateway loads signals (MEDDPICC score, LMS cert, DRI status)</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <span class="flow-number">3</span>
              <span class="flow-text">Policy engine evaluates rules against signals</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <span class="flow-number">4</span>
              <span class="flow-text">Decision returned: <code>ALLOWED</code>, <code>DENIED</code>, or <code>REQUIRES_OVERRIDE</code></span>
            </div>
          </div>
          
          <h3>Signal Types</h3>
          <ul>
            <li><strong>MEDDPICC Score</strong> — Deal qualification health (0–100)</li>
            <li><strong>LMS Certification</strong> — Has the rep completed required training?</li>
            <li><strong>DRI Score</strong> — Account owner's performance metric</li>
            <li><strong>Deal Freeze Status</strong> — Is the deal currently frozen?</li>
          </ul>
        `,
      },
      {
        id: 'freeze-unfreeze',
        title: 'Freezing & Unfreezing Deals',
        content: `
          <p>Frozen deals cannot be modified until explicitly unfrozen by an authorized user.</p>
          
          <h3>When Deals Get Frozen</h3>
          <ul>
            <li>Compliance hold pending legal review</li>
            <li>Fraud investigation triggered</li>
            <li>Executive review required for large deals</li>
            <li>Customer requested pause</li>
          </ul>
          
          <h3>Who Can Freeze/Unfreeze</h3>
          <table>
            <tr><td><strong>Deal Desk (DD)</strong></td><td>Can freeze and unfreeze any deal</td></tr>
            <tr><td><strong>CRO</strong></td><td>Full freeze/unfreeze authority</td></tr>
            <tr><td><strong>Founder</strong></td><td>Unrestricted</td></tr>
          </table>
          
          <div class="callout warning">
            <strong>⚠️ Audit Trail</strong>
            <p>All freeze/unfreeze actions are permanently logged with actor ID, timestamp, and reason. These records cannot be modified or deleted.</p>
          </div>
        `,
      },
      {
        id: 'overrides',
        title: 'Override Requests',
        content: `
          <p>When policy blocks an action, you can request an override. Overrides require justification and approval from a higher authority.</p>
          
          <h3>Override Request Flow</h3>
          <ol>
            <li><strong>Submit Request</strong> — Include business justification and expected impact</li>
            <li><strong>Manager Review</strong> — SLA: 4 hours (standard), 1 hour (urgent)</li>
            <li><strong>Decision</strong> — Approve, deny, or escalate to CRO</li>
            <li><strong>Time-Limited Approval</strong> — Overrides auto-expire after 72 hours</li>
          </ol>
          
          <h3>Override Levels</h3>
          <table>
            <tr><td><strong>Standard</strong></td><td>Manager approval sufficient</td></tr>
            <tr><td><strong>Elevated</strong></td><td>Requires CRO approval</td></tr>
            <tr><td><strong>Founder</strong></td><td>Only Founder can approve (rare)</td></tr>
          </table>
        `,
      },
    ],
  },
  {
    id: 'roles',
    title: 'Roles & Permissions',
    icon: '👥',
    articles: [
      {
        id: 'role-matrix',
        title: 'Role Permission Matrix',
        content: `
          <p>PROVENIQ Sales uses role-based access control (RBAC). Each role has specific permissions.</p>
          
          <table class="permissions-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Key</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Account Executive</strong></td>
                <td><code>AE</code></td>
                <td>Create deals, update owned deals, request overrides</td>
              </tr>
              <tr>
                <td><strong>Sales Manager</strong></td>
                <td><code>SM</code></td>
                <td>All AE + approve overrides, view team deals</td>
              </tr>
              <tr>
                <td><strong>Deal Desk</strong></td>
                <td><code>DD</code></td>
                <td>All SM + freeze/unfreeze, policy configuration</td>
              </tr>
              <tr>
                <td><strong>CRO</strong></td>
                <td><code>CRO</code></td>
                <td>Full access, founder override approval</td>
              </tr>
              <tr>
                <td><strong>Founder</strong></td>
                <td><code>FOUNDER</code></td>
                <td>Unrestricted — can override any policy</td>
              </tr>
            </tbody>
          </table>
          
          <div class="callout info">
            <strong>💡 Role Elevation</strong>
            <p>Temporary role elevations require documented justification and auto-expire after 24 hours.</p>
          </div>
        `,
      },
      {
        id: 'dri',
        title: 'DRI (Directly Responsible Individual)',
        content: `
          <p>Every deal has exactly one DRI — the person accountable for its outcome.</p>
          
          <h3>DRI Responsibilities</h3>
          <ul>
            <li>Owns all deal updates and communications</li>
            <li>Responsible for MEDDPICC evidence collection</li>
            <li>Accountable for forecast accuracy</li>
            <li>First escalation point for issues</li>
          </ul>
          
          <h3>DRI Score</h3>
          <p>Each DRI has a performance score (0–100) based on:</p>
          <ul>
            <li>Forecast accuracy over last 4 quarters</li>
            <li>Deal progression velocity</li>
            <li>Evidence quality and completeness</li>
            <li>Override request frequency</li>
          </ul>
          
          <h3>DRI Status Indicators</h3>
          <div class="dri-indicators">
            <div class="dri-indicator green">
              <span class="dri-dot"></span>
              <span><strong>Green (75+)</strong> — High performer, trusted</span>
            </div>
            <div class="dri-indicator yellow">
              <span class="dri-dot"></span>
              <span><strong>Yellow (50–74)</strong> — Developing, some oversight needed</span>
            </div>
            <div class="dri-indicator red">
              <span class="dri-dot"></span>
              <span><strong>Red (25–49)</strong> — At risk, increased scrutiny</span>
            </div>
            <div class="dri-indicator black">
              <span class="dri-dot"></span>
              <span><strong>Black (&lt;25)</strong> — Performance improvement plan</span>
            </div>
          </div>
        `,
      },
    ],
  },
  {
    id: 'modules',
    title: 'Sales Operating System',
    icon: '🧭',
    articles: [
      {
        id: 'navigation-map',
        title: 'Navigation Map (Where Everything Lives)',
        content: `
          <p>This guide reflects the current PROVENIQ Sales CRM feature set and routes. Use this as your authoritative map.</p>

          <h3>Primary Routes</h3>
          <table>
            <tr><td><strong>Dashboard</strong></td><td><code>/dashboard</code></td><td>Pipeline overview and key metrics</td></tr>
            <tr><td><strong>Pipeline (Kanban)</strong></td><td><code>/pipeline</code></td><td>Drag/drop deals between stages, quick-view</td></tr>
            <tr><td><strong>Deals (Table)</strong></td><td><code>/deals</code></td><td>Filters, pipeline totals, and deal list</td></tr>
            <tr><td><strong>Deal Workspace</strong></td><td><code>/deals/[id]</code></td><td>Deal detail tabs, MEDDPICC, activity, stakeholders</td></tr>
            <tr><td><strong>Tasks</strong></td><td><code>/tasks</code></td><td>Next steps, reminders, overdue triage</td></tr>
            <tr><td><strong>Contacts</strong></td><td><code>/contacts</code></td><td>Contact records + org chart by account</td></tr>
            <tr><td><strong>Email Hub</strong></td><td><code>/emails</code></td><td>Deal-linked emails + tracking (UI)</td></tr>
            <tr><td><strong>Reports & Forecasting</strong></td><td><code>/reports</code></td><td>Quota, funnel, forecast breakdown, leaderboard</td></tr>
            <tr><td><strong>Pipeline Simulator</strong></td><td><code>/simulator</code></td><td>What-if scenarios for target attainment</td></tr>
            <tr><td><strong>User Guide</strong></td><td><code>/guide</code></td><td>This documentation</td></tr>
          </table>

          <div class="callout info">
            <strong>💡 Fast Navigation</strong>
            <p>Press <kbd>⌘</kbd> + <kbd>K</kbd> (or <kbd>Ctrl</kbd> + <kbd>K</kbd>) to open the command palette, then type the page name (e.g., “Pipeline”, “Tasks”, “Reports”).</p>
          </div>
        `,
      },
      {
        id: 'kanban-pipeline',
        title: 'Kanban Pipeline (Drag/Drop Stages)',
        content: `
          <p>The Pipeline view is the fastest way to run your week. It’s designed for rhythm: scan, triage, act.</p>

          <h3>What You Can Do</h3>
          <ul>
            <li><strong>Drag & drop</strong> deals between stages (optimistic update)</li>
            <li><strong>Quick-view modal</strong> on click for fast context</li>
            <li><strong>Pipeline totals</strong> by stage and overall</li>
            <li><strong>Frozen deals</strong> are visually flagged</li>
          </ul>

          <h3>Where</h3>
          <p><code>/pipeline</code></p>
        `,
      },
      {
        id: 'deal-workspace',
        title: 'Deal Workspace (Tabs + Full Context)',
        content: `
          <p>The Deal page is your single-source workspace for closing. It consolidates the evidence, the people, the actions, and the forecast posture.</p>

          <h3>Tabs</h3>
          <ul>
            <li><strong>Overview</strong> — Stage progression, key metrics, recent activity summary</li>
            <li><strong>Activity</strong> — Timeline-style activity feed (calls/emails/meetings/notes)</li>
            <li><strong>Stakeholders</strong> — Deal stakeholder map (roles in deal)</li>
            <li><strong>MEDDPICC</strong> — Evidence grid + weighted score</li>
            <li><strong>Documents</strong> — Contract/docs area (UI)</li>
          </ul>

          <h3>Built-in “WOW” Panels</h3>
          <ul>
            <li><strong>Win Probability</strong> — A transparent scoring model that explains why the deal is likely/unlikely</li>
            <li><strong>AI Deal Coach</strong> — Next-best-action recommendations based on deal signals</li>
            <li><strong>Deal Velocity</strong> — Highlights stalled deals and stage benchmarks</li>
          </ul>

          <div class="callout warning">
            <strong>⚠️ Truth over vibes</strong>
            <p>PROVENIQ Sales is designed to be evidence-first: MEDDPICC isn’t a slide — it’s enforced deal reality.</p>
          </div>
        `,
      },
      {
        id: 'tasks-system',
        title: 'Task Management (Next Steps Engine)',
        content: `
          <p>Tasks turn the pipeline into execution. The goal is simple: nobody leaves a deal “hot” without a scheduled next action.</p>

          <h3>Highlights</h3>
          <ul>
            <li><strong>Overdue triage</strong> panel for immediate attention</li>
            <li><strong>Task types</strong> (call/email/demo/proposal/follow-up)</li>
            <li><strong>Deal-linked tasks</strong> (jump directly into the deal)</li>
          </ul>

          <h3>Where</h3>
          <p><code>/tasks</code></p>
        `,
      },
      {
        id: 'contacts-orgchart',
        title: 'Contacts & Org Chart (Multi-threading)',
        content: `
          <p>Enterprise deals die when you single-thread. Contacts is designed to make multi-threading unavoidable and obvious.</p>

          <h3>What You Get</h3>
          <ul>
            <li><strong>Role tagging</strong>: Champion, Economic Buyer, Technical Buyer, Blocker</li>
            <li><strong>Sentiment</strong> indicators to highlight risk/support</li>
            <li><strong>Org Chart view</strong> grouped by account</li>
          </ul>

          <h3>Where</h3>
          <p><code>/contacts</code></p>
        `,
      },
      {
        id: 'email-hub',
        title: 'Email Hub (Deal-Linked Communication)',
        content: `
          <p>Email Hub is the workflow layer that ties outbound and inbound communication back to the deal record (UI for now).</p>

          <h3>Highlights</h3>
          <ul>
            <li><strong>Inbox + detail view</strong> for deal-relevant threads</li>
            <li><strong>Open/click tracking</strong> indicators (UI)</li>
            <li><strong>Compose</strong> with optional deal linking</li>
          </ul>

          <h3>Where</h3>
          <p><code>/emails</code></p>
        `,
      },
      {
        id: 'reports-forecasting',
        title: 'Reports & Forecasting (Executive-Grade)',
        content: `
          <p>Forecasting is the fastest way to earn trust inside a sales org. PROVENIQ Sales is built to make forecasting explainable.</p>

          <h3>What’s Included</h3>
          <ul>
            <li><strong>Quota progress</strong> with commit/best-case segmentation</li>
            <li><strong>Pipeline funnel</strong> by stage</li>
            <li><strong>Forecast breakdown</strong> donut chart</li>
            <li><strong>Rep leaderboard</strong> ranked by pipeline</li>
          </ul>

          <h3>Where</h3>
          <p><code>/reports</code></p>
        `,
      },
      {
        id: 'simulator',
        title: 'Pipeline Simulator (What-if Scenarios)',
        content: `
          <p>The Simulator is designed for leadership conversations: “If these 3 deals slip, what happens to the quarter?”</p>

          <h3>What You Can Do</h3>
          <ul>
            <li>Mark deals as <strong>Win</strong>, <strong>Slip</strong>, or <strong>Lose</strong></li>
            <li>Use preset scenarios: <strong>Best Case</strong>, <strong>Conservative</strong>, <strong>Worst Case</strong></li>
            <li>See projected attainment vs target</li>
          </ul>

          <h3>Where</h3>
          <p><code>/simulator</code></p>
        `,
      },
      {
        id: 'notifications',
        title: 'Notifications (Signals, Not Noise)',
        content: `
          <p>Notifications are engineered to be actionable. The goal is to surface risk, not distraction.</p>

          <h3>Examples</h3>
          <ul>
            <li><strong>Deal at risk</strong> — stalled in stage past benchmark</li>
            <li><strong>Task overdue</strong> — next step missed</li>
            <li><strong>Stage change</strong> — progress signals</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: 'wow-features',
    title: 'WOW Features',
    icon: '✨',
    articles: [
      {
        id: 'demo-mode',
        title: 'Demo Mode',
        content: `
          <p>Demo Mode lets you explore all CRM features with realistic sample data. Toggle it in the sidebar to switch between demo and live data.</p>
          <h3>Features</h3>
          <ul>
            <li><strong>Persistent toggle</strong> in sidebar (saved to localStorage)</li>
            <li><strong>Full feature access</strong> with mock data</li>
            <li><strong>Purple badge</strong> indicates demo mode is active</li>
          </ul>
        `,
      },
      {
        id: 'todays-focus',
        title: "Today's Focus Cockpit",
        content: `
          <p>The dashboard cockpit surfaces overdue tasks, deals at risk, and deals closing soon.</p>
          <h3>Sections</h3>
          <ul>
            <li><strong>Overdue Tasks</strong> — missed next steps</li>
            <li><strong>At Risk Deals</strong> — RED/BLACK DRI status</li>
            <li><strong>Closing Soon</strong> — within 14 days</li>
          </ul>
        `,
      },
      {
        id: 'close-plan',
        title: 'Close Plan Generator',
        content: `
          <p>AI-powered close plan based on MEDDPICC gaps and deal stage. Find it in the deal workspace Close Plan tab.</p>
          <h3>Categories</h3>
          <ul>
            <li><strong>Stakeholder</strong> — buyer access</li>
            <li><strong>Commercial</strong> — pricing, ROI</li>
            <li><strong>Technical</strong> — security, integration</li>
            <li><strong>Legal</strong> — contracts, procurement</li>
            <li><strong>Champion</strong> — internal selling</li>
          </ul>
        `,
      },
      {
        id: 'proof-pack',
        title: 'Proof Pack',
        content: `
          <p>Executive deal summary for QBRs and forecast calls. Generate from the deal workspace Proof Pack tab.</p>
          <h3>Includes</h3>
          <ul>
            <li><strong>Deal metrics</strong> — value, stage, close date</li>
            <li><strong>MEDDPICC status</strong> — visual grid</li>
            <li><strong>Key stakeholders</strong> — roles and access</li>
            <li><strong>Executive summary</strong> — AI-generated</li>
          </ul>
          <p>Copy to clipboard or download as PDF.</p>
        `,
      },
    ],
  },
  {
    id: 'reference',
          <p>Demo Mode lets you explore all CRM features with realistic sample data — no database required. Perfect for evaluations, training, and demos.</p>

          <h3>How It Works</h3>
          <ul>
            <li><strong>Toggle in Sidebar</strong> — Switch between Demo and Live data instantly</li>
            <li><strong>Persistent State</strong> — Your preference is saved in localStorage</li>
            <li><strong>Full Feature Access</strong> — Every feature works in demo mode with mock data</li>
          </ul>

          <h3>When to Use Demo Mode</h3>
          <ul>
            <li>First-time exploration of the CRM</li>
            <li>Sales demos to prospects</li>
            <li>Training new team members</li>
            <li>Testing workflows before going live</li>
          </ul>

          <div class="callout info">
            <strong>💡 Pro Tip</strong>
            <p>Demo Mode is indicated by a purple badge on key components. Switch to Live Data when you're ready to work with real deals.</p>
          </div>
        \`,
      },
      {
        id: 'todays-focus',
        title: "Today's Focus Cockpit",
        content: `
          <p>The Today's Focus cockpit is your daily command center. It surfaces the 3 things that matter most: overdue tasks, deals at risk, and upcoming closes.</p>

          <h3>Cockpit Sections</h3>
          <ul>
            <li><strong>Overdue Tasks</strong> — Red-flagged next steps that need immediate attention</li>
            <li><strong>At Risk Deals</strong> — Deals with DRI scores in RED or BLACK status</li>
            <li><strong>Closing Soon</strong> — Deals with close dates in the next 14 days</li>
          </ul>

          <h3>Where</h3>
          <p><code>/dashboard</code> — Top of the dashboard page</p>

          <div class="callout warning">
            <strong>⚠️ Zero Inbox Mindset</strong>
            <p>The goal is to clear your cockpit every day. If overdue tasks pile up, your pipeline is slipping.</p>
          </div>
        \`,
      },
      {
        id: 'close-plan',
        title: 'Close Plan Generator',
        content: `
          <p>The Close Plan Generator creates a personalized checklist for closing each deal based on MEDDPICC gaps, stakeholder coverage, and deal stage.</p>

          <h3>What It Does</h3>
          <ul>
            <li><strong>AI-Powered Analysis</strong> — Scans deal context to identify missing evidence</li>
            <li><strong>Checklist Items</strong> — Categorized by stakeholder, commercial, technical, legal, champion</li>
            <li><strong>Progress Tracking</strong> — Check off items as you complete them</li>
            <li><strong>Export to Tasks</strong> — Turn checklist items into tracked tasks</li>
          </ul>

          <h3>Where</h3>
          <p><code>/deals/[id]</code> → Close Plan tab</p>

          <h3>Categories</h3>
          <table>
            <tr><td>👥 Stakeholder</td><td>Economic buyer access, decision-maker mapping</td></tr>
            <tr><td>💰 Commercial</td><td>Pricing, ROI, business case</td></tr>
            <tr><td>🔧 Technical</td><td>Security review, integration requirements</td></tr>
            <tr><td>📜 Legal</td><td>Contract terms, procurement process</td></tr>
            <tr><td>⭐ Champion</td><td>Internal selling support, coaching</td></tr>
          </table>
        \`,
      },
      {
        id: 'proof-pack',
        title: 'Proof Pack (Executive Deal Summary)',
        content: `
          <p>Proof Pack generates a comprehensive deal snapshot for QBRs, forecast calls, and executive reviews. One click creates a shareable summary with all evidence.</p>

          <h3>What's Included</h3>
          <ul>
            <li><strong>Deal Metrics</strong> — Value, stage, close date, win probability</li>
            <li><strong>MEDDPICC Status</strong> — Visual grid showing evidence strength</li>
            <li><strong>Key Stakeholders</strong> — Champion, economic buyer, blockers</li>
            <li><strong>Activity Summary</strong> — Recent engagement timeline</li>
            <li><strong>Executive Summary</strong> — AI-generated narrative with risks and recommendations</li>
          </ul>

          <h3>Export Options</h3>
          <ul>
            <li><strong>Copy to Clipboard</strong> — Paste into Slack, email, or docs</li>
            <li><strong>Download PDF</strong> — Professional format for sharing</li>
          </ul>

          <h3>Where</h3>
          <p><code>/deals/[id]</code> → Proof Pack tab</p>

          <div class="callout info">
            <strong>💡 Forecast Call Ready</strong>
            <p>Generate a Proof Pack before every forecast call. It gives you the facts, not just feelings.</p>
          </div>
        \`,
      },
    ],
  },
  {
    id: 'reference',
    title: 'Quick Reference',
    icon: '📚',
    articles: [
      {
        id: 'shortcuts',
        title: 'Keyboard Shortcuts',
        content: `
          <table class="shortcuts-table">
            <thead>
              <tr><th>Shortcut</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr><td><kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd></td><td>Open command palette</td></tr>
              <tr><td><kbd>↑</kbd> / <kbd>↓</kbd></td><td>Navigate command palette results</td></tr>
              <tr><td><kbd>Enter</kbd></td><td>Select command palette result</td></tr>
              <tr><td><kbd>Esc</kbd></td><td>Close modal / command palette</td></tr>
            </tbody>
          </table>
        `,
      },
      {
        id: 'glossary',
        title: 'Glossary',
        content: `
          <dl class="glossary">
            <dt>DRI</dt>
            <dd>Directly Responsible Individual — the single person accountable for a deal</dd>
            
            <dt>MEDDPICC</dt>
            <dd>Deal qualification framework: Metrics, Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identify Pain, Champion, Competition</dd>
            
            <dt>Enforcement Event</dt>
            <dd>A logged record of a policy decision (allowed, denied, or overridden)</dd>
            
            <dt>Freeze</dt>
            <dd>A state where a deal cannot be modified until explicitly unfrozen</dd>
            
            <dt>Override</dt>
            <dd>A temporary exception to a policy, requiring approval and justification</dd>
            
            <dt>Signal</dt>
            <dd>A data point used by the policy engine (e.g., MEDDPICC score, LMS status)</dd>
            
            <dt>Stage Gate</dt>
            <dd>Requirements that must be met before a deal can advance</dd>
            
            <dt>PAID</dt>
            <dd>PROVENIQ Asset ID — unique identifier for registered assets</dd>
          </dl>
        `,
      },
      {
        id: 'api',
        title: 'API Reference',
        content: `
          <p>Key endpoints for integration and automation:</p>
          
          <h3>Deals</h3>
          <table class="api-table">
            <tr><td><code class="method get">GET</code></td><td><code>/api/deals</code></td><td>List all deals</td></tr>
            <tr><td><code class="method get">GET</code></td><td><code>/api/deals/[id]</code></td><td>Get deal details</td></tr>
            <tr><td><code class="method post">POST</code></td><td><code>/api/deals</code></td><td>Create new deal</td></tr>
            <tr><td><code class="method patch">PATCH</code></td><td><code>/api/deals/[id]</code></td><td>Update deal</td></tr>
          </table>
          
          <h3>Enforcement</h3>
          <table class="api-table">
            <tr><td><code class="method post">POST</code></td><td><code>/api/enforce/authorize</code></td><td>Check if action is allowed</td></tr>
            <tr><td><code class="method post">POST</code></td><td><code>/api/enforce/deals/[id]/freeze</code></td><td>Freeze a deal</td></tr>
            <tr><td><code class="method post">POST</code></td><td><code>/api/enforce/deals/[id]/unfreeze</code></td><td>Unfreeze a deal</td></tr>
          </table>
          
          <div class="callout info">
            <strong>🔐 Authentication</strong>
            <p>All API requests require a valid Firebase ID token in the <code>Authorization</code> header.</p>
          </div>
        `,
      },
    ],
  },
];

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [activeArticle, setActiveArticle] = useState(sections[0].articles[0].id);

  const currentSection = sections.find((s) => s.id === activeSection)!;
  const currentArticle = currentSection.articles.find((a) => a.id === activeArticle)!;

  return (
    <div className="guide-container">
      <style jsx global>{`
        .guide-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #0f0f18 100%);
          color: #e2e8f0;
          display: flex;
        }
        
        /* Sidebar */
        .guide-sidebar {
          width: 300px;
          background: rgba(15, 15, 23, 0.95);
          border-right: 1px solid rgba(99, 102, 241, 0.1);
          padding: 32px 0;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }
        
        .guide-header {
          padding: 0 24px 32px;
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
          margin-bottom: 24px;
        }
        
        .guide-logo {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }
        
        .guide-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }
        
        .guide-nav {
          padding: 0 12px;
        }
        
        .guide-section {
          margin-bottom: 24px;
        }
        
        .guide-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.15s ease;
        }
        
        .guide-section-header:hover {
          background: rgba(99, 102, 241, 0.1);
          color: #e2e8f0;
        }
        
        .guide-section-header.active {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
        }
        
        .guide-articles {
          margin-left: 28px;
          padding-left: 12px;
          border-left: 1px solid rgba(99, 102, 241, 0.2);
          margin-top: 8px;
        }
        
        .guide-article-link {
          display: block;
          padding: 8px 12px;
          font-size: 0.875rem;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        .guide-article-link:hover {
          color: #e2e8f0;
          background: rgba(99, 102, 241, 0.05);
        }
        
        .guide-article-link.active {
          color: #a5b4fc;
          background: rgba(99, 102, 241, 0.1);
        }
        
        .guide-back {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          margin-top: auto;
          color: #64748b;
          font-size: 0.875rem;
          border-top: 1px solid rgba(99, 102, 241, 0.1);
          cursor: pointer;
          transition: color 0.15s ease;
        }
        
        .guide-back:hover {
          color: #e2e8f0;
        }
        
        /* Main Content */
        .guide-main {
          flex: 1;
          margin-left: 300px;
          padding: 48px 64px;
          max-width: 900px;
        }
        
        .guide-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 16px;
        }
        
        .guide-breadcrumb span {
          color: #6366f1;
        }
        
        .article-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 32px;
          line-height: 1.2;
        }
        
        .article-content {
          font-size: 1rem;
          line-height: 1.8;
          color: #cbd5e1;
        }
        
        .article-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          margin: 32px 0 16px;
        }
        
        .article-content p {
          margin-bottom: 16px;
        }
        
        .article-content ul, .article-content ol {
          margin: 16px 0;
          padding-left: 24px;
        }
        
        .article-content li {
          margin-bottom: 8px;
        }
        
        .article-content strong {
          color: #e2e8f0;
        }
        
        .article-content code {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875em;
        }
        
        .article-content kbd {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 4px;
          padding: 2px 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8em;
          color: #e2e8f0;
          box-shadow: 0 2px 0 #0f172a;
        }
        
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
          font-size: 0.9rem;
        }
        
        .article-content th {
          text-align: left;
          padding: 12px 16px;
          background: rgba(99, 102, 241, 0.1);
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .article-content td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        }
        
        .article-content tr:hover td {
          background: rgba(99, 102, 241, 0.05);
        }
        
        /* Callouts */
        .callout {
          padding: 16px 20px;
          border-radius: 8px;
          margin: 24px 0;
        }
        
        .callout.info {
          background: rgba(59, 130, 246, 0.1);
          border-left: 3px solid #3b82f6;
        }
        
        .callout.warning {
          background: rgba(245, 158, 11, 0.1);
          border-left: 3px solid #f59e0b;
        }
        
        .callout strong {
          display: block;
          margin-bottom: 8px;
          color: #e2e8f0;
        }
        
        .callout p {
          margin: 0;
          font-size: 0.9rem;
        }
        
        /* Stage List */
        .stage-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 24px 0;
        }
        
        .stage {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 8px;
          border-left: 3px solid;
        }
        
        .stage[data-color="gray"] { border-color: #6b7280; }
        .stage[data-color="blue"] { border-color: #3b82f6; }
        .stage[data-color="purple"] { border-color: #8b5cf6; }
        .stage[data-color="pink"] { border-color: #ec4899; }
        .stage[data-color="orange"] { border-color: #f97316; }
        .stage[data-color="yellow"] { border-color: #eab308; }
        .stage[data-color="lime"] { border-color: #84cc16; }
        .stage[data-color="green"] { border-color: #22c55e; }
        .stage[data-color="emerald"] { border-color: #10b981; }
        .stage[data-color="red"] { border-color: #ef4444; }
        
        .stage-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 600;
          color: #a5b4fc;
          min-width: 120px;
        }
        
        .stage-desc {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        
        /* Threshold Grid */
        .threshold-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin: 24px 0;
        }
        
        .threshold {
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }
        
        .threshold.red { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
        .threshold.yellow { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); }
        .threshold.green { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); }
        
        .threshold-range {
          display: block;
          font-size: 2rem;
          font-weight: 700;
        }
        
        .threshold.red .threshold-range { color: #ef4444; }
        .threshold.yellow .threshold-range { color: #f59e0b; }
        .threshold.green .threshold-range { color: #10b981; }
        
        .threshold-label {
          display: block;
          font-weight: 600;
          color: #e2e8f0;
          margin: 8px 0 4px;
        }
        
        .threshold-action {
          font-size: 0.8rem;
          color: #64748b;
        }
        
        /* DRI Indicators */
        .dri-indicators {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 24px 0;
        }
        
        .dri-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 8px;
        }
        
        .dri-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .dri-indicator.green .dri-dot { background: #10b981; }
        .dri-indicator.yellow .dri-dot { background: #eab308; }
        .dri-indicator.red .dri-dot { background: #ef4444; }
        .dri-indicator.black .dri-dot { background: #1f2937; border: 2px solid #374151; }
        
        /* Flow Diagram */
        .flow-diagram {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 24px 0;
          padding: 24px;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
        }
        
        .flow-step {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .flow-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .flow-arrow {
          color: #4b5563;
          margin-left: 8px;
        }
        
        /* API Table */
        .api-table .method {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .api-table .method.get { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .api-table .method.post { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .api-table .method.patch { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        
        /* Glossary */
        .glossary {
          margin: 24px 0;
        }
        
        .glossary dt {
          font-weight: 600;
          color: #a5b4fc;
          font-family: 'JetBrains Mono', monospace;
          margin-top: 16px;
        }
        
        .glossary dd {
          margin: 4px 0 0 0;
          color: #94a3b8;
        }
        
        /* Shortcuts Table */
        .shortcuts-table td:first-child {
          white-space: nowrap;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="guide-sidebar">
        <div className="guide-header">
          <div className="guide-logo">PROVENIQ Sales</div>
          <h1 className="guide-title">User Guide</h1>
        </div>

        <nav className="guide-nav">
          {sections.map((section) => (
            <div key={section.id} className="guide-section">
              <div
                className={`guide-section-header ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(section.id);
                  setActiveArticle(section.articles[0].id);
                }}
              >
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </div>
              {activeSection === section.id && (
                <div className="guide-articles">
                  {section.articles.map((article) => (
                    <div
                      key={article.id}
                      className={`guide-article-link ${activeArticle === article.id ? 'active' : ''}`}
                      onClick={() => setActiveArticle(article.id)}
                    >
                      {article.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <Link href="/dashboard" className="guide-back">
          ← Back to Dashboard
        </Link>
      </aside>

      {/* Main Content */}
      <main className="guide-main">
        <div className="guide-breadcrumb">
          {currentSection.title} <span>→</span> {currentArticle.title}
        </div>
        <h1 className="article-title">{currentArticle.title}</h1>
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: currentArticle.content }}
        />
      </main>
    </div>
  );
}
