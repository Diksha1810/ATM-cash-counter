import React from 'react';
import { Modal, Result, Tag, Typography, Row, Col, Card, Divider } from 'antd';
import { CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NOTE_COLORS = {
  2000: 'magenta',
  500: 'gold',
  200: 'orange',
  100: 'blue',
  50: 'cyan',
};

export function WithdrawResultModal({ isOpen, onClose, transaction }) {
  if (!transaction) return null;

  const notes = transaction.dispensedNotes || [];

  return (
    <Modal
      open={isOpen}
      onOk={onClose}
      onCancel={onClose}
      okText="Done"
      cancelButtonProps={{ style: { display: 'none' } }}
      centered
      title={
        <span>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          Withdrawal Successful
        </span>
      }
    >
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <Title level={2} style={{ color: '#3f8600', margin: '0 0 8px' }}>
          ₹{transaction.amount?.toLocaleString()}
        </Title>
        <Text type="secondary">Dispensed with multi-denomination optimization</Text>

        <Divider orientation="center" style={{ margin: '16px 0' }}>
          Dispensed Notes Breakdown
        </Divider>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
          {notes.map((n) => (
            <Card
              key={n.denomination}
              size="small"
              style={{
                borderRadius: 8,
                background: '#fafafa',
                border: '1px solid #f0f0f0',
                minWidth: 100,
              }}
            >
              <Tag
                color={NOTE_COLORS[n.denomination] || 'blue'}
                style={{ fontSize: 13, marginBottom: 4 }}
              >
                ₹{n.denomination}
              </Tag>
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  × {n.quantity}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                ₹{(n.denomination * n.quantity).toLocaleString()}
              </Text>
            </Card>
          ))}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Row justify="space-between" style={{ padding: '0 16px' }}>
          <Col>
            <Text type="secondary">Previous Balance:</Text>
            <div>
              <Text strong>₹{transaction.balanceBefore?.toLocaleString()}</Text>
            </div>
          </Col>
          <Col>
            <Text type="secondary">Remaining Balance:</Text>
            <div>
              <Text strong style={{ color: '#1677ff' }}>
                ₹{transaction.balanceAfter?.toLocaleString()}
              </Text>
            </div>
          </Col>
          <Col>
            <Text type="secondary">Status:</Text>
            <div>
              <Tag color="success">{transaction.status}</Tag>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
}
