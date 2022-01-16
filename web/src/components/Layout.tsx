import { Flex } from '@chakra-ui/react';
import React from 'react';
import NavBar from './NavBar';
import { Wrapper, WrapperVariant } from './Wrapper';

interface LayoutProps {
  variant?: WrapperVariant;
}

const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <Flex direction={'column'}>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </Flex>
  );
};

export default Layout;
