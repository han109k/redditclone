import { Button, Box } from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { useMutation } from 'urql';
import InputField from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';

interface registerProps {}

const REGISTER_MUT = `
mutation Register($username: String!, $password:String!) {
  register(options: {username: $username, password: $password}) {
    errors {
      field
      message
    }
    user {
      id
      createdAt
      username
    }
  }
}
`;

const Register: React.FC<registerProps> = ({}) => {
  // URQL hook
  // const [registerResult, register] = useMutation(REGISTER_MUT);
  // Using GraphQL code generator with URQL plugin
  const [registerResult, register] = useRegisterMutation();
  const router = useRouter();
  const initialValues: registerProps = { firstName: '' };
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
