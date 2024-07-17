import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Spin,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/firebase";

const { Title, Text } = Typography;

export default function LoginForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await loginUser(values.email, values.password);
      message.success("Login successful");
      router.push("/profile");
    } catch (error) {
      message.error("Login failed: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
        <Col>
          <Spin size="large" tip="Loading..." />
        </Col>
      </Row>
    );
  }

  return (
    <Card
      style={{
        maxWidth: 400,
        width: "100%",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2} style={{ textAlign: "center", margin: 0 }}>
          Welcome Back
        </Title>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
              block
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
        <Divider plain>Or</Divider>
        <Space
          direction="vertical"
          size="small"
          style={{ width: "100%", textAlign: "center" }}
        >
          <Text>Don't have an account?</Text>
          <Button type="link" onClick={() => router.push("/signup")}>
            Sign up now
          </Button>
        </Space>
      </Space>
    </Card>
  );
}
