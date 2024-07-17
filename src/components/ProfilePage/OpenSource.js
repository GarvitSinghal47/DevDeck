import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Tag,
  Typography,
  Spin,
  Pagination,
  Tooltip,
  Select,
  Button,
  Space,
} from "antd";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { GithubOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];
const HIGHLIGHT_COLOR = "#FFD700"; // Vibrant yellow for highlighting

const GithubContributions = ({ userid }) => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    repositories: [],
    states: [],
  });

  useEffect(() => {
    if (userid) {
      const fetchData = async () => {
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
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/githubcontributions/${userData.github}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    withCredentials: "true",
                  },
                }
              );

              if (Array.isArray(response.data)) {
                setData(response.data);
                setFilteredData(response.data);
              } else {
                console.error("Data fetched is not an array");
                setData([]);
                setFilteredData([]);
              }
            }
          } else {
            console.error("No such user!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setData([]);
          setFilteredData([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [userid]);

  useEffect(() => {
    updateFilteredData();
  }, [selectedFilters, data]);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleBarClick = (entry) => {
    const repo = entry.payload.repository;
    let newRepos = [...selectedFilters.repositories];
    if (newRepos.includes(repo)) {
      newRepos = newRepos.filter((r) => r !== repo);
    } else {
      newRepos.push(repo);
    }
    setSelectedFilters({ ...selectedFilters, repositories: newRepos });
  };

  const handlePieClick = (entry) => {
    const state = entry.name;
    let newStates = [...selectedFilters.states];
    if (newStates.includes(state)) {
      newStates = newStates.filter((s) => s !== state);
    } else {
      newStates.push(state);
    }
    setSelectedFilters({ ...selectedFilters, states: newStates });
  };

  const updateFilteredData = () => {
    let filtered = data;
    if (selectedFilters.repositories.length > 0) {
      filtered = filtered.filter((pr) =>
        selectedFilters.repositories.includes(pr.repository)
      );
    }
    if (selectedFilters.states.length > 0) {
      filtered = filtered.filter((pr) => {
        const prState = pr.mergedBy
          ? "Merged"
          : pr.state.charAt(0).toUpperCase() + pr.state.slice(1);
        return selectedFilters.states.includes(prState);
      });
    }
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleItemClick = (item) => {
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleFilterReset = () => {
    setFilteredData(data);
    setCurrentPage(1);
    setSelectedItem(null);
    setSelectedFilters({ repositories: [], states: [] });
  };

  const getBoxColor = (pr) => {
    if (pr.state === "open") return "#e6fffb";
    if (pr.mergedBy) return "#f9f0ff";
    return "#fff1f0";
  };

  const removeFilter = (type, value) => {
    if (type === "repository") {
      setSelectedFilters((prev) => ({
        ...prev,
        repositories: prev.repositories.filter((repo) => repo !== value),
      }));
    } else if (type === "state") {
      setSelectedFilters((prev) => ({
        ...prev,
        states: prev.states.filter((state) => state !== value),
      }));
    }
  };

  const renderSelectedFilters = () => {
    const filters = [
      ...selectedFilters.repositories.map((repo) => ({
        type: "repository",
        value: repo,
      })),
      ...selectedFilters.states.map((state) => ({
        type: "state",
        value: state,
      })),
    ];

    return (
      <Space wrap>
        {filters.map((filter, index) => (
          <Tag
            key={index}
            closable
            onClose={() => removeFilter(filter.type, filter.value)}
            color={filter.type === "repository" ? "blue" : "green"}
          >
            {filter.value}
          </Tag>
        ))}
      </Space>
    );
  };

  if (loading) {
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
  }

  if (!user) return <div>User not found</div>;
  if (!user.github) return <div>GitHub username not provided</div>;

  const totalPRs = data.length;
  const openPRs = data.filter((pr) => pr.state === "open").length;
  const closedPRs = data.filter(
    (pr) => pr.state === "closed" && !pr.mergedBy
  ).length;
  const mergedPRs = data.filter((pr) => pr.mergedBy).length;

  const repositoriesContributed = [...new Set(data.map((pr) => pr.repository))]
    .length;

  const prsByRepository = data.reduce((acc, pr) => {
    acc[pr.repository] = (acc[pr.repository] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(prsByRepository).map(([repo, count]) => ({
    repository: repo,
    pullRequests: count,
  }));

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const prStatusData = [
    { name: "Open", value: openPRs },
    { name: "Closed", value: closedPRs },
    { name: "Merged", value: mergedPRs },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>{user.name} Open Source Contributions</Title>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Pull Requests" value={totalPRs} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Open Pull Requests" value={openPRs} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Closed Pull Requests" value={closedPRs} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Merged Pull Requests" value={mergedPRs} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "20px" }}>
        <Col span={12}>
          <Card>
            <Title level={4}>
              Repositories Contributed: {repositoriesContributed}
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="repository" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="pullRequests" onClick={handleBarClick}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        selectedFilters.repositories.includes(entry.repository)
                          ? HIGHLIGHT_COLOR
                          : COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Title level={4}>Pull Request Status</Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  onClick={handlePieClick}
                >
                  {prStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        selectedFilters.states.includes(entry.name)
                          ? HIGHLIGHT_COLOR
                          : COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "20px" }}>
        <Col span={24}>
          <Card>
            <Title level={4}>Pull Requests List</Title>
            <Space style={{ marginBottom: "10px" }}>
              <Button
                onClick={handleFilterReset}
                type="primary"
                style={{
                  backgroundColor: "#ff4d4f",
                  borderColor: "#ff4d4f",
                  color: "#fff",
                  borderRadius: "5px",
                }}
              >
                Reset Filters
              </Button>
              {renderSelectedFilters()}
            </Space>
            <List
              itemLayout="vertical"
              dataSource={paginatedData}
              renderItem={(item) => (
                <List.Item
                  style={{
                    backgroundColor:
                      selectedItem && selectedItem.id === item.id
                        ? HIGHLIGHT_COLOR
                        : getBoxColor(item),
                    marginBottom: "10px",
                    padding: "15px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <List.Item.Meta
                    title={
                      <div>
                        <a href={item.prUrl}>{item.title}</a>
                        <span style={{ float: "right" }}>
                          <Text type="success" style={{ marginRight: "10px" }}>
                            {item.additions} +
                          </Text>
                          <Text type="danger">{item.deletions} -</Text>
                        </span>
                      </div>
                    }
                    description={
                      <div>
                        <Text>
                          <GithubOutlined /> {item.repository}
                        </Text>
                        <Text style={{ marginLeft: "20px" }}>
                          State:{" "}
                          <Tag
                            color={
                              item.state === "open"
                                ? "green"
                                : item.mergedBy
                                ? "purple"
                                : "red"
                            }
                          >
                            {item.state === "closed" && item.mergedBy
                              ? "merged"
                              : item.state}
                          </Tag>
                        </Text>
                        <Text style={{ marginLeft: "20px" }}>
                          Opened on:{" "}
                          {new Date(item.openedDate).toLocaleDateString()}
                        </Text>
                        <Text style={{ marginLeft: "20px" }}>
                          Files Changed: {item.changedFiles}
                        </Text>
                        {item.mergedBy && (
                          <Tooltip title={`Merged by: ${item.mergedBy}`}>
                            <Text style={{ marginLeft: "20px" }}>
                              Merged by: {item.mergedBy}
                            </Text>
                          </Tooltip>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredData.length}
              onChange={handlePageChange}
              showSizeChanger
              onShowSizeChange={handlePageChange}
              style={{ marginTop: "20px" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GithubContributions;
