# DSH BrowserScope Validation Report

[简体中文](./VALIDATION.md) | English Version

This document records the objectives, procedures, and empirical results of validation runs conducted for DSH BrowserScope Release Candidates.

Release candidate states are formally anchored by external candidate identity descriptors and tarball digests.

## Target Object

```text
package: dsh-browser-scope
version: 1.0.0-rc7
DSH compatibility targets: 0.1.5-rc.2, 0.1.6-alpha.1, 0.1.6-alpha.2, 0.1.7-rc.1, 0.1.7-rc.2
full browser runtime validation: 0.1.7-rc.1, 0.1.7-rc.2
0.1.7-rc.2 validation: API/type audit, strict build, 30-tool Chromium regression, fresh Profile lifecycle
Node.js: 22.x
package manager: pnpm 11.x
```

All direct `@deepseek-ai/dsh-*` peer dependencies declare `0.1.5-rc.2 || 0.1.6-alpha.1 || 0.1.6-alpha.2 || 0.1.7-rc.1 || 0.1.7-rc.2`.

DSH `0.1.7-rc.1` removes the generic `MessageSourceMap['plugin']` source and adds an authenticated `peer` parameter to the native Connection RPC handler. RC6 introduced a dedicated `dsh-browser-scope` message source and separated the three-argument business handler of the custom `/api/browser-tools` Fetch route from DSH's four-argument native handler type; RC7 retains that implementation. Connection continues to own authentication, Host/Origin checks, request limits, and cancellation. Existing Agent, Session, Tool, Attachment, Permission Preset, Client Session, right-sidebar, and Slot APIs used by BrowserScope remain available.

RC6 passes strict TypeScript, production Host/Client builds, Session Controller integration, and the complete real-Chromium 30-tool regression against DSH `0.1.7-rc.1`; its frozen tarball passes fresh Profile install/start/authentication/stop/uninstall checks. DSH `0.1.7-rc.2` retains the Tool, Session, and RPC interfaces used by BrowserScope while adding an optional localized approval display reason and a model-cache optimization for dynamic tool additions. RC6 also passes strict builds, Session Controller integration, the complete real-Chromium 30-tool regression, and fresh Profile lifecycle against RC2. RC7 changes only the version and release documentation, not the browser business source; verify its archive bytes and lifecycle separately rather than reusing RC6's candidate digest. The dynamic-tool KV Cache optimization has not received request-level validation. An isolated RC2 Web profile used the official local Mock LLM to create two formal Sessions, validating controller locking, access to all nine views, tab-close synchronization, session isolation, and Live View takeover/return state. Complex-page human input, extension downloads, visual split-view interaction, and restart recovery remain separately unverified. Compatibility is not extrapolated to future DSH versions.

## 1. 30 Browser Tools Integration

**Objective**: Ensure all 30 Agent browser tools operate end-to-end against real Chromium instances rather than mocking layers or unit stubs.

**Scope**: Tab management, navigation, observation, interactions, upload/download, console capture, network interception, debugger stepping, Source Map resolution, performance profiling, emulation, provider orchestration, extensions, takeover, and forensic diagnostics.

**Result**:

```text
toolCount: 30
navigation: pass
panel: pass
splitView: pass
persistentContext: pass
extensions: pass
debugger: pass
diagnose: pass
networkControl: pass
profile: pass
```

## 2. 9-View Native DSH Workbench

**Objective**: Confirm that BrowserScope provides 9 workspace views within the official DSH right sidebar architecture while correctly managing pane lifecycles.

### RC2 Live Web Acceptance Results

**Environment**: Isolated `DSH_HOME`, port `31880`, DSH `0.1.5-rc.2`, current BrowserScope build, and real third-party browser plugin loaded into the same profile.

**Procedure**: Conducted live end-to-end session testing across two formal Sessions. Session A selected BrowserScope, navigated across the 9 views, and released resources; Session B independently chose third-party tools. Both were tested across an isolated DSH restart.

**Findings**:
- Unselected formal Sessions conceal browser tools until explicit provider choice.
- Selecting BrowserScope locks the session and exposes all 9 views and arbitrated tools.
- Releasing BrowserScope runtime frees memory without unlocking the Session.
- Sibling Sessions choose alternative browser plugins without interference.
- Restarts restore respective choices intact with schema v2 persistence (`generation=1`).

## 3. Session Controller Coexistence

**Objective**: Confirm BrowserScope arbitrates browser toolsets on an Agent Session granularity within shared profiles without modifying third-party plugin binaries, configs, or processes.

**Unit & Integration Suites**:
- `tests/browser-controller.ts`: PASS (pre-selection masking, locking, release preservation, restart resumption, schema v1->v2 migration, rollback on persistence errors).
- `tests/session-controller-integration.mjs`: PASS (live DSH Agent Scope isolation, toolset expansion 0 -> 30, identical name shadowing, unique tool restriction).

```text
globalBrowserToolCount: 3
unselectedBrowserToolCount: 0
activeBrowserToolCount: 30
browserScopeSelectionLocked: true
otherBrowserSelectionLocked: true
releasePreservedSelection: true
sameNameShadowed: true
uniqueThirdPartyRestricted: true
browserScopePersistedGeneration: 1
otherBrowserPersistedGeneration: 1
runtimeRemoved: true
```

## 4. State & Session Isolation

**Objective**: Verify that shared persistent context and session-level isolation invariants coexist without cross-session contamination.

**Shared Items**:
- Cookies, LocalStorage, IndexedDB, Cache Storage, Service Workers, Permissions.

**Isolated Items**:
- Pages, views, tab history, popups, viewport focus, CDP sessions, Network journals, screencasts, and artifacts.

## 5. Build & Package Determinism

**Objective**: Guarantee that output binaries are deterministic and tarball contents match the audited worktree.

**RC2 Artifacts**:
- `lib/client.js`
- `lib/client.js.map`
- `lib/index.mjs`
- `lib/index.d.mts`

Package gates verify that all 20 manifest files match repository bytes identically without spurious path leaks.

## 6. Cleanup Verification

**Objective**: Ensure full lifecycle deallocation upon process exit.

```text
portClosed: true
externalCdpClosed: true
runtimeRemoved: true
```
