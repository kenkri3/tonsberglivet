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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "s1.ticketm.net",
      },
      {
        protocol: "https",
        hostname: "media.ticketmaster.com",
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
