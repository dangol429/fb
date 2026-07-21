import React, { useState } from 'react';
import { Form, Input, Button, Upload, Typography, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styled from 'styled-components';
import Logo from '../images/logo.webp';
import { firestore, storage } from '../firebase';
import { createUser, CreateUserSuccessAction } from '../redux/actions/authAction';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Rule } from 'antd/lib/form';
import { AppState } from '../types';
import { brand } from '../theme';

const { Title, Text } = Typography;

interface ValidatorRule {
  getFieldValue: (field: string) => string | number;
}

interface Values {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
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
  max-width: 440px;
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

const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const dispatch = useDispatch<ThunkDispatch<AppState, void, CreateUserSuccessAction>>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: Values) => {
    setSubmitting(true);
    try {
      let profilePictureUrl: string | null = null;
      if (uploadedFile) {
        profilePictureUrl = await uploadFile(uploadedFile);
        if (profilePictureUrl === null) {
          message.error('Failed to upload profile picture. Please try again.');
          return;
        }
      }

      const signupResponse = await dispatch(createUser(firestore, values, profilePictureUrl));
      if (signupResponse.success) {
        form.resetFields();
        setUploadedFile(null);
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const validateConfirmPassword = ({ getFieldValue }: ValidatorRule) => ({
    validator(_: Rule, value: string) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('The passwords do not match'));
    },
  });

  const uploadFile = async (file: File): Promise<string | null> => {
    const values = form.getFieldsValue();
    try {
      const storageRef = ref(storage, `profileImages/${values.email}/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file. Please try again.');
      return null;
    }
  };

  // Capture the file directly and return false so Ant Design keeps it in the
  // list without attempting an auto-upload.
  const handleBeforeUpload = (file: File) => {
    setUploadedFile(file);
    return false;
  };

  return (
    <Page>
      <Card>
        <LogoImg src={Logo} alt="logo" />
        <Title level={2} style={{ marginBottom: 4 }}>
          Create your account
        </Title>
        <Text type="secondary">Join Socially in a few seconds</Text>

        <Form form={form} name="signup" onFinish={onFinish} layout="vertical" style={{ marginTop: 24, textAlign: 'left' }}>
          <Form.Item name="first_name" rules={[{ required: true, message: 'Please input your first name!' }]}>
            <Input prefix={<UserOutlined />} placeholder="First name" size="large" />
          </Form.Item>

          <Form.Item name="last_name" rules={[{ required: true, message: 'Please input your last name!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Last name" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" autoComplete="email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[{ required: true, message: 'Please confirm your password!' }, validateConfirmPassword]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" size="large" autoComplete="new-password" />
          </Form.Item>

          <Form.Item label="Profile photo (optional)">
            <Upload
              name="profilePhoto"
              listType="picture"
              maxCount={1}
              accept="image/jpeg,image/png"
              beforeUpload={handleBeforeUpload}
              onRemove={() => setUploadedFile(null)}
            >
              <Button icon={<UploadOutlined />}>Upload photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              Sign up
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary">Already have an account? </Text>
        <Button type="link" style={{ padding: 4, color: brand.primary }} onClick={() => navigate('/login')}>
          Log in
        </Button>
      </Card>
    </Page>
  );
};

export default Signup;
