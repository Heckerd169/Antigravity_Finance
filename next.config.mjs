/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nachzug 07.09.2026 (v3-02): `/mobile` ist die naheliegende englische
  // Schreibweise der Route `/mobil`. Ohne diese Umleitung landete sie auf der
  // Anmeldeseite und danach auf dem Dashboard — ohne dass jemand merkt, warum.
  // Diese Umleitungen greifen VOR der Middleware.
  async redirects() {
    return [
      { source: "/mobile", destination: "/mobil", permanent: true },
      { source: "/mobile/:path*", destination: "/mobil/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
