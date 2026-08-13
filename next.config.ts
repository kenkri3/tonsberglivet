import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "tonsberglivet.no",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/hva-skjer",
        destination: "/eventer",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
