import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  WalletOutlined,
  AppstoreOutlined,
  CloudSyncOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

export function StatCards({ inventory, pendingCount, isLoading }) {
  const balance = inventory?.balance || 0;
  const totalNotes = inventory?.totalNotes || 0;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={8}>
        <Card bordered={false} hoverable loading={isLoading} style={{ borderRadius: 12 }}>
          <Statistic
            title="Current ATM Balance"
            value={balance}
            prefix="₹"
            groupSeparator=","
            precision={0}
            valueStyle={{ color: '#3f8600', fontWeight: 700 }}
            prefixCls="ant-statistic"
            suffix={
              <WalletOutlined
                style={{
                  fontSize: 24,
                  color: '#3f8600',
                  opacity: 0.8,
                  float: 'right',
                  marginTop: -28,
                }}
              />
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card bordered={false} hoverable loading={isLoading} style={{ borderRadius: 12 }}>
          <Statistic
            title="Total Notes in Vault"
            value={totalNotes}
            valueStyle={{ color: '#1677ff', fontWeight: 700 }}
            suffix={
              <AppstoreOutlined
                style={{
                  fontSize: 24,
                  color: '#1677ff',
                  opacity: 0.8,
                  float: 'right',
                  marginTop: -28,
                }}
              />
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card bordered={false} hoverable loading={isLoading} style={{ borderRadius: 12 }}>
          <Statistic
            title="Pending Offline Syncs"
            value={pendingCount}
            valueStyle={{
              color: pendingCount > 0 ? '#fa8c16' : '#52c41a',
              fontWeight: 700,
            }}
            suffix={
              pendingCount > 0 ? (
                <CloudSyncOutlined
                  style={{
                    fontSize: 24,
                    color: '#fa8c16',
                    opacity: 0.8,
                    float: 'right',
                    marginTop: -28,
                  }}
                />
              ) : (
                <CheckCircleOutlined
                  style={{
                    fontSize: 24,
                    color: '#52c41a',
                    opacity: 0.8,
                    float: 'right',
                    marginTop: -28,
                  }}
                />
              )
            }
          />
        </Card>
      </Col>
    </Row>
  );
}
