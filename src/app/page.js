"use client";

import { useState, useEffect } from "react";
import { Button, Typography, Space, Card, Layout, Spin, Row, Col } from "antd";
import { useRouter } from "next/navigation";
import { UserOutlined, LoginOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRedirect = (path) => {
    setLoading(true);
    router.push(path);
  };

  if (loading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
        <Col>
          <Spin size="large" />
        </Col>
      </Row>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#001529", padding: "0 50px" }}>
        <Title level={3} style={{ color: "white", margin: "16px 0" }}>
          My Website
        </Title>
      </Header>
      <Content style={{ padding: "50px" }}>
        <Row
          justify="center"
          align="middle"
          style={{ minHeight: "calc(100vh - 64px - 70px)" }}
        >
          <Col xs={24} sm={20} md={16} lg={12} xl={8}>
            <Card hoverable>
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%", textAlign: "center" }}
              >
                <Title level={1}>Welcome to Our Website</Title>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    icon={<LoginOutlined />}
                    onClick={() => handleRedirect("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    size="large"
                    icon={<UserOutlined />}
                    onClick={() => handleRedirect("/signup")}
                  >
                    Sign Up
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
