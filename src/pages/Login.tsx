import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Logo from '../images/logo.webp';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../redux/actions/authAction';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { AppState } from '../types';
import { brand } from '../theme';

const { Title, Text } = Typography;

interface Values {
  email: string;
  password: string;
}

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #e7f0ff 0%, #f0f2f5 100%);
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const LogoImg = styled.img`
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: 12px;
`;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  const dispatch = useDispatch<ThunkDispatch<AppState, void, AnyAction>>();

  const onFinish = async (values: Values) => {
    setSubmitting(true);
    try {
      const loginResponse = await dispatch(loginUser(values.email, values.password));
      if (loginResponse.success) {
        navigate('/dashboard');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <Card>
        <LogoImg src={Logo} alt="logo" />
        <Title level={2} style={{ marginBottom: 4 }}>
          Welcome back
        </Title>
        <Text type="secondary">Log in to continue to Socially</Text>

        <Form form={form} name="login" onFinish={onFinish} layout="vertical" style={{ marginTop: 28, textAlign: 'left' }}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" autoComplete="email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" autoComplete="current-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              Log in
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary">Don&apos;t have an account? </Text>
        <Button type="link" style={{ padding: 4, color: brand.primary }} onClick={() => navigate('/')}>
          Sign up
        </Button>
      </Card>
    </Page>
  );
};

export default Login;
