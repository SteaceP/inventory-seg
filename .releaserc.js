export default {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        releaseRules: [
          { type: "feat", release: "patch" },
          { type: "fix", release: "patch" },
          { type: "perf", release: "patch" },
        ],
      },
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "sed -i 's/| .* (Latest) |/| ${nextRelease.version} (Latest) |/g' SECURITY.md && sed -i 's/| < .* |/| < ${nextRelease.version} |/g' SECURITY.md",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md", "SECURITY.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    "@semantic-release/github",
  ],
};
