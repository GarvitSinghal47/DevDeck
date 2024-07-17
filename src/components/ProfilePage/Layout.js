// components/Layout.js
import { Layout as AntLayout, Spin, Space } from "antd";
import Header from "./Header";
import { useState, useEffect } from "react";
import Profile from "@/components/ProfileContent";
// import Education from "./Education";
import OpenSource from "./OpenSource";
import Projects from "./Projects";
import DSA from "./DSA";
import Resume from "./Resume";
// import ContactUs from "./ContactUs";

const { Content } = AntLayout;

export default function Layout({ userid }) {
  const [currentTab, setCurrentTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  // Simulate loading data or fetching user info
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const renderComponent = () => {
    switch (currentTab) {
      case "profile":
        return <Profile userid={userid} />;
      // case "education":
      //   return <Education userid={userid} />;
      case "opensource":
        return <OpenSource userid={userid} />;
      case "projects":
        return <Projects userid={userid} />;
      case "dsa":
        return <DSA userid={userid} />;
      case "resume":
        return <Resume userid={userid} />;
      // case "contact":
      //   return <ContactUs userid={userid} />;
      default:
        return <Profile userid={userid} />;
    }
  };

  return (
    <AntLayout style={{ minHeight: "100vh", position: "relative" }}>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Space size="large">
            <Spin size="large" tip="Loading..." />
          </Space>
        </div>
      )}
      <Header onTabChange={setCurrentTab} />
      <Content style={{ padding: "0 50px", marginTop: 64 }}>
        <div
          style={{
            background: "#fff",
            padding: 24,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {renderComponent()}
        </div>
      </Content>
      
    </AntLayout>
  );
}
