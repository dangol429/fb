import React, { useState } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styled from 'styled-components';
import { UploadFile } from 'antd';
import Logo from '../images/logo.webp';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore, storage } from '../firebase';
import { createUser } from '../redux/actions/authAction';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Rule } from 'antd/lib/form';
import { AppState } from '../redux/reducers/rootReducer';
import {CreateUserSuccessAction} from '../redux/actions/authAction' 


interface ValidatorRule {
  getFieldValue: (field: string) => string | number;
}

type UploadChangeParam = {
  file: UploadFile;
  fileList: UploadFile[];
  event?: { percent: number };
};


interface Values { 
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

// interface UserData {
//   first_name: string;
//   last_name: string;
//   email: string;
//   profile_picture: string;
// }

// // Auth state type
// interface AuthState {
//   user: UserData ;
//   error: string | null;
//   isAuthenticated: boolean; // Add an isAuthenticated flag
// }

// interface AppState {
//   auth: AuthState;
//   // other slices of state...
// }

// const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS';

// // Action type definitions
// interface CreateUserSuccessAction {
//   type: typeof CREATE_USER_SUCCESS;
// }

// // Union of all action types
// type AppAction = CreateUserSuccessAction; // Add other action types as needed

const Container = styled.div`
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0px;
  @media (max-width: 600px) {
    position: relative;
    margin-top: 100px;
  }
`;

const TopContainer = styled.div`
  flex: 1;
  text-align: center;
  margin-top: 10rem;
`;

const BottomContainer = styled.div`
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
  background-color: #f6f6f6;
  width: 30%;
  margin-bottom: 10rem;
  @media (max-width: 600px) {
    width: 250px;
  }
`;

const Heading = styled.h2`
  font-size: 50px;
`;

const Image = styled.img`
  max-width: 300px;
`;

const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch<ThunkDispatch<AppState, void, CreateUserSuccessAction>>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onFinish = async (values: Values) => {
    try {
      // Check if a file is uploaded
      if (uploadedFile) {
        const profilePictureUrl = await uploadFile(uploadedFile);

        // Check if profilePictureUrl is not null before dispatching
        if (profilePictureUrl !== null) {
          const signupResponse = await dispatch(createUser(firestore, values, profilePictureUrl ));
          if (signupResponse.success) {
            form.resetFields();
            setUploadedFile(null);
            console.log('success');
            setTimeout(() => navigate('/login'), 2000);
          }
          else{
            console.log('error');
          }
        } else {
          // Handle the case where profilePictureUrl is null
          message.error('Failed to upload profile picture. Please try again.');
        }
      } else {
        // Handle the case where no file is uploaded
        const signupResponse = await dispatch(createUser(firestore, values, null));
        if (signupResponse.success) {
          form.resetFields();
          console.log('success');
          setTimeout(() => navigate('/login'), 2000);
        }
        else{
          console.log('error')
        }
      }
    } catch (error: unknown) {
      console.error('Signup error:');
    }
  };

  const validateConfirmPassword = ({ getFieldValue }: ValidatorRule) => ({
    validator(_: Rule, value: string) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      } else {
        return Promise.reject('The passwords do not match');
      }
    },
  });

  const uploadFile = async (file: File): Promise<string | null> => {
    const values = form.getFieldsValue();
    try {
      const storageRef = ref(storage, `profileImages/${values.email}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file. Please try again.');
      return null;
    }
  };

  const handleChange = (info: UploadChangeParam) => {
    if (info.fileList.length > 0) {
      // Check if originFileObj is defined
      const file = info.file.originFileObj;
      setUploadedFile(file ? file : null);
    } else {
      // Handle the case when fileList is empty
      setUploadedFile(null);
    }
  };

  return (
    <Container>
      <TopContainer>
        <Image src={Logo} alt="" />
      </TopContainer>
      <BottomContainer>
        <Heading>Sign Up</Heading>
        <Form form={form} name="signup" onFinish={onFinish}>
          <Form.Item
            name="first_name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="last_name"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              validateConfirmPassword,
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item label="Profile Photo" name="profilePhoto">
            <Upload
              name="profilePhoto"
              listType="picture"
              maxCount={1}
              accept="image/jpeg,image/png"
              onChange={handleChange}
            >
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Sign Up
            </Button>
          </Form.Item>
          <Button type="link" onClick={() => navigate('/login')}>
            Already have an account? Login
          </Button>
        </Form>
      </BottomContainer>
      <ToastContainer />
    </Container>
  );
};

export default Signup;
