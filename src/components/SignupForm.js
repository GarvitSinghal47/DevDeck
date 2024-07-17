import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Row,
  Col,
  Spin,
  Card,
  Typography,
  Space,
  Divider,
} from "antd";
import { useRouter } from "next/navigation";
import { signupUser, createUserDocument, uploadFile } from "@/lib/firebase";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const router = useRouter();

  const onFinish = async (values) => {
    setSubmitting(true);
    setLoading(true);
    try {
      const user = await signupUser(values.email, values.password);

      if (!user || !user.uid) {
        throw new Error("Failed to create user account");
      }

      let resumeUrl = "";
     
      if (fileList.length > 0) {
        resumeUrl = await uploadFile(fileList[0].originFileObj, user.uid);
      }
      console.log(resumeUrl);

      await createUserDocument(user.uid, {
        name: values.name,
        email: values.email,
        github: values.github,
        codechef: values.codechef,
        codeforces: values.codeforces,
        leetcode: values.leetcode,
        resumeUrl: resumeUrl,
      });

      message.success("Signup successful");
      router.push("/profile");
    } catch (error) {
      console.error("Signup error:", error);
      message.error(`Signup failed: ${error.message}`);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList }) => setFileList(fileList);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
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
          <Title level={2} style={{ textAlign: "center", margin: 0 }}>
            Create an Account
          </Title>
          <Form
            name="signup"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item name="name" rules={[{ required: true }]}>
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true }]}>
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="github">
                  <Input placeholder="GitHub Username" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="codechef">
                  <Input placeholder="CodeChef Username" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="codeforces">
                  <Input placeholder="Codeforces Username" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="leetcode">
                  <Input placeholder="LeetCode Username" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Upload
                beforeUpload={() => false}
                onChange={handleFileChange}
                fileList={fileList}
              >
                <Button icon={<UploadOutlined />}>Upload Resume</Button>
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
                loading={submitting}
                block
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>
          <Divider plain>Or</Divider>
          <Space
            direction="vertical"
            size="small"
            style={{ width: "100%", textAlign: "center" }}
          >
            <Text>Already have an account?</Text>
            <Button type="link" onClick={() => router.push("/login")}>
              Log in now
            </Button>
          </Space>
        </Space>
      </Card>
      {loading && (
        <Row
          justify="center"
          align="middle"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <Col>
            <Spin size="large" tip="Loading..." />
          </Col>
        </Row>
      )}
    </div>
  );
}
