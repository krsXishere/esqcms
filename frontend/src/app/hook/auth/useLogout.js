import { useFetchApi } from "../useFetchApi";
import { useStoreUserRole } from "./useStoreUserRole";

export function useLogout() {
  const { sendRequest } = useFetchApi();
  const { clearRole } = useStoreUserRole();

  const logout = async () => {
    await sendRequest({
      method: "get",
      url: "/auth/logout",
    });
    clearRole();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  return logout;
}
