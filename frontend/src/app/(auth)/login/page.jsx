"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Chip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LoginOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useAuthStore } from "@/store/useAuthStore";
import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/endpoints";

const LoginPage = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        username: formData.username,
        password: formData.password,
      });

      if (response.success) {
        const { user, token } = response.data;

        // Save to auth store
        setAuth(user, token);

        enqueueSnackbar("Login successful!", { variant: "success" });

        // Redirect based on role
        if (user.role === "super_admin") {
          router.push("/admin/dashboard");
        } else if (user.role === "inspector") {
          router.push("/inspector/dashboard");
        } else if (user.role === "checker") {
          router.push("/checker/dashboard");
        } else if (user.role === "approver") {
          router.push("/approver/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
      enqueueSnackbar(err.message || "Login failed", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Quick login dengan dummy credentials
  const quickLogin = (role) => {
    const credentials = {
      super_admin: { username: "admin", password: "admin123" },
      inspector: { username: "inspector", password: "inspector123" },
      checker: { username: "checker", password: "checker123" },
      approver: { username: "approver", password: "approver123" },
    };

    setFormData(credentials[role]);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2F80ED 0%, #1E5BBF 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 450,
          borderRadius: 3,
        }}
      >
        {/* Logo & Title */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary"
            gutterBottom
          >
            Seikaku QC System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ebara Quality Control Monitoring
          </Typography>
        </Box>

        {/* Demo Mode Info */}
        <Alert severity="info" icon={<InfoOutlined />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            🎯 Demo Mode - Data Dummy
          </Typography>
          <Typography variant="caption" display="block">
            Quick login sebagai:
          </Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
            <Chip
              label="Admin"
              size="small"
              color="primary"
              onClick={() => quickLogin("super_admin")}
              clickable
            />
            <Chip
              label="Inspector"
              size="small"
              color="secondary"
              onClick={() => quickLogin("inspector")}
              clickable
            />
            <Chip
              label="Checker"
              size="small"
              color="info"
              onClick={() => quickLogin("checker")}
              clickable
            />
            <Chip
              label="Approver"
              size="small"
              color="success"
              onClick={() => quickLogin("approver")}
              clickable
            />
          </Stack>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="username"
            autoFocus
            helperText="Klik chip di atas untuk auto-fill"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LoginOutlined />}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Dummy Credentials Info */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "#F8FAFC",
            borderRadius: 2,
            border: "1px solid #E2E8F0",
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>Dummy Credentials:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • Admin: admin / admin123
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • Inspector: inspector / inspector123
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • Checker: checker / checker123
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • Approver: approver / approver123
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 Seikaku Ebara QC System
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
