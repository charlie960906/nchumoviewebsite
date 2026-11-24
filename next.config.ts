import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.134","192.168.1.190","192.168.137.1","192.168.0.105","10.10.60.107","192.168.0.103","10.214.109.85"],
  output: "export",
  reactStrictMode: true,
  // 靜態匯出沒有圖片最佳化伺服器
  images: { unoptimized: true },
};

export default nextConfig;

