import React from 'react';
import { Card, Skeleton } from 'antd';
import styled from 'styled-components';

const StyledSkeletonCard = styled(Card)`
  width: 100%;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    padding: 10px;
  }
  @media (max-width: 600px) {
    width: auto;
  }
`;

const PostSkeleton: React.FC = () => {
  return (
    <StyledSkeletonCard>
      <Skeleton loading={true} avatar active>
        <Skeleton.Input style={{ width: 200 }} active />
        <Skeleton.Input style={{ width: '100%' }} active />
        <Skeleton.Button style={{ width: '100%' }} active />
      </Skeleton>
    </StyledSkeletonCard>
  );
};

export default PostSkeleton;
