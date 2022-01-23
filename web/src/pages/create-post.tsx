import { Box, Button, Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import useIsAuth from '../utils/useIsAuth';

const CreatePost: React.FC<{}> = ({}) => {
  // check if user is authenticated
  useIsAuth();
  const router = useRouter();
  const [createPost] = useCreatePostMutation();

  return (
    <Layout variant="regular">
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          const { errors } = await createPost({ variables: { input: values } });
          if (!errors) {
            router.push('/');
          }
        }}
      >
        {/* Render prop */}
        {({ isSubmitting }) => (
          <Form>
            {/* Same as div */}
            <InputField name="title" placeholder="Title" label="Title" />
            <Box mt={6}>
              <InputField
                name="text"
                placeholder="Write something here..."
                label="Body"
                textarea
              />
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
                Create Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default CreatePost;
