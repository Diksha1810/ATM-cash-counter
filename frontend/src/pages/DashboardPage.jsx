import React from 'react';
import { Layout, Row, Col, Typography, Space, Button } from 'antd';
import { ReloadOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useATM } from '../hooks/useATM';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { StatCards } from '../components/StatCards';
import { InventoryTable } from '../components/InventoryTable';
import { WithdrawForm } from '../components/WithdrawForm';
import { WithdrawResultModal } from '../components/WithdrawResultModal';
import { TransactionTable } from '../components/TransactionTable';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { QUERY_KEYS } from '../utils/constants';
import { atmService } from '../services/atmService';

const { Content } = Layout;
const { Title, Text } = Typography;

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    inventory,
    isLoadingInventory,
    refetchInventory,
    pendingCount,
    withdraw,
    isWithdrawing,
    syncPending,
    lastWithdrawal,
    isResultModalOpen,
    closeResultModal,
  } = useATM();

  const { isOnline } = useOfflineSync(syncPending);

  const { data: txData, isLoading: isLoadingTx } = useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, 1, 5],
    queryFn: () => transactionService.getTransactions(1, 5),
    staleTime: 30 * 1000,
  });

  const { data: pendingTransactions = [] } = useQuery({
    queryKey: [QUERY_KEYS.PENDING_TRANSACTIONS],
    queryFn: atmService.getPendingTransactions,
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
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            ATM Operational Dashboard
          </Title>
          <Text type="secondary">
            Real-time vault cash monitoring, smart dispensation & offline synchronization
          </Text>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetchInventory()}
            loading={isLoadingInventory}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<HistoryOutlined />}
            onClick={() => navigate('/transactions')}
          >
            All Transactions
          </Button>
        </Space>
      </div>

      <StatCards
        inventory={inventory}
        pendingCount={pendingCount}
        isLoading={isLoadingInventory}
      />

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <InventoryTable inventory={inventory} isLoading={isLoadingInventory} />
        </Col>

        <Col xs={24} lg={10}>
          <WithdrawForm
            onWithdraw={withdraw}
            isWithdrawing={isWithdrawing}
            maxBalance={inventory?.balance || 0}
            isOnline={isOnline}
          />
        </Col>
      </Row>

      <TransactionTable
        transactions={[...pendingTransactions, ...(txData?.items || [])].slice(0, 5)}
        isLoading={isLoadingTx}
        title="Recent Dispensations (Last 5)"
      />

      <WithdrawResultModal
        isOpen={isResultModalOpen}
        onClose={closeResultModal}
        transaction={lastWithdrawal}
      />
    </Content>
  );
}

export default DashboardPage;
