import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { StyledRoot } from "@/lib/styledRoot";

export const metadata = {
  title: "Seikaku Ebara QC Monitoring System",
  description: "Quality Control Monitoring System for Ebara",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ margin: 0, padding: 0, minHeight: "100vh", width: "100%" }}>
        <AppRouterCacheProvider>
          <StyledRoot>{children}</StyledRoot>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
