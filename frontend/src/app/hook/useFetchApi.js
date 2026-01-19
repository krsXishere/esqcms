"use client";
import { useState, useCallback } from "react";
import apiClient from "@/lib/api/axios";

export const useFetchApi = (defaultConfig = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const sendRequest = useCallback(
    async (config = {}) => {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const requestConfig = {
          method: config.method || defaultConfig.method || "get",
          url: config.url || defaultConfig.url || "",
          data: config.data ?? defaultConfig.data,
          params: config.params ?? defaultConfig.params,
          headers: {
            ...(defaultConfig.headers || {}),
            ...(config.headers || {}),
          },
          onDownloadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
          },
        };

        const response = await apiClient.request(requestConfig);
        setData(response);
        return response;
      } catch (err) {
        console.error("useFetchApi error:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [defaultConfig]
  );

  return { data, loading, error, progress, sendRequest };
};
