import React, { Suspense } from 'react';
import { Spin } from 'antd';

const Loadable = (Component) => (props) => (
  <Suspense
    fallback={
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#f5f7fa',
        }}
      >
        <Spin size="large" tip="Loading view..." />
      </div>
    }
  >
    <Component {...props} />
  </Suspense>
);

export default Loadable;
