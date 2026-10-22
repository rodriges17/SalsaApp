#!/usr/bin/env bash
set -euo pipefail
if [ -n "${IOS_SIGNING_DIR:-}" ] && [ -f "$IOS_SIGNING_DIR/installed-profiles.txt" ]; then
  while IFS= read -r profile; do rm -f "$profile"; done < "$IOS_SIGNING_DIR/installed-profiles.txt"
fi
if [ -n "${IOS_KEYCHAIN_PATH:-}" ]; then security delete-keychain "$IOS_KEYCHAIN_PATH" >/dev/null 2>&1 || true; fi
if [ -n "${IOS_SIGNING_DIR:-}" ]; then rm -rf "$IOS_SIGNING_DIR"; fi
