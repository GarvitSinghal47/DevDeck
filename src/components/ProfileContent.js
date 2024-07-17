import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  Card,
  Typography,
  Divider,
  Spin,
  Avatar,
  Row,
  Col,
  Button,
} from "antd";
import {
  UserOutlined,
  GithubOutlined,
  MailOutlined,
  CodeOutlined,
} from "@ant-design/icons";

const { Title, Text, Link } = Typography;

export default function Profile({ userid }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userRef = ref(db, `users/${userid}`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        setUser(userSnapshot.val());
      } else {
        console.error("No such user!");
      }
      setLoading(false);
    };

    fetchUser();
  }, [userid]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );

  if (!user)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        <Title level={3}>User not found</Title>
      </div>
    );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
      <Card
        title={
          <Title level={2} style={{ textAlign: "center" }}>
            Public Profile
          </Title>
        }
        bordered={false}
        style={{
          width: "100%",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
        extra={
          <Avatar
            size={64}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#87d068" }}
          />
        }
      >
        <Row gutter={16}>
          <Col span={24} style={{ textAlign: "center", marginBottom: "20px" }}>
            <Text strong>
              <MailOutlined /> Email:
            </Text>{" "}
            <Text>{user.email}</Text>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={24}>
            <Text strong>
              <GithubOutlined /> GitHub:
            </Text>{" "}
            <Link
              href={`https://github.com/${user.github}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1890ff" }}
            >
              {user.github}
            </Link>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={24}>
            <Text strong>
              <CodeOutlined /> CodeChef:
            </Text>{" "}
            <Link
              href={`https://www.codechef.com/users/${user.codechef}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#5d3fd3" }}
            >
              {user.codechef}
            </Link>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={24}>
            <Text strong>
              <CodeOutlined /> Codeforces:
            </Text>{" "}
            <Link
              href={`https://codeforces.com/profile/${user.codeforces}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#00a2d4" }}
            >
              {user.codeforces}
            </Link>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={24}>
            <Text strong>
              <CodeOutlined /> LeetCode:
            </Text>{" "}
            <Link
              href={`https://leetcode.com/${user.leetcode}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#f5a623" }}
            >
              {user.leetcode}
            </Link>
          </Col>
        </Row>
        
      </Card>
    </div>
  );
}
