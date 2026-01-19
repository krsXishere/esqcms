"use client";
import { useState } from "react";
import { useFetchApi } from "../useFetchApi";

export const useGetApi = (endpoint) => {
  const { sendRequest } = useFetchApi();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const result = await sendRequest({
        url: endpoint,
        params: params,
      });
      setData(result?.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchData };
};
