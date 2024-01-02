// Login.tsx

import React from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Logo from '../images/logo.webp';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../redux/actions/authAction';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { useSelector } from 'react-redux';

interface Values { 
  email: string;
  password: string;
}
interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_picture: string;
}

// Auth state type
interface AuthState {
  user: UserData ;
  error: string | null;
  isAuthenticated: boolean; // Add an isAuthenticated flag
}

interface AppState {
  auth: AuthState;
  // other slices of state...
}

const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';

// Action type definitions
interface LoginUserSuccessAction {
  type: typeof LOGIN_USER_SUCCESS;
}

// Union of all action types
type AppAction = LoginUserSuccessAction;

const Container = styled.div`
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0px;
  @media (max-width: 600px) {
    position: relative;
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
  background-color: #f6f6f6;
  border-radius: 8px;
  text-align: center;
  width: 30%;
  margin-bottom: 10rem;
  @media (max-width: 600px) {
    width: auto;
  }
`;

const Heading = styled.h2`
  font-size: 50px;
`;

const Image = styled.img`
  max-width: 300px;
`;

const Login = () => {
  const [form] = Form.useForm();
  const isAuthenticated = useSelector((state: AppState) => state.auth.isAuthenticated);
  console.log(isAuthenticated)
  const navigate = useNavigate();

  const dispatch = useDispatch<ThunkDispatch<AppState, void, AppAction>>();
  
  const onFinish = async (values: Values) => {
    try{
      console.log("state: " + isAuthenticated);
      const loginResponse =  await dispatch(loginUser(values.email, values.password));
      if (loginResponse.success){
        setTimeout(() => navigate('/dashboard'), 2000);
        console.log(isAuthenticated)
      }
    }
    catch(error: unknown){
      console.log('error')
    }
  }


  return (
    <Container>
      <TopContainer>
        <Image src={Logo} alt="" />
      </TopContainer>
      <BottomContainer>
        <Heading>Login</Heading>
        <Form form={form} name="login" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>
          <Button type="link" onClick={() => navigate('/')}>
          Dont have an account? Signup!
        </Button>
        </Form>
      </BottomContainer>
      <ToastContainer />
    </Container>
    
  );
};

export default Login;
