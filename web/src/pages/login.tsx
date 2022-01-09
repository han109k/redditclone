import { Button, Box, Link, Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import NextLink from 'next/link';

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // Logged in
            // Redirect or not
            if (typeof router.query.next === 'string') {
              router.push(router.query?.next);
            } else {
              router.push('/');
            }
          }
        }}
      >
        {/* Render prop */}
        {({ isSubmitting }) => (
          <Form>
            {/* Same as div */}
            <InputField
              name="usernameOrEmail"
              placeholder="Username or Email"
              label="Username or Email"
              type={'text'}
            />
            <Box mt={6}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Box mt={4} textAlign={'end'}>
              <NextLink href="/forgot-password">
                <Link
                  color={'blue.700'}
                  textDecoration={'underline'}
                  fontSize={'sm'}
                >
                  Forgot password?
                </Link>
              </NextLink>
            </Box>
            <Flex>
              <Button
                type="submit"
                bg={'whatsapp.100'}
                color={'whatsapp.600'}
                isLoading={isSubmitting}
                mt={6}
                mx={'auto'}
              >
                Login
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

// ssr disabled
export default withUrqlClient(createUrqlClient)(Login);
