import React, { useState } from 'react';
import { Layout, Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { TransactionTable } from '../components/TransactionTable';

const { Content } = Layout;
const { Title, Text } = Typography;

export function TransactionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['transactions', page, pageSize],
    queryFn: () => transactionService.getTransactions(page, pageSize),
    staleTime: 10 * 1000,
  });

  return (
    <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Space align="center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dashboard')}
              type="text"
            />
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              Transaction History
            </Title>
          </Space>
          <div style={{ marginLeft: 40 }}>
            <Text type="secondary">
              Complete audit trail of all vault cash dispensations and sync operations
            </Text>
          </div>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isFetching}
        >
          Refresh List
        </Button>
      </div>

      <TransactionTable
        transactions={data?.items || []}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        isLoading={isLoading}
        title={`All Recorded Transactions (${data?.total || 0})`}
      />
    </Content>
  );
}

export default TransactionsPage;
