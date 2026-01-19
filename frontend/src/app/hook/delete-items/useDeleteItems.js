import { useFetchApi } from "../useFetchApi";

const getApiErrorMessage = (e) =>
  typeof e === "string"
    ? e
    : e?.message ||
      e?.error ||
      e?.msg ||
      (Array.isArray(e?.errors) ? e.errors[0] : undefined) ||
      "Gagal menghapus data";

export function useDeleteItem() {
  const { sendRequest, loading } = useFetchApi();

  const deleteItem = async (endpoint, id) => {
    try {
      const safeEndpoint = String(endpoint).replace(/^\//, ""); // hindari double slash
      const data = await sendRequest({
        method: "delete",
        url: `/${safeEndpoint}/${id}`,
      });
      return { ok: true, data, error: null };
    } catch (e) {
      return { ok: false, data: null, error: getApiErrorMessage(e) };
    }
  };

  return { deleteItem, loading };
}
