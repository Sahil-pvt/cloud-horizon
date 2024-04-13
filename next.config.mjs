/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['outstanding-minnow-51.convex.cloud'],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "outstanding-minnow-51.convex.cloud",
            }
        ]
    }
};

export default nextConfig;
