import React from 'react';
import { Card, Table, Tag, Typography, Progress } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NOTE_COLORS = {
  2000: 'magenta',
  500: 'gold',
  200: 'orange',
  100: 'blue',
  50: 'cyan',
};

export function InventoryTable({ inventory, isLoading }) {
  const denominations = inventory?.denominations || [];

  const columns = [
    {
      title: 'Denomination',
      dataIndex: 'denomination',
      key: 'denomination',
      render: (val) => (
        <Tag
          color={NOTE_COLORS[val] || 'geekblue'}
          style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '6px' }}
        >
          ₹{val}
        </Tag>
      ),
    },
    {
      title: 'Quantity Available',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val) => <Text strong style={{ fontSize: '15px' }}>{val} notes</Text>,
    },
    {
      title: 'Total Value',
      dataIndex: 'value',
      key: 'value',
      render: (val) => (
        <Text strong style={{ color: '#1677ff', fontSize: '15px' }}>
          ₹{val?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Vault Share',
      key: 'share',
      render: (_, record) => {
        const total = inventory?.balance || 1;
        const percent = Math.round((record.value / total) * 100);
        return (
          <Progress
            percent={percent}
            size="small"
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
          />
        );
      },
    },
  ];

  return (
    <Card
      title={
        <span>
          <AppstoreOutlined style={{ marginRight: 8, color: '#1677ff' }} />
          Vault Cash Inventory
        </span>
      }
      bordered={false}
      style={{ borderRadius: 12, height: '100%' }}
    >
      <Table
        dataSource={denominations}
        columns={columns}
        rowKey="denomination"
        pagination={false}
        loading={isLoading}
        size="middle"
      />
    </Card>
  );
}
