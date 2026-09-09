import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served under tratto-smoky.vercel.app/admin via a rewrite; static assets
  // must load from this deployment's own domain, not the rewriting one.
  assetPrefix: "https://tratto-27pj.vercel.app",
};

export default nextConfig;
