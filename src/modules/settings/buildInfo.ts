import { invoke } from "@tauri-apps/api/core";

export interface AppBuildInfo {
  os: string;
  arch: string;
}

/** OS and CPU arch the app was built for (from the backend's std::env::consts). */
export function appBuildInfo(): Promise<AppBuildInfo> {
  return invoke<AppBuildInfo>("app_build_info");
}

/** Human-friendly OS name for the build line (e.g. "macos" → "macOS"). */
export function osLabel(os: string): string {
  switch (os) {
    case "macos":
      return "macOS";
    case "windows":
      return "Windows";
    case "linux":
      return "Linux";
    default:
      return os;
  }
}
