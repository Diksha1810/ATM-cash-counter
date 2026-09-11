import React from 'react';
import { Card, Table, Tag, Typography, Space } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

const { Text } = Typography;

const NOTE_COLORS = {
  2000: 'magenta',
  500: 'gold',
  200: 'orange',
  100: 'blue',
  50: 'cyan',
};

const STATUS_COLORS = {
  SUCCESS: 'success',
  SYNCED: 'cyan',
  PENDING: 'warning',
  CONFLICT: 'error',
  FAILED: 'error',
};

export function TransactionTable({
  transactions = [],
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  isLoading,
  title = 'Transaction History',
}) {
  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => (
        <Text style={{ fontSize: '13px' }}>
          {new Date(val).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      ),
    },
    {
      title: 'Amount Dispensed',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => (
        <Text strong style={{ color: '#3f8600', fontSize: '15px' }}>
          ₹{val?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Dispensed Notes',
      dataIndex: 'dispensedNotes',
      key: 'dispensedNotes',
      render: (notes) => (
        <Space wrap size={[4, 4]}>
          {(notes || []).map((n) => (
            <Tag key={n.denomination} color={NOTE_COLORS[n.denomination] || 'blue'}>
              ₹{n.denomination} × {n.quantity}
            </Tag>
          ))}
          {(!notes || notes.length === 0) && <Text type="secondary">—</Text>}
        </Space>
      ),
    },
    {
      title: 'Balance Trajectory',
      key: 'balance',
      render: (_, record) => (
        <Text style={{ fontSize: '13px' }}>
          ₹{record.balanceBefore?.toLocaleString()} →{' '}
          <Text strong style={{ color: '#1677ff' }}>
            ₹{record.balanceAfter?.toLocaleString()}
          </Text>
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || 'default'} style={{ fontWeight: 600 }}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      title={
        <span>
          <HistoryOutlined style={{ marginRight: 8, color: '#1677ff' }} />
          {title}
        </span>
      }
      bordered={false}
      style={{ borderRadius: 12 }}
    >
      <Table
        dataSource={transactions}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={
          onPageChange
            ? {
                current: page,
                pageSize,
                total,
                onChange: onPageChange,
                showSizeChanger: false,
              }
            : false
        }
        size="middle"
      />
    </Card>
  );
}
