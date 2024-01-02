import React, { useState } from 'react';
import { Layout, Menu,Modal } from 'antd';
import {
  HomeOutlined,
  LikeOutlined,
  BookOutlined,
  FormOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Facebook from '../images/logo.webp';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { logoutUser } from '../redux/actions/authAction';
import { useSelector } from 'react-redux';
import {LogoutUserSuccessAction} from '../redux/actions/authAction' 
import { MenuOutlined } from '@ant-design/icons';



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

const { Sider } = Layout;

const SidebarWrapper = styled(Sider)`
  width: 300px;
  height: 100vh;
  overflow: hidden;
  margin-top: 50px;
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001; // Above the sidebar
  background-color: #1890ff; // Primary button color
  color: white; // Text color
  border: none; // Remove default border
  border-radius: 4px; // Rounded corners
  padding: 10px; // Padding around the icon
  font-size: 16px; // Font size for the icon
  cursor: pointer; // Cursor changes on hover
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); // Shadow effect for depth
  display: flex; // To center the icon
  align-items: center; // Align icon vertically
  justify-content: center; // Align icon horizontally

  &:hover {
    background-color: #096dd9; // Darker shade on hover
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); // Larger shadow on hover
  }

  &:focus {
    outline: none; // Remove outline on focus
  }
`;


const MenuWrapper = styled(Menu)`
  height: 100%;
  position: fixed;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const StyledLink = styled(Link)`
  margin-bottom: 200px;
`;

const SidebarComponent = styled.div`
  position: absolute;
  @media (max-width: 600px) {
    position: absolute;
    z-index: 100;
  }
`;

const Logo = styled.img`
  margin-top: 37rem;
  width: 10rem;
  position: absolute;
  left: 50%;
  transform: translate(-50%);
`;

const StyledModal = styled(Modal)`
  .ant-modal {
    top: 50%;
    transform: translateY(-50%);
  }
  @media (max-width: 600px) {
    width:260px !important;
    margin-left: 60px !important;
  }
`;


const Sidebar = () => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<AppState, void, LogoutUserSuccessAction>>(); // Use ThunkDispatch
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation hook to get the current location
  const isAuthenticated = useSelector((state: AppState) => state.auth.isAuthenticated);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  const showLogoutConfirmation = () => {
    setLogoutModalVisible(true);
  };

  const handleLogout = async () => {
    console.log(isAuthenticated);
    try {
      await dispatch(logoutUser());
      console.log('User logged out');
      toast.success('Logged Out Successfully!');
      setLogoutModalVisible(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: unknown) {
      console.log('error while logging out.');
    }
  };

  const handleCancelLogout = () => {
    setLogoutModalVisible(false);
  };

  return (
    <>
    <ToggleButton onClick={toggleSidebar}><MenuOutlined /></ToggleButton> {/* Toggle button */}
      {isSidebarVisible && (
      <SidebarComponent>
        <SidebarWrapper theme="dark" width={260}>
          <MenuWrapper mode="vertical" theme="light" defaultSelectedKeys={['1']} selectedKeys={[location.pathname]}>
            {/* Use selectedKeys to highlight the active menu based on the current route */}
            <Menu.Item key="/dashboard" icon={<HomeOutlined />}>
              <StyledLink to="/dashboard">Home</StyledLink>
            </Menu.Item>
            <Menu.Item key="/my-likes" icon={<LikeOutlined />}>
              <StyledLink to="/my-likes">My Likes</StyledLink>
            </Menu.Item>
            <Menu.Item key="/my-bookmarks" icon={<BookOutlined />}>
              <StyledLink to="/my-bookmarks">My Bookmarks</StyledLink>
            </Menu.Item>
            <Menu.Item key="/my-posts" icon={<FormOutlined />}>
              <StyledLink to="/my-posts">My Posts</StyledLink>
            </Menu.Item>
            <Menu.Item key="/my-profile" icon={<UserOutlined />}>
              <StyledLink to="/my-profile">My Profile</StyledLink>
            </Menu.Item>
            <Menu.Item key="logout" onClick={showLogoutConfirmation}>
              <LogoutOutlined /> Logout
            </Menu.Item>
            <Logo src={Facebook} alt="" />
          </MenuWrapper>
        </SidebarWrapper>
        <StyledModal
          title="Logout Confirmation"
          open={logoutModalVisible}
          onOk={handleLogout}
          onCancel={handleCancelLogout}
          okText="Yes"
          cancelText="No"
        >
          <p>Are you sure you want to logout?</p>
        </StyledModal>
      </SidebarComponent>
        )}
      <ToastContainer />
    </>
  );
};

export default Sidebar;
