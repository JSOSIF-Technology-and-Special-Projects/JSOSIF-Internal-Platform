import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse", "@prisma/client", ".prisma/client"],
};

export default nextConfig;
