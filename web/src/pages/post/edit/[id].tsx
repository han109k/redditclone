import { Box, Button, Flex } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import {
  usePostQuery,
  useUpdatePostMutation,
} from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';

const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const { data, error, loading } = usePostQuery({
    skip: intId === -1, // id is clearly wrong so don't even bother sending a request
    variables: {
      id: intId,
    },
  });
  const [updatePost] = useUpdatePostMutation();

  if (loading) {
    return (
      <Layout>
        <Box>loading...</Box>
      </Layout>
    );
  }

  if (error) {
    return <Box>{error.message}</Box>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find the post</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="regular">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({ variables: { id: intId, ...values } });
          router.back();
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
                Update Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
