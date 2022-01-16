// rh -> code snippet
import React from 'react';
import { Flex } from '@chakra-ui/react';

export type WrapperVariant = 'small' | 'regular';
interface WrapperProps {
  variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = 'regular',
}) => {
  return (
    <Flex
      direction={'column'}
      mt={8}
      mx="auto"
      maxW={variant === 'regular' ? '800px' : '400px'}
      w="100%"
      justifyContent={'center'}
    >
      {children}
    </Flex>
  );
};
