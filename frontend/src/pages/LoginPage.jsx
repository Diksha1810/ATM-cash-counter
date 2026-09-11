import React from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider, Alert } from 'antd';
import { MailOutlined, LockOutlined, BankOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { loginSchema } from '../validations/authSchema';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: 'demo@example.com',
      password: 'Password123!',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        await login(values);
        navigate('/dashboard');
      } catch {
        // Handled in AuthContext
      }
    },
  });

  const handleFillDemo = () => {
    formik.setValues({
      email: 'demo@example.com',
      password: 'Password123!',
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 16,
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          border: 'none',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <BankOutlined style={{ fontSize: 42, color: '#1677ff', marginBottom: 12 }} />
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            ATM Cash Counter
          </Title>
          <Text type="secondary">Sign in to manage cash inventory & dispensations</Text>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <Form.Item
            validateStatus={formik.touched.email && formik.errors.email ? 'error' : ''}
            help={formik.touched.email && formik.errors.email}
            style={{ marginBottom: 16 }}
          >
            <Input
              name="email"
              size="large"
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>

          <Form.Item
            validateStatus={formik.touched.password && formik.errors.password ? 'error' : ''}
            help={formik.touched.password && formik.errors.password}
            style={{ marginBottom: 20 }}
          >
            <Input.Password
              name="password"
              size="large"
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isLoggingIn}
            style={{ height: 46, fontSize: 16, fontWeight: 600, marginBottom: 12 }}
          >
            Sign In
          </Button>

          <Button
            type="default"
            size="middle"
            block
            icon={<ThunderboltOutlined />}
            onClick={handleFillDemo}
            style={{ marginBottom: 16 }}
          >
            Use Demo Credentials
          </Button>
        </form>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Don't have an account? </Text>
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register Now
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;


