import type { ThemeConfig } from 'antd';

// Brand palette — a clean, modern "social app" look.
export const brand = {
  primary: '#1877F2', // Facebook-style blue
  primaryHover: '#166FE5',
  success: '#42B72A',
  danger: '#E4405F',
  bg: '#F0F2F5', // app canvas
  surface: '#FFFFFF', // cards / sider
  text: '#050505',
  textSecondary: '#65676B',
  border: '#E4E6EB',
};

export const theme: ThemeConfig = {
  token: {
    colorPrimary: brand.primary,
    colorSuccess: brand.success,
    colorLink: brand.primary,
    colorBgLayout: brand.bg,
    colorText: brand.text,
    colorTextSecondary: brand.textSecondary,
    colorBorderSecondary: brand.border,
    borderRadius: 10,
    fontSize: 15,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  components: {
    Button: {
      controlHeight: 40,
      fontWeight: 600,
      primaryShadow: 'none',
    },
    Card: {
      paddingLG: 20,
    },
    Menu: {
      itemHeight: 46,
      itemBorderRadius: 8,
      itemSelectedBg: '#E7F0FF',
      itemSelectedColor: brand.primary,
    },
    Input: {
      controlHeight: 42,
    },
  },
};
