import React from 'react';
import { Card, Form, Input, Button, Space, Alert, Typography, Divider } from 'antd';
import { DollarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useFormik } from 'formik';
import { withdrawSchema } from '../validations/atmSchema';

const { Text } = Typography;

const QUICK_AMOUNTS = [500, 1000, 2000, 2500, 5000, 10000];

export function WithdrawForm({ onWithdraw, isWithdrawing, maxBalance = 0, isOnline }) {
  const formik = useFormik({
    initialValues: {
      amount: '',
    },
    validationSchema: withdrawSchema,
    onSubmit: async (values, { resetForm }) => {
      await onWithdraw(Number(values.amount));
      resetForm();
    },
  });

  const handleQuickSelect = (amt) => {
    // Pass shouldValidate=false to avoid running Yup against the
    // previous (empty) value before React re-renders with the new one.
    // Errors will still appear on blur or submit.
    formik.setFieldValue('amount', amt, false);
  };

  return (
    <Card
      title={
        <span>
          <DollarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          Withdraw Cash
        </span>
      }
      bordered={false}
      style={{ borderRadius: 12, height: '100%' }}
    >
      {!isOnline && (
        <Alert
          message="Offline Mode Active"
          description="Withdrawals made while offline will be recorded in local storage and synced with the server when connection is restored."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <form onSubmit={formik.handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Quick Amount Select</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {QUICK_AMOUNTS.map((amt) => (
              <Button
                key={amt}
                size="middle"
                type={formik.values.amount === amt ? 'primary' : 'default'}
                icon={<ThunderboltOutlined />}
                onClick={() => handleQuickSelect(amt)}
              >
                ₹{amt.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Form.Item
          label="Enter Amount (₹)"
          validateStatus={formik.touched.amount && formik.errors.amount ? 'error' : ''}
          help={formik.touched.amount && formik.errors.amount}
          style={{ marginBottom: 16 }}
        >
          <Input
            name="amount"
            size="large"
            prefix="₹"
            placeholder="e.g. 2450 (Multiple of ₹50)"
            value={formik.values.amount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={isWithdrawing}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isWithdrawing}
          disabled={!formik.values.amount || Boolean(formik.errors.amount)}
          style={{ height: 46, fontSize: 16, fontWeight: 600 }}
        >
          Withdraw Cash
        </Button>
      </form>

      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          • Algorithm dynamically dispenses multi-denomination notes while minimizing note count and preserving vault reserves.
        </Text>
      </div>
    </Card>
  );
}
