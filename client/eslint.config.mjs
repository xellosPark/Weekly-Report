import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// eslint 설정에 사용자 정의 규칙 추가
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx"],       // TypeScript 파일에 대한 규칙 적용
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",                            // 경고로 표시
        { "argsIgnorePattern": "^_" }      // 언더스코어(_)로 시작하는 변수는 무시
      ],
      "@typescript-eslint/no-explicit-any": "off",  // 필요에 따라 any 사용 허용
      "@typescript-eslint/no-unsafe-assignment": "off",  // Type 안전성 검사 비활성화 (선택적)
      "@typescript-eslint/no-unsafe-return": "off",       // Type 반환 검사 비활성화 (선택적)
    },
  },
];

export default eslintConfig;
