import { usePostQuery } from '../generated/graphql';
import { useGetIntId } from './useGetIntId';

export const useGetPostFromUrl = () => {
  const intId = useGetIntId();
  return usePostQuery({
    pause: intId === -1, // if id is -1 don't even bother sending a request
    variables: {
      id: intId,
    },
  });
};
