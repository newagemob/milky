import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
    ...compat.config({
    extends: ['next'],
    rules: {
      // Add looser linting rules here
      "no-unused-vars": "warn",
      "no-console": "off",
      "@next/next/no-img-element": "off",
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      "react-hooks/exhaustive-deps": "warn"
    },
  })
];

export default eslintConfig;
