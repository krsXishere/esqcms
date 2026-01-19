/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Enable image optimization domains if needed
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
