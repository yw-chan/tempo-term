//! Installs a Claude Code hook that reports the live session state to tempo-term
//! as an OSC sequence (see `status-hook.sh`). The merge/remove of the hook
//! entries in `~/.claude/settings.json` is a pure function over the parsed JSON
//! so it can be tested without touching the filesystem.

use serde_json::{json, Value};

/// The hook script body, embedded so install can write it to disk.
pub const HOOK_SCRIPT: &str = include_str!("status-hook.sh");

/// (Claude Code hook event, status argument) pairs we install. Both
/// `PermissionRequest` and `Notification` map to waiting-approval so whichever
/// the installed Claude Code fires lights the badge.
const EVENTS: &[(&str, &str)] = &[
    ("SessionStart", "idle"),
    ("UserPromptSubmit", "thinking"),
    ("PreToolUse", "active"),
    ("PermissionRequest", "waiting-approval"),
    ("Notification", "waiting-approval"),
    ("Stop", "idle"),
    ("SessionEnd", "end"),
];

fn our_command(script_path: &str, state: &str) -> String {
    format!("{script_path} {state}")
}

/// Add our hook entry to each event without disturbing the user's own hooks.
/// Idempotent: re-running never duplicates our entries.
pub fn merge_hook_settings(mut existing: Value, script_path: &str) -> Value {
    if !existing.is_object() {
        existing = json!({});
    }
    let root = existing.as_object_mut().unwrap();
    let hooks = root.entry("hooks").or_insert_with(|| json!({}));
    if !hooks.is_object() {
        *hooks = json!({});
    }
    let hooks = hooks.as_object_mut().unwrap();
    for (event, state) in EVENTS {
        let cmd = our_command(script_path, state);
        let arr = hooks.entry(*event).or_insert_with(|| json!([]));
        if !arr.is_array() {
            *arr = json!([]);
        }
        let arr = arr.as_array_mut().unwrap();
        let already = arr.iter().any(|e| {
            e["hooks"].as_array().is_some_and(|hs| {
                hs.iter().any(|h| h["command"] == Value::String(cmd.clone()))
            })
        });
        if !already {
            arr.push(json!({ "hooks": [{ "type": "command", "command": cmd }] }));
        }
    }
    existing
}

/// Remove only the entries whose command points at our script, then drop any
/// event array we left empty. The user's other hooks are untouched.
pub fn remove_hook_settings(mut existing: Value, script_path: &str) -> Value {
    let Some(hooks) = existing.get_mut("hooks").and_then(Value::as_object_mut) else {
        return existing;
    };
    for (event, _) in EVENTS {
        if let Some(arr) = hooks.get_mut(*event).and_then(Value::as_array_mut) {
            arr.retain(|e| {
                e["hooks"].as_array().is_none_or(|hs| {
                    !hs.iter().any(|h| {
                        h["command"]
                            .as_str()
                            .is_some_and(|c| c.contains(script_path))
                    })
                })
            });
        }
    }
    let empty: Vec<String> = hooks
        .iter()
        .filter(|(_, v)| v.as_array().is_some_and(|a| a.is_empty()))
        .map(|(k, _)| k.clone())
        .collect();
    for key in empty {
        hooks.remove(&key);
    }
    existing
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn merge_adds_entries_without_touching_other_hooks() {
        let existing = json!({
            "hooks": { "PreToolUse": [{ "hooks": [{ "type": "command", "command": "user-thing" }] }] }
        });
        let merged = merge_hook_settings(existing, "/p/status-hook.sh");
        let pre = merged["hooks"]["PreToolUse"].as_array().unwrap();
        assert!(pre.iter().any(|e| e["hooks"][0]["command"] == "user-thing"));
        assert!(pre
            .iter()
            .any(|e| e["hooks"][0]["command"] == "/p/status-hook.sh active"));
        assert!(merged["hooks"]["SessionEnd"].as_array().unwrap().iter().any(|e| {
            e["hooks"][0]["command"] == "/p/status-hook.sh end"
        }));
    }

    #[test]
    fn remove_strips_only_our_entries() {
        let merged = merge_hook_settings(
            json!({
                "hooks": { "PreToolUse": [{ "hooks": [{ "type": "command", "command": "user-thing" }] }] }
            }),
            "/p/status-hook.sh",
        );
        let cleaned = remove_hook_settings(merged, "/p/status-hook.sh");
        let pre = cleaned["hooks"]["PreToolUse"].as_array().unwrap();
        assert!(pre.iter().any(|e| e["hooks"][0]["command"] == "user-thing"));
        assert!(!pre.iter().any(|e| e["hooks"][0]["command"]
            .as_str()
            .unwrap()
            .contains("status-hook.sh")));
        assert!(cleaned["hooks"].get("SessionEnd").is_none());
    }

    #[test]
    fn merge_is_idempotent() {
        let once = merge_hook_settings(json!({}), "/p/status-hook.sh");
        let twice = merge_hook_settings(once.clone(), "/p/status-hook.sh");
        assert_eq!(once, twice);
    }

    #[test]
    fn remove_on_settings_without_our_hooks_is_safe() {
        let other = json!({ "hooks": { "PreToolUse": [{ "hooks": [{ "type": "command", "command": "user" }] }] } });
        let cleaned = remove_hook_settings(other.clone(), "/p/status-hook.sh");
        assert_eq!(cleaned, other);
    }
}
