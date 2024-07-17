// components/Header.js
import { Menu } from "antd";
import { useState } from "react";

export default function Header({ onTabChange }) {
  const [currentKey, setCurrentKey] = useState("profile");

  const items = [
    { label: "Profile", key: "profile" },
    // { label: "Education", key: "education" },
    { label: "Open Source", key: "opensource" },
    { label: "Projects", key: "projects" },
    { label: "DSA", key: "dsa" },
    { label: "Resume", key: "resume" },
    // { label: "Contact", key: "contact" },
  ];

  const handleClick = (e) => {
    setCurrentKey(e.key);
    onTabChange(e.key);
  };

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[currentKey]}
      items={items}
      onClick={handleClick}
    />
  );
}
