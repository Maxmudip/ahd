import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["jspdf", "canvg", "html2canvas", "core-js"],
};

export default nextConfig;
