import React from "react";
import { Layout, Menu, Button, Space, Typography, Tag, Modal } from "antd";
import {
  BankOutlined,
  DashboardOutlined,
  HistoryOutlined,
  LogoutOutlined,
  WifiOutlined,
  DisconnectOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Header } = Layout;
const { Title } = Typography;

export function Navbar({ isOnline, pendingCount, onSync, isSyncing }) {
  const { logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    Modal.confirm({
      title: "Log out of ATM Counter?",
      content: "You will need to sign in again to access the dashboard.",
      okText: "Log out",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: () => logout(),
    });
  };

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/transactions",
      icon: <HistoryOutlined />,
      label: "Transactions",
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#001529",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {/* Left: logo + nav menu */}
      <Space size="middle">
        <Space
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          <BankOutlined style={{ fontSize: "24px", color: "#1677ff" }} />
          <Title
            level={4}
            style={{ color: "#fff", margin: 0, fontWeight: 700 }}
          >
            ATM Counter
          </Title>
        </Space>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            borderBottom: "none",
            background: "transparent",
            minWidth: 280,
          }}
        />
      </Space>

      {/* Right: sync, online status, logout */}
      <Space size="middle">
        {pendingCount > 0 && (
          <Button
            type="primary"
            size="small"
            icon={<SyncOutlined spin={isSyncing} />}
            onClick={onSync}
            loading={isSyncing}
            style={{ background: "#fa8c16", borderColor: "#fa8c16" }}
          >
            Sync ({pendingCount})
          </Button>
        )}

        <Tag
          icon={isOnline ? <WifiOutlined /> : <DisconnectOutlined />}
          color={isOnline ? "success" : "error"}
          style={{
            padding: "4px 10px",
            fontSize: "13px",
            borderRadius: "12px",
            margin: 0,
          }}
        >
          {isOnline ? "Online" : "Offline"}
        </Tag>

        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          loading={isLoggingOut}
          style={{ color: "#fff" }}
        >
          Logout
        </Button>
      </Space>
    </Header>
  );
}

export default Navbar;
