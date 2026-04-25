import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll(),
  });
}
