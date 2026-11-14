import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.190","192.168.137.1"],
  output: "export",
  reactStrictMode: true,
  // 靜態匯出沒有圖片最佳化伺服器
  images: { unoptimized: true },
};

export default nextConfig;
