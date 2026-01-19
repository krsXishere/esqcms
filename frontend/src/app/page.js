"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Box, CircularProgress } from "@mui/material";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    // Check authentication and redirect accordingly
    if (isAuthenticated) {
      // Redirect based on role
      if (role === "super_admin") {
        router.replace("/admin/dashboard");
      } else if (role === "inspector") {
        router.replace("/inspector/dashboard");
      } else if (role === "checker") {
        router.replace("/checker/dashboard");
      } else if (role === "approver") {
        router.replace("/approver/dashboard");
      } else {
        router.replace("/login");
      }
    } else {
      // Not authenticated - redirect to login
      router.replace("/login");
    }
  }, [isAuthenticated, role, router]);

  // Show loading while redirecting
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2F80ED 0%, #1E5BBF 100%)",
      }}
    >
      <CircularProgress size={60} sx={{ color: "#fff" }} />
    </Box>
  );
}
