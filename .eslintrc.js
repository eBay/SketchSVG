module.exports = {
  "extends": "ebay",
  "env": {
    "browser": true,
    "node": true
  },
  "plugins": [
      "chai-friendly"
  ],
  "rules": {
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2,
    "no-unused-vars": ["error", { "args": "none" }],
    "no-console": 0,
    "no-buffer-constructor": 0
  },
  "overrides": [{
    "files": ["src/**.js"],
    "parserOptions": {
      "sourceType": "module"
    }
  }]
}
