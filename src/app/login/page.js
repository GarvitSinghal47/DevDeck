"use client";

import LoginForm from "@/components/LoginForm";
import { Row, Col } from 'antd';

export default function Login() {
  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col xs={22} sm={16} md={12} lg={8}>
        <LoginForm />
      </Col>
    </Row>
  );
}
