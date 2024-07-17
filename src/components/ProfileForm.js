"use client";

import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Row,
  Col,
  Card,
  Typography,
  Space,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { updateUserDocument, uploadFile } from "@/lib/firebase";
import { logoutUser } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function ProfileForm({ user }) {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const router = useRouter();

  const handleViewPublicProfile = () => {
    router.push(`/${user.uid}`);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let resumeUrl = user.resumeUrl;
      if (fileList.length > 0) {
        resumeUrl = await uploadFile(fileList[0].originFileObj, user.uid);
      }

      await updateUserDocument(user.uid, {
        ...values,
        resumeUrl,
      });

      message.success("Profile updated successfully");
    } catch (error) {
      message.error("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList }) => setFileList(fileList);

  const handleLogout = async () => {
    try {
      await logoutUser();
      message.success("Logged out successfully");
      window.location.href = "/login"; // Redirect to the login page
    } catch (error) {
      message.error("Failed to logout: " + error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
        padding: "20px",
      }}
    >
      <Card
        style={{
          maxWidth: 600,
          width: "100%",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2} style={{ margin: 0 }}>
              Update Your Profile
            </Title>
            <Button type="primary" danger onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <Text
            type="secondary"
            style={{
              textAlign: "center",
              marginBottom: "20px",
              display: "block",
            }}
          >
            Editing Profile: {user.name}
          </Text>
          <Form
            name="profile"
            initialValues={user}
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input placeholder="Enter your name" size="large" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="github" label="GitHub Username">
                  <Input
                    placeholder="Enter your GitHub username"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="codechef" label="CodeChef Username">
                  <Input
                    placeholder="Enter your CodeChef username"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="codeforces" label="Codeforces Username">
                  <Input
                    placeholder="Enter your Codeforces username"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="leetcode" label="LeetCode Username">
                  <Input
                    placeholder="Enter your LeetCode username"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Upload
                beforeUpload={() => false}
                onChange={handleFileChange}
                fileList={fileList}
              >
                <Button icon={<UploadOutlined />}>Update Resume</Button>
              </Upload>
            </Form.Item>
            <Text
              type="danger"
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "10px",
              }}
            >
              Please provide only your username for GitHub, CodeChef,
              Codeforces, and LeetCode.
            </Text>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ marginBottom: "10px" }}
              >
                Update Profile
              </Button>
              <Button type="primary" onClick={handleViewPublicProfile} block>
                View Public Profile
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
