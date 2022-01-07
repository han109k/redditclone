import { Button, Box } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({options: values});
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // Logged in
            router.push('/');
          }
        }}
      >
        {/* Render prop */}
        {({ isSubmitting }) => (
          <Form>
            {/* Same as div */}
            <InputField
              name="username"
              placeholder="username"
              label="Username"
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
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

// ssr disabled
export default withUrqlClient(createUrqlClient)(Login);
