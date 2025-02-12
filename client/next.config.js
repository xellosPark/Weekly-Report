// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     disableStaticImages: true,
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // ✅ 정적 사이트 생성을 위한 필수 옵션
  distDir: "out", // ✅ 빌드된 정적 파일이 저장될 폴더
  images: {
    unoptimized: true, // ✅ 정적 사이트에서 이미지 최적화 비활성화
  },
};

module.exports = nextConfig;
