/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@repo/eslint-config/nest.js"],
  parserOptions: {
    project: false,
  },
};
