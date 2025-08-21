// src/pages/doctor/DoctorLabResultsPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  message,
  Spin,
  Typography,
  Divider,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  Badge,
  Avatar,
  Modal,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  FilterOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import moment from "moment";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const DoctorLabResultsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [labTests, setLabTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [exportModalVisible, setExportModalVisible] = useState(false);

  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchLabTests();
    } else {
      message.error("Unauthorized access");
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const { data: appointments, error: appError } = await supabase
        .from("appointments")
        .select("id")
        .eq("doctor_id", user.id);

      if (appError) throw appError;

      const appointmentIds = appointments.map((app) => app.id);

      const { data, error } = await supabase
        .from("lab_tests")
        .select(
          `
          *,
          patient_id:patients (
            id,
            first_name,
            last_name,
            date_of_birth,
            gender
          ),
          appointment_id:appointments (
            id,
            date,
            time
          ),
          assigned_to:users (
            id,
            name,
            role
          )
        `
        )
        .in("appointment_id", appointmentIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLabTests(data || []);
      setFilteredTests(data || []);

      // Calculate statistics
      const total = data.length;
      const completed = data.filter(
        (test) => test.status === "completed"
      ).length;
      const pending = data.filter((test) => test.status === "pending").length;

      setStats({ total, completed, pending });
    } catch (error) {
      console.error("Error fetching lab tests:", error);
      message.error("Failed to load lab results");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    applyFilters(value, statusFilter, dateRange);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    applyFilters(searchText, value, dateRange);
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
    applyFilters(searchText, statusFilter, dates);
  };

  const applyFilters = (search, status, dates) => {
    let filtered = labTests;

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (test) =>
          test.test_name.toLowerCase().includes(lowerSearch) ||
          `${test.patient_id.first_name} ${test.patient_id.last_name}`
            .toLowerCase()
            .includes(lowerSearch)
      );
    }

    if (status) {
      filtered = filtered.filter((test) => test.status === status);
    }

    if (dates && dates.length === 2) {
      const [start, end] = dates;
      filtered = filtered.filter((test) => {
        const testDate = moment(test.appointment_id.date);
        return testDate.isBetween(start, end, "day", "[]");
      });
    }

    setFilteredTests(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const handleExportData = () => {
    // In a real application, this would generate a CSV or PDF
    message.info("Export functionality would be implemented here");
    setExportModalVisible(false);
  };

  const calculateAge = (dateOfBirth) => {
    return moment().diff(moment(dateOfBirth), "years");
  };

  const columns = [
    {
      title: "Patient",
      dataIndex: "patient_id",
      key: "patient",
      render: (patient) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <div>{`${patient.first_name} ${patient.last_name}`}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {patient.gender}, {calculateAge(patient.date_of_birth)} years
            </Text>
          </div>
        </Space>
      ),
      fixed: "left",
      width: 200,
    },
    {
      title: "Test Name",
      dataIndex: "test_name",
      key: "test_name",
      render: (text) => (
        <Space>
          <ExperimentOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
      width: 200,
    },
    {
      title: "Appointment Date",
      dataIndex: "appointment_id",
      key: "date",
      render: (app) => (
        <Space>
          <CalendarOutlined />
          <div>
            <div>{moment(app.date).format("MMM DD, YYYY")}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {app.time}
            </Text>
          </div>
        </Space>
      ),
      width: 150,
      sorter: (a, b) =>
        moment(a.appointment_id.date).unix() -
        moment(b.appointment_id.date).unix(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          color={getStatusColor(status)}
          text={status.toUpperCase()}
          style={{ textTransform: "capitalize" }}
        />
      ),
      width: 120,
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Assigned To",
      dataIndex: "assigned_to",
      key: "assigned_to",
      render: (user) => user?.name || <Text type="secondary">Unassigned</Text>,
      width: 150,
    },
    {
      title: "Results Preview",
      dataIndex: "results",
      key: "results",
      ellipsis: true,
      render: (results, record) => (
        <Tooltip title={results || "No results available"}>
          <div style={{ maxWidth: 200 }}>
            {results ? (
              <>
                {results.slice(0, 50)}
                {results.length > 50 && "..."}
              </>
            ) : (
              <Text type="secondary">Pending</Text>
            )}
          </div>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/doctor/lab-results/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={24}>
            <Card>
              <div className="flex justify-between items-center">
                <div>
                  <Title level={3} className="mb-1">
                    Lab Results Dashboard
                  </Title>
                  <Text type="secondary">
                    View and manage all lab tests you've ordered
                  </Text>
                </div>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => setExportModalVisible(true)}
                >
                  Export Data
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card>
              <Statistic
                title="Total Tests"
                value={stats.total}
                valueStyle={{ color: "#1890ff" }}
                prefix={<ExperimentOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Completed Tests"
                value={stats.completed}
                valueStyle={{ color: "#52c41a" }}
                suffix={`/ ${stats.total}`}
              />
              <Progress
                percent={
                  stats.total
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0
                }
                size="small"
                status="active"
                showInfo={false}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Pending Tests"
                value={stats.pending}
                valueStyle={{ color: "#fa8c16" }}
              />
              <div className="mt-2">
                <Tag color="orange">{stats.pending} awaiting results</Tag>
              </div>
            </Card>
          </Col>
        </Row>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="mb-0">
              <FilterOutlined className="mr-2" />
              Filter Tests
            </Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchLabTests}
              loading={loading}
            >
              Refresh
            </Button>
          </div>

          <Space wrap size="middle" className="mb-4">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by patient or test name"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={handleStatusChange}
              style={{ width: 180 }}
              allowClear
              suffixIcon={<InfoCircleOutlined />}
            >
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <RangePicker
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              style={{ width: 280 }}
              placeholder={["Start Date", "End Date"]}
            />
          </Space>

          <Divider />

          {loading ? (
            <div className="text-center py-10">
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>Loading lab results...</div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Text strong>
                  Showing {filteredTests.length} of {labTests.length} tests
                </Text>
              </div>

              <Table
                dataSource={filteredTests}
                columns={columns}
                rowKey="id"
                scroll={{ x: 1000 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} tests`,
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ paddingLeft: 40 }}>
                      <Title level={5}>Test Notes</Title>
                      <p>{record.notes || "No additional notes."}</p>
                      {record.results && (
                        <>
                          <Title level={5} style={{ marginTop: 16 }}>
                            Full Results
                          </Title>
                          <p>{record.results}</p>
                        </>
                      )}
                    </div>
                  ),
                  rowExpandable: (record) => !!record.notes || !!record.results,
                  expandIcon: ({ expanded, onExpand, record }) =>
                    record.notes || record.results ? (
                      <Button
                        type="text"
                        size="small"
                        onClick={(e) => onExpand(record, e)}
                        style={{ marginRight: 8 }}
                      >
                        {expanded ? "Hide Details" : "Show Details"}
                      </Button>
                    ) : null,
                }}
              />
            </>
          )}
        </Card>

        {/* Export Modal */}
        <Modal
          title="Export Lab Results"
          open={exportModalVisible}
          onCancel={() => setExportModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setExportModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="export" type="primary" onClick={handleExportData}>
              Export
            </Button>,
          ]}
        >
          <p>Select export format and date range for your lab results:</p>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Select defaultValue="csv" style={{ width: "100%" }}>
              <Option value="csv">CSV Format</Option>
              <Option value="pdf">PDF Format</Option>
            </Select>
            <RangePicker style={{ width: "100%" }} />
          </Space>
        </Modal>
      </div>
    </div>
  );
};

export default DoctorLabResultsPage;
