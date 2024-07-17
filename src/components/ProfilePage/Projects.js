import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Tag,
  Typography,
  Spin,
  Avatar,
} from "antd";
import {
  GithubOutlined,
  StarOutlined,
  ForkOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";

const { Title, Text } = Typography;

const GithubProfile = ({ userid }) => {
  const [user, setUser] = useState(null);
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userid) {
        const uid = typeof userid === "object" ? userid.uid : userid;

        if (!uid) {
          console.error("Invalid userid provided");
          setLoading(false);
          return;
        }

        try {
          const userRef = ref(db, `users/${uid}`);
          const userSnapshot = await get(userRef);
          let userData = null;

          if (userSnapshot.exists()) {
            userData = userSnapshot.val();
            setUser(userData);

            if (userData.github) {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/githubProject/${userData.github}`
              );
              setGithubData(response.data);
            }
          } else {
            console.error("No such user!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [userid]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (!user || !githubData) {
    return <div>User data not available</div>;
  }

  const { name, bio, avatar, repos, stars, followers, following, pinned } =
    githubData;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const languageData = pinned
    .flatMap((repo) =>
      repo.langs.map((lang) => ({
        name: lang.name,
        value: parseFloat(lang.perc),
      }))
    )
    .reduce((acc, curr) => {
      const existingLang = acc.find((item) => item.name === curr.name);
      if (existingLang) {
        existingLang.value += curr.value;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

  const repoData = pinned.map((repo) => ({
    name: repo.url.split("/").pop(),
    stars: repo.stars,
    forks: repo.forks,
    watchers: repo.watchers,
  }));

  return (
    <div style={{ padding: "20px" }}>
      <Card style={{ marginBottom: "20px" }}>
        <Row gutter={16} align="middle">
          <Col>
            <Avatar size={64} src={avatar} />
          </Col>
          <Col>
            <Title level={2}>{name}</Title>
            <Text>{bio}</Text>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Repositories"
              value={repos}
              prefix={<GithubOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Stars" value={stars} prefix={<StarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Followers"
              value={followers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Following"
              value={following}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card style={{ marginTop: "20px" }}>
            <Title level={4}>Language Distribution</Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {languageData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card style={{ marginTop: "20px" }}>
            <Title level={4}>Top Projects</Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={repoData}>
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="stars" fill="#8884d8" />
                <Bar dataKey="forks" fill="#82ca9d" />
                <Bar dataKey="watchers" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: "20px" }}>
        <Title level={4}>Projects</Title>
        <List
          itemLayout="horizontal"
          dataSource={pinned}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <a href={`https://github.com${item.url}`}>
                    {item.url.split("/").pop()}
                  </a>
                }
                description={
                  <>
                    <Text>{item.description}</Text>
                    <br />
                    <Tag icon={<StarOutlined />}>{item.stars}</Tag>
                    <Tag icon={<ForkOutlined />}>{item.forks}</Tag>
                    <Tag icon={<EyeOutlined />}>{item.watchers}</Tag>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default GithubProfile;
