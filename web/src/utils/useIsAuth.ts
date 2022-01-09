import { useEffect } from 'react';
import { useMeQuery } from '../generated/graphql';
import Router from 'next/router';

// custom hook for checking the client is currently logged in
const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  console.log(Router);

  useEffect(() => {
    if (!fetching && !data?.me) {
      Router.replace('/login?next=' + Router.router?.pathname); // after log in go back where you came from
    }
  }, [fetching, data, Router]);
};

export default useIsAuth;
