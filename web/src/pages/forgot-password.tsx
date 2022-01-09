import { Box, Flex, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import InputField from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="regular">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {/* Render prop */}
        {({ isSubmitting }) =>
          complete ? (
            <Box>Reset password link has been sent to your e-mail</Box>
          ) : (
            <Form>
              {/* Same as div */}
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
                type={'email'}
              />
              <Flex>
                <Button
                  type="submit"
                  bg={'whatsapp.100'}
                  color={'whatsapp.600'}
                  isLoading={isSubmitting}
                  mt={6}
                  mx={'auto'}
                >
                  Reset password
                </Button>
              </Flex>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
