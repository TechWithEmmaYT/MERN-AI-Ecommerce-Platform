import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";

export const useUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const data = await getCurrentUser();
      return data.user;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
