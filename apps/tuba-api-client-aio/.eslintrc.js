/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@repo/eslint-config/library.js"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "explicit-function-return-type": "off",
    "no-control-regex": "off",
    "no-undef": "off",
    "no-unused-vars": "off",
    "no-useless-escape": "off",
  }
};
