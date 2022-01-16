import { useRouter } from 'next/router';

export const useGetIntId = () => {
  const router = useRouter();
  return typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
};
