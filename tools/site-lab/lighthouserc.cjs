module.exports = {
  ci: {
    collect: {
      url: [
        "https://littlefightnyc.com/",
        "https://littlefightnyc.com/services/",
        "https://littlefightnyc.com/field-guide/",
        "https://littlefightnyc.com/tech-audit/",
        "https://littlefightnyc.com/journal/read-your-monthly-software-bill/",
      ],
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["warn", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.95 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./reports/lhci",
    },
  },
};
