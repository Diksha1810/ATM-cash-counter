import React from 'react';
import { Card, Form, Input, Button, Typography, Divider } from 'antd';
import { MailOutlined, LockOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { registerSchema } from '../validations/authSchema';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        await register({ email: values.email, password: values.password });
        navigate('/dashboard');
      } catch {
        // Handled in AuthContext
      }
    },
  });

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
          <UserAddOutlined style={{ fontSize: 42, color: '#52c41a', marginBottom: 12 }} />
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Create Account
          </Title>
          <Text type="secondary">Sign up to access the ATM management console</Text>
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
            style={{ marginBottom: 16 }}
          >
            <Input.Password
              name="password"
              size="large"
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Password (Min. 8 chars)"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>

          <Form.Item
            validateStatus={
              formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''
            }
            help={formik.touched.confirmPassword && formik.errors.confirmPassword}
            style={{ marginBottom: 20 }}
          >
            <Input.Password
              name="confirmPassword"
              size="large"
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Confirm Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isRegistering}
            style={{
              height: 46,
              fontSize: 16,
              fontWeight: 600,
              background: '#52c41a',
              marginBottom: 12,
            }}
          >
            Register
          </Button>
        </form>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Already have an account? </Text>
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;

