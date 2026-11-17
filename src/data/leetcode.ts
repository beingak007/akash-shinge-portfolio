import type { LeetCodeProfile } from "../types/index.ts";

/**
 * Pulled from the public LeetCode GraphQL profile for beingak007.
 * Update counts here when the live profile changes.
 * Do not invent ranking flex, contest ratings, or badges — none are published.
 */
export const leetcode: LeetCodeProfile = {
  username: "beingak007",
  url: "https://leetcode.com/u/beingak007/",
  realName: "Akash Shinge",
  accepted: 85,
  difficulties: [
    { label: "EASY", count: 32 },
    { label: "MEDIUM", count: 44 },
    { label: "HARD", count: 9 },
  ],
  languages: [
    { name: "Java", count: 83 },
    { name: "MySQL", count: 1 },
    { name: "Python3", count: 1 },
  ],
  tags: [
    { name: "Array", count: 43 },
    { name: "String", count: 25 },
    { name: "Math", count: 16 },
    { name: "Two Pointers", count: 15 },
    { name: "Hash Table", count: 15 },
    { name: "Dynamic Programming", count: 12 },
    { name: "Sorting", count: 11 },
    { name: "Binary Search", count: 8 },
  ],
  school: "Sinhgad Institute of Technology, Lonavala",
  photo: "/profile-workspace-modern.jpg",
};
