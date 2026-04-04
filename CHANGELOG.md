# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [4.1.3] - 2026-04-04

### Fixed

- **Async after fire-and-forget**: `wrapAfter` result is now awaited; async after errors correctly reject the outer Promise instead of becoming `unhandledRejection`.
- **Async before post-next error**: Errors thrown in `before` middleware after calling `next()` now correctly reject, both for fire-and-forget and `await next()` patterns. Implemented via `Promise.all` full-chain tracking.
- **Target error leaking into after**: `reject(err)` is now followed by `return`, preventing `after` middleware from running on the failure path.
- **After next-gating restored**: `after` middleware must call `next()` to signal completion; not calling it leaves the Promise pending (original contract preserved).
- **`this` context propagation**: Caller's `this` is now passed to `target`, `before`, and `after` via `.call(this, ...)` at entry points and an updated `compose` identity case.
- **Jest dual config conflict**: Removed `jest` block from `package.json`; `jest.config.js` is now the single source of truth.
- **Minor cleanup**: `substr` → `typeof` for type checking, `reject?` → `reject` for correct typing.

## [4.1.2] - Previous

### Added

- Initial middleware combiner with before/after support.
