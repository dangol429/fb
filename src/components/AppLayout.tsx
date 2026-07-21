import React, { useState } from 'react';
import { Layout, Menu, Drawer, Avatar, Dropdown, Grid, Button, App } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  LikeOutlined,
  BookOutlined,
  FormOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import Logo from '../images/logo.webp';
import { logoutUser, LogoutUserSuccessAction } from '../redux/actions/authAction';
import { useAppSelector } from '../hooks';
import { AppState } from '../types';
import { brand } from '../theme';

const { Header, Sider, Content } = Layout;

const HEADER_HEIGHT = 56;
const SIDER_WIDTH = 260;

const StyledHeader = styled(Header)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: ${HEADER_HEIGHT}px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${brand.surface};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BrandName = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${brand.primary};
  letter-spacing: -0.5px;
`;

const LogoImg = styled.img`
  height: 34px;
  width: 34px;
  object-fit: contain;
`;

const StyledSider = styled(Sider)`
  position: fixed !important;
  top: ${HEADER_HEIGHT}px;
  left: 0;
  bottom: 0;
  overflow: auto;
  background: ${brand.surface} !important;
  border-right: 1px solid ${brand.border};

  .ant-layout-sider-children {
    background: ${brand.surface};
    padding: 16px 12px;
  }

  .ant-menu {
    border-inline-end: none !important;
  }
`;

const PageTitle = styled.h1`
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 700;
  color: ${brand.text};
`;

const navItems: MenuProps['items'] = [
  { key: '/dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Home</Link> },
  { key: '/my-likes', icon: <LikeOutlined />, label: <Link to="/my-likes">My Likes</Link> },
  { key: '/my-bookmarks', icon: <BookOutlined />, label: <Link to="/my-bookmarks">My Bookmarks</Link> },
  { key: '/my-posts', icon: <FormOutlined />, label: <Link to="/my-posts">My Posts</Link> },
  { key: '/my-profile', icon: <UserOutlined />, label: <Link to="/my-profile">My Profile</Link> },
];

interface AppLayoutProps {
  title?: string;
  maxWidth?: number;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ title, maxWidth = 700, children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.lg;

  const { message, modal } = App.useApp();
  const dispatch = useDispatch<ThunkDispatch<AppState, void, LogoutUserSuccessAction>>();
  const currentUser = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    modal.confirm({
      title: 'Log out',
      content: 'Are you sure you want to log out?',
      okText: 'Log out',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await dispatch(logoutUser());
          message.success('Logged out successfully.');
          navigate('/login');
        } catch {
          message.error('Something went wrong while logging out.');
        }
      },
    });
  };

  const navMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={navItems}
      onClick={() => setDrawerOpen(false)}
      style={{ background: 'transparent' }}
    />
  );

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/my-profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Log out',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const displayName = `${currentUser.first_name ?? ''} ${currentUser.last_name ?? ''}`.trim();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <StyledHeader>
        <BrandRow>
          {!isDesktop && (
            <Button
              type="text"
              aria-label="Open menu"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
            />
          )}
          <BrandRow style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <LogoImg src={Logo} alt="logo" />
            <BrandName>Socially</BrandName>
          </BrandRow>
        </BrandRow>

        <Dropdown menu={{ items: userMenu }} trigger={['click']} placement="bottomRight">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            {isDesktop && displayName && (
              <span style={{ fontWeight: 600 }}>{displayName}</span>
            )}
            <Avatar
              src={currentUser.profile_picture}
              icon={<UserOutlined />}
              style={{ border: `2px solid ${brand.primary}` }}
            />
          </div>
        </Dropdown>
      </StyledHeader>

      <Layout style={{ marginTop: HEADER_HEIGHT }}>
        {isDesktop && (
          <StyledSider width={SIDER_WIDTH} theme="light">
            {navMenu}
          </StyledSider>
        )}

        <Drawer
          placement="left"
          open={!isDesktop && drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={SIDER_WIDTH}
          styles={{ body: { padding: '12px 8px' } }}
          title={<BrandName>Socially</BrandName>}
        >
          {navMenu}
        </Drawer>

        <Content
          style={{
            marginLeft: isDesktop ? SIDER_WIDTH : 0,
            padding: screens.xs ? '16px' : '28px 24px',
          }}
        >
          <div style={{ maxWidth, margin: '0 auto', width: '100%' }}>
            {title && <PageTitle>{title}</PageTitle>}
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
