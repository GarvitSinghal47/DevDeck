import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Avatar,
  Checkbox,
  Table,
  Tabs,
  Alert,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Scatter,
} from "recharts";
import axios from "axios";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const CodingProfile = ({ userid }) => {
  const [user, setUser] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [codechefData, setCodechefData] = useState(null);
  const [codeforcesData, setCodeforcesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    leetcode: true,
    codechef: true,
    codeforces: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const uid = typeof userid === "object" ? userid.uid : userid;
        if (!uid) throw new Error("Invalid userid provided");

        const userRef = ref(db, `users/${uid}`);
        const userSnapshot = await get(userRef);
        if (!userSnapshot.exists()) throw new Error("User not found");

        const userData = userSnapshot.val();
        setUser(userData);

        const fetchPlatformData = async (platform, username) => {
          if (username) {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/${platform}/${username}`
            );
            return response.data;
          }
          return null;
        };

        const [leetcode, codechef, codeforces] = await Promise.all([
          fetchPlatformData("leetcode", userData.leetcode),
          fetchPlatformData("codechef", userData.codechef),
          fetchPlatformData("codeforces", userData.codeforces),
        ]);

        setLeetcodeData(leetcode?.message);
        setCodechefData(codechef);
        setCodeforcesData(codeforces);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userid]);

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms((prev) => ({ ...prev, [platform]: !prev[platform] }));
  };

  const prepareRatingData = useMemo(() => {
    const data = [
      {
        name: "LeetCode",
        rating: leetcodeData?.userContestRanking?.rating || 0,
      },
      { name: "CodeChef", rating: parseInt(codechefData?.rating) || 0 },
      {
        name: "Codeforces",
        rating: parseInt(codeforcesData?.user_info?.rating) || 0,
      },
    ];
    return data.filter((item) => selectedPlatforms[item.name.toLowerCase()]);
  }, [leetcodeData, codechefData, codeforcesData, selectedPlatforms]);

  const prepareLeetcodeDifficultyData = useMemo(
    () =>
      leetcodeData?.userProfileUserQuestionProgressV2?.numAcceptedQuestions.map(
        (item) => ({
          name: item.difficulty,
          value: item.count,
        })
      ) || [],
    [leetcodeData]
  );

  const prepareTotalProblemsSolvedData = useMemo(() => {
    const data = [
      {
        name: "LeetCode",
        value:
          leetcodeData?.userProfileUserQuestionProgressV2?.numAcceptedQuestions.reduce(
            (acc, curr) => acc + curr.count,
            0
          ) || 0,
      },
      { name: "CodeChef", value: parseInt(codechefData?.problems_solved) || 0 },
      {
        name: "Codeforces",
        value: parseInt(codeforcesData?.total_problems_solved) || 0,
      },
    ];
    return data.filter((item) => selectedPlatforms[item.name.toLowerCase()]);
  }, [leetcodeData, codechefData, codeforcesData, selectedPlatforms]);

  const prepareCombinedRatingHistory = useMemo(() => {
    const codechefHistory =
      codechefData?.all_rating.map((item) => ({
        date: new Date(item.end_date).toLocaleDateString(),
        codechef: item.rating,
      })) || [];

    const codeforcesHistory =
      codeforcesData?.user_rating.map((item) => ({
        date: new Date(
          item.ratingUpdateTimeSeconds * 1000
        ).toLocaleDateString(),
        codeforces: item.newRating,
      })) || [];

    const combinedData = [...codechefHistory, ...codeforcesHistory].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return combinedData.reduce((acc, curr) => {
      const existingEntry = acc.find((item) => item.date === curr.date);
      if (existingEntry) {
        Object.assign(existingEntry, curr);
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
  }, [codechefData, codeforcesData]);

  const prepareLeetcodeContestData = useMemo(
    () => leetcodeData?.contestRatingHistogram || [],
    [leetcodeData]
  );

  const renderRatingChart = () => (
    <Card style={{ marginBottom: "20px" }}>
      <Title level={4}>Rating Comparison</Title>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={prepareRatingData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Bar dataKey="rating" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderLeetcodeDifficultyChart = () => (
    <Card>
      <Title level={4}>LeetCode Problem Difficulty</Title>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={prepareLeetcodeDifficultyData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {prepareLeetcodeDifficultyData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderTotalProblemsSolvedChart = () => (
    <Card>
      <Title level={4}>Total Problems Solved</Title>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={prepareTotalProblemsSolvedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {prepareTotalProblemsSolvedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderCombinedRatingHistory = () => (
    <Card>
      <Title level={4}>Combined Rating History</Title>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={prepareCombinedRatingHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          {selectedPlatforms.codechef && (
            <Line
              type="monotone"
              dataKey="codechef"
              stroke="#8884d8"
              name="CodeChef"
            />
          )}
          {selectedPlatforms.codeforces && (
            <Line
              type="monotone"
              dataKey="codeforces"
              stroke="#82ca9d"
              name="Codeforces"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderPlatformStats = () => (
    <Tabs defaultActiveKey="1">
      {selectedPlatforms.leetcode && (
        <TabPane tab="LeetCode" key="1">
          <Statistic
            title="Rating"
            value={leetcodeData?.userContestRanking?.rating || "N/A"}
          />
          <Statistic
            title="Global Rank"
            value={leetcodeData?.userContestRanking?.globalRanking || "N/A"}
          />
          <Statistic
            title="Total Solved"
            value={
              leetcodeData?.userProfileUserQuestionProgressV2?.numAcceptedQuestions.reduce(
                (acc, curr) => acc + curr.count,
                0
              ) || "N/A"
            }
          />
        </TabPane>
      )}
      {selectedPlatforms.codechef && (
        <TabPane tab="CodeChef" key="2">
          <Statistic
            title="Rating"
            value={codechefData?.rating || "N/A"}
            suffix={codechefData?.stars}
          />
          <Statistic
            title="Global Rank"
            value={codechefData?.global_rank || "N/A"}
          />
          <Statistic
            title="Country Rank"
            value={codechefData?.country_rank || "N/A"}
          />
        </TabPane>
      )}
      {selectedPlatforms.codeforces && (
        <TabPane tab="Codeforces" key="3">
          <Statistic
            title="Rating"
            value={codeforcesData?.user_info?.rating || "N/A"}
          />
          <Statistic
            title="Rank"
            value={codeforcesData?.user_info?.rank || "N/A"}
          />
          <Statistic
            title="Max Rating"
            value={codeforcesData?.user_info?.maxRating || "N/A"}
          />
        </TabPane>
      )}
    </Tabs>
  );

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message="Error" description={error} type="error" />;
  if (!user) return <Alert message="User not found" type="warning" />;

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16} align="middle" style={{ marginBottom: "20px" }}>
        <Col>
          <Avatar size={64} src={codeforcesData?.user_info?.avatar} />
        </Col>
        <Col>
          <Title level={2}>{user.name}</Title>
          <Text>
            @{leetcodeData?.matchedUser?.username || "N/A"} | @
            {codechefData?.username || "N/A"} | @
            {codeforcesData?.username || "N/A"}
          </Text>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: "20px" }}>
        <Col span={8}>
          <Checkbox
            checked={selectedPlatforms.leetcode}
            onChange={() => handlePlatformToggle("leetcode")}
          >
            LeetCode
          </Checkbox>
        </Col>
        <Col span={8}>
          <Checkbox
            checked={selectedPlatforms.codechef}
            onChange={() => handlePlatformToggle("codechef")}
          >
            CodeChef
          </Checkbox>
        </Col>
        <Col span={8}>
          <Checkbox
            checked={selectedPlatforms.codeforces}
            onChange={() => handlePlatformToggle("codeforces")}
          >
            Codeforces
          </Checkbox>
        </Col>
      </Row>

      {renderPlatformStats()}

      {renderRatingChart()}
      <Row gutter={16} style={{ marginBottom: "20px" }}>
        <Col span={12}>{renderLeetcodeDifficultyChart()}</Col>
        <Col span={12}>{renderTotalProblemsSolvedChart()}</Col>
      </Row>
      {renderCombinedRatingHistory()}
    </div>
  );
};

export default CodingProfile;
