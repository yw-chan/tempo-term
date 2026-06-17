import type { CommitNode } from "../types";

/**
 * Filter loaded commits by a case-insensitive query over message, author and
 * hash. An empty or whitespace query returns the input unchanged.
 */
export function filterCommits(commits: CommitNode[], query: string): CommitNode[] {
  const q = query.trim().toLowerCase();
  if (q === "") {
    return commits;
  }
  return commits.filter(
    (c) =>
      c.message.toLowerCase().includes(q) ||
      c.author.toLowerCase().includes(q) ||
      c.hash.toLowerCase().includes(q),
  );
}
