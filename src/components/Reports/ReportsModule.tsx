import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Pill,
  DollarSign,
  BarChart3,
  Filter,
} from "lucide-react";
import Button from "../UI/Button";
import { supabase } from "../../lib/supabase";
import {
  exportToPDF,
  exportToCSV,
  exportToExcel,
  generatePrescriptionPDF,
} from "../../utils/exportUtils";

const ReportsModule = () => {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Overview data
  const [overviewData, setOverviewData] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    revenue: 0,
    medicinesDispensed: 0,
  });

  // Patients report states
  const [patientsData, setPatientsData] = useState([]);
  const [patientsTotal, setPatientsTotal] = useState(0);
  const [patientsPage, setPatientsPage] = useState(1);
  const [patientsSortColumn, setPatientsSortColumn] = useState("created_at");
  const [patientsSortDirection, setPatientsSortDirection] = useState("desc");
  const [patientFilters, setPatientFilters] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    status: "",
    bloodType: "",
    ageMin: "",
    ageMax: "",
  });
  const patientsLimit = 20;

  // Appointments report states
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [appointmentsTotal, setAppointmentsTotal] = useState(0);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [appointmentsSortColumn, setAppointmentsSortColumn] = useState("date");
  const [appointmentsSortDirection, setAppointmentsSortDirection] =
    useState("desc");
  const [appointmentFilters, setAppointmentFilters] = useState({
    type: "",
    status: "",
    doctorName: "",
    patientName: "",
  });
  const appointmentsLimit = 20;

  // Pharmacy report states
  const [pharmacyData, setPharmacyData] = useState([]);
  const [pharmacyTotal, setPharmacyTotal] = useState(0);
  const [pharmacyPage, setPharmacyPage] = useState(1);
  const [pharmacySortColumn, setPharmacySortColumn] = useState("name");
  const [pharmacySortDirection, setPharmacySortDirection] = useState("asc");
  const [pharmacyFilters, setPharmacyFilters] = useState({
    name: "",
    category: "",
    lowStock: false,
    nearExpiry: false,
  });
  const pharmacyLimit = 20;

  // Financial report states
  const [financialData, setFinancialData] = useState([]);
  const [financialTotal, setFinancialTotal] = useState(0);
  const [financialPage, setFinancialPage] = useState(1);
  const [financialSortColumn, setFinancialSortColumn] = useState("created_at");
  const [financialSortDirection, setFinancialSortDirection] = useState("desc");
  const [financialFilters, setFinancialFilters] = useState({
    medicineName: "",
    department: "",
  });
  const financialLimit = 20;

  // Additional data like doctors list for filters
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchAuxData = async () => {
      const { data: docs } = await supabase
        .from("users")
        .select("id, name, department")
        .eq("role", "doctor");
      setDoctors(docs || []);
      const depts = [
        ...new Set(docs?.map((d) => d.department).filter(Boolean)),
      ];
      setDepartments(depts);
    };
    fetchAuxData();
  }, []);

  useEffect(() => {
    fetchReportData(selectedReport);
  }, [
    selectedReport,
    dateRange,
    patientsPage,
    appointmentsPage,
    pharmacyPage,
    financialPage,
    patientsSortColumn,
    patientsSortDirection,
    appointmentsSortColumn,
    appointmentsSortDirection,
    pharmacySortColumn,
    pharmacySortDirection,
    financialSortColumn,
    financialSortDirection,
  ]);

  const fetchReportData = async (report) => {
    const { start, end } = dateRange;

    if (report === "overview") {
      // 1. Patients count
      const { count: totalPatients } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${start}T00:00:00`)
        .lte("created_at", `${end}T23:59:59`);

      // 2. Appointments count
      const { count: totalAppointments } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("date", start)
        .lte("date", end);

      // 3. Get appointment IDs in range
      const { data: appts } = await supabase
        .from("appointments")
        .select("id")
        .gte("date", start)
        .lte("date", end);
      const apptIds = appts?.map((a) => a.id) || [];

      // 4. Get related medical records
      const { data: medRecs } = await supabase
        .from("medical_records")
        .select("id")
        .in("appointment_id", apptIds);
      const medRecIds = medRecs?.map((m) => m.id) || [];

      // 5. Get prescriptions linked to those medical records
      const { data: prescs } = await supabase
        .from("prescriptions")
        .select("medicine_id")
        .in("appointment_id", medRecIds);
      const medIds = prescs?.map((p) => p.medicine_id) || [];
      const medicinesDispensed = prescs?.length || 0;

      // 6. Calculate revenue from medicines
      const { data: meds } = await supabase
        .from("medicines")
        .select("id, price")
        .in("id", medIds);
      const revenue =
        meds?.reduce((sum, m) => sum + (Number(m.price) || 0), 0) || 0;

      // 7. Final overview data
      setOverviewData({
        totalPatients: totalPatients || 0,
        totalAppointments: totalAppointments || 0,
        revenue,
        medicinesDispensed,
      });
    } else if (report === "patients") {
      let query = supabase
        .from("patients")
        .select("*", { count: "exact" })
        .gte("created_at", `${start}T00:00:00`)
        .lte("created_at", `${end}T23:59:59`);

      if (patientFilters.name) {
        query = query.or(
          `first_name.ilike.%${patientFilters.name}%,last_name.ilike.%${patientFilters.name}%`
        );
      }
      if (patientFilters.email) {
        query = query.ilike("email", `%${patientFilters.email}%`);
      }
      if (patientFilters.phone) {
        query = query.ilike("phone", `%${patientFilters.phone}%`);
      }
      if (patientFilters.gender) {
        query = query.eq("gender", patientFilters.gender);
      }
      if (patientFilters.status) {
        query = query.eq("status", patientFilters.status);
      }
      if (patientFilters.bloodType) {
        query = query.eq("blood_type", patientFilters.bloodType);
      }
      if (patientFilters.ageMin || patientFilters.ageMax) {
        const current = new Date("2025-08-23");
        if (patientFilters.ageMin) {
          const dobMax = new Date(
            current.getFullYear() - parseInt(patientFilters.ageMin),
            current.getMonth(),
            current.getDate()
          );
          query = query.lte(
            "date_of_birth",
            dobMax.toISOString().split("T")[0]
          );
        }
        if (patientFilters.ageMax) {
          const dobMin = new Date(
            current.getFullYear() - parseInt(patientFilters.ageMax) - 1,
            current.getMonth(),
            current.getDate() + 1
          );
          query = query.gte(
            "date_of_birth",
            dobMin.toISOString().split("T")[0]
          );
        }
      }

      query = query.order(patientsSortColumn, {
        ascending: patientsSortDirection === "asc",
      });
      query = query.range(
        (patientsPage - 1) * patientsLimit,
        patientsPage * patientsLimit - 1
      );

      const { data, count } = await query;
      setPatientsData(data || []);
      setPatientsTotal(count || 0);
    } else if (report === "appointments") {
      let query = supabase
        .from("appointments")
        .select("*, patient_id (first_name, last_name), doctor_id (name)", {
          count: "exact",
        })
        .gte("date", start)
        .lte("date", end);

      if (appointmentFilters.type) {
        query = query.eq("type", appointmentFilters.type);
      }
      if (appointmentFilters.status) {
        query = query.eq("status", appointmentFilters.status);
      }
      if (appointmentFilters.doctorName) {
        query = query.ilike(
          "doctor_id.name",
          `%${appointmentFilters.doctorName}%`
        );
      }
      if (appointmentFilters.patientName) {
        query = query.or(
          `patient_id.first_name.ilike.%${appointmentFilters.patientName}%,patient_id.last_name.ilike.%${appointmentFilters.patientName}%`
        );
      }

      query = query.order(appointmentsSortColumn, {
        ascending: appointmentsSortDirection === "asc",
      });
      query = query.range(
        (appointmentsPage - 1) * appointmentsLimit,
        appointmentsPage * appointmentsLimit - 1
      );

      const { data, count } = await query;
      setAppointmentsData(data || []);
      setAppointmentsTotal(count || 0);
    } else if (report === "pharmacy") {
      let query = supabase.from("medicines").select("*", { count: "exact" });

      if (pharmacyFilters.name) {
        query = query.ilike("name", `%${pharmacyFilters.name}%`);
      }
      if (pharmacyFilters.category) {
        query = query.eq("category", pharmacyFilters.category);
      }
      if (pharmacyFilters.lowStock) {
        query = query.lt("stock", supabase.raw("min_stock"));
      }
      if (pharmacyFilters.nearExpiry) {
        const nearExpiryDate = new Date();
        nearExpiryDate.setMonth(nearExpiryDate.getMonth() + 3);
        query = query.lte(
          "expiry_date",
          nearExpiryDate.toISOString().split("T")[0]
        );
      }

      query = query.order(pharmacySortColumn, {
        ascending: pharmacySortDirection === "asc",
      });
      query = query.range(
        (pharmacyPage - 1) * pharmacyLimit,
        pharmacyPage * pharmacyLimit - 1
      );

      const { data, count } = await query;

      const augmentedData = [];
      for (const med of data || []) {
        const { data: appts } = await supabase
          .from("appointments")
          .select("id")
          .gte("date", start)
          .lte("date", end);
        const apptIds = appts?.map((a) => a.id) || [];
        const { data: medRecs } = await supabase
          .from("medical_records")
          .select("id")
          .in("appointment_id", apptIds);
        const medRecIds = medRecs?.map((m) => m.id) || [];
        const { data: prescCount } = await supabase
          .from("prescriptions")
          .select("count(*)")
          .eq("medicine_id", med.id)
          .in("appointment_id", medRecIds);
        augmentedData.push({ ...med, prescribed: prescCount?.[0]?.count || 0 });
      }

      setPharmacyData(augmentedData);
      setPharmacyTotal(count || 0);
    } else if (report === "financial") {
      const { data: appts } = await supabase
        .from("appointments")
        .select("id")
        .gte("date", start)
        .lte("date", end);
      const apptIds = appts?.map((a) => a.id) || [];

      const { data: medRecs } = await supabase
        .from("medical_records")
        .select("id, appointment_id (doctor_id (department))")
        .in("appointment_id", apptIds);
      const medRecIds = medRecs?.map((m) => m.id) || [];

      let query = supabase
        .from("prescriptions")
        .select(
          "*, medicine_id (name, price), appointment_id (appointment_id (date, doctor_id (name, department)))",
          { count: "exact" }
        )
        .in("appointment_id", medRecIds);

      if (financialFilters.medicineName) {
        query = query.ilike(
          "medicine_id.name",
          `%${financialFilters.medicineName}%`
        );
      }
      if (financialFilters.department) {
        query = query.eq(
          "appointment_id.appointment_id.doctor_id.department",
          financialFilters.department
        );
      }

      query = query.order(financialSortColumn, {
        ascending: financialSortDirection === "asc",
      });
      query = query.range(
        (financialPage - 1) * financialLimit,
        financialPage * financialLimit - 1
      );

      const { data, count } = await query;
      setFinancialData(data || []);
      setFinancialTotal(count || 0);
    }
  };

  const handleApplyFilters = (report) => {
    if (report === "patients") setPatientsPage(1);
    if (report === "appointments") setAppointmentsPage(1);
    if (report === "pharmacy") setPharmacyPage(1);
    if (report === "financial") setFinancialPage(1);
    fetchReportData(report);
  };

  const handleSort = (report, column) => {
    if (report === "patients") {
      const newDirection =
        patientsSortColumn === column && patientsSortDirection === "asc"
          ? "desc"
          : "asc";
      setPatientsSortColumn(column);
      setPatientsSortDirection(newDirection);
    } else if (report === "appointments") {
      const newDirection =
        appointmentsSortColumn === column && appointmentsSortDirection === "asc"
          ? "desc"
          : "asc";
      setAppointmentsSortColumn(column);
      setAppointmentsSortDirection(newDirection);
    } else if (report === "pharmacy") {
      const newDirection =
        pharmacySortColumn === column && pharmacySortDirection === "asc"
          ? "desc"
          : "asc";
      setPharmacySortColumn(column);
      setPharmacySortDirection(newDirection);
    } else if (report === "financial") {
      const newDirection =
        financialSortColumn === column && financialSortDirection === "asc"
          ? "desc"
          : "asc";
      setFinancialSortColumn(column);
      setFinancialSortDirection(newDirection);
    }
  };

  const handleExportReport = async (format) => {
    let data = [];
    let columns = [];
    const filename = `${selectedReport}_${dateRange.start}_to_${dateRange.end}`;
    const title = `${
      selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)
    } Report`;

    if (selectedReport === "overview") {
      data = [overviewData];
      columns = [
        { header: "Total Patients", accessor: (item) => item.totalPatients },
        {
          header: "Total Appointments",
          accessor: (item) => item.totalAppointments,
        },
        {
          header: "Revenue",
          accessor: (item) => `$${item.revenue.toFixed(2)}`,
        },
        {
          header: "Medicines Dispensed",
          accessor: (item) => item.medicinesDispensed,
        },
      ];
    } else if (selectedReport === "patients") {
      data = patientsData;
      columns = [
        { header: "ID", accessor: (item) => item.id },
        { header: "First Name", accessor: (item) => item.first_name },
        { header: "Last Name", accessor: (item) => item.last_name },
        { header: "Email", accessor: (item) => item.email },
        { header: "Phone", accessor: (item) => item.phone },
        { header: "Date of Birth", accessor: (item) => item.date_of_birth },
        { header: "Gender", accessor: (item) => item.gender },
        { header: "Address", accessor: (item) => item.address },
        {
          header: "Emergency Contact",
          accessor: (item) => item.emergency_contact,
        },
        {
          header: "Medical History",
          accessor: (item) => item.medical_history?.join(", ") || "",
        },
        {
          header: "Allergies",
          accessor: (item) => item.allergies?.join(", ") || "",
        },
        { header: "Blood Type", accessor: (item) => item.blood_type },
        { header: "Status", accessor: (item) => item.status },
        { header: "Created At", accessor: (item) => item.created_at },
        { header: "Updated At", accessor: (item) => item.updated_at },
      ];
    } else if (selectedReport === "appointments") {
      data = appointmentsData.map((a) => ({
        ...a,
        patient_name: `${a.patient_id?.first_name} ${a.patient_id?.last_name}`,
        doctor_name: a.doctor_id?.name,
      }));
      columns = [
        { header: "ID", accessor: (item) => item.id },
        { header: "Patient Name", accessor: (item) => item.patient_name },
        { header: "Doctor Name", accessor: (item) => item.doctor_name },
        { header: "Date", accessor: (item) => item.date },
        { header: "Time", accessor: (item) => item.time },
        { header: "Type", accessor: (item) => item.type },
        { header: "Status", accessor: (item) => item.status },
        { header: "Symptoms", accessor: (item) => item.symptoms },
        { header: "Notes", accessor: (item) => item.notes },
        { header: "Created At", accessor: (item) => item.created_at },
        { header: "Updated At", accessor: (item) => item.updated_at },
      ];
    } else if (selectedReport === "pharmacy") {
      data = pharmacyData;
      columns = [
        { header: "ID", accessor: (item) => item.id },
        { header: "Name", accessor: (item) => item.name },
        { header: "Generic Name", accessor: (item) => item.generic_name },
        { header: "Manufacturer", accessor: (item) => item.manufacturer },
        { header: "Category", accessor: (item) => item.category },
        { header: "Stock", accessor: (item) => item.stock },
        { header: "Min Stock", accessor: (item) => item.min_stock },
        { header: "Price", accessor: (item) => `$${item.price?.toFixed(2)}` },
        { header: "Expiry Date", accessor: (item) => item.expiry_date },
        { header: "Batch Number", accessor: (item) => item.batch_number },
        { header: "Description", accessor: (item) => item.description },
        { header: "Prescribed", accessor: (item) => item.prescribed },
        { header: "Created At", accessor: (item) => item.created_at },
        { header: "Updated At", accessor: (item) => item.updated_at },
      ];
    } else if (selectedReport === "financial") {
      data = financialData.map((f) => ({
        ...f,
        medicine_name: f.medicine_id?.name,
        price: f.medicine_id?.price,
        date: f.appointment_id?.appointment_id?.date,
        department: f.appointment_id?.appointment_id?.doctor_id?.department,
        doctor_name: f.appointment_id?.appointment_id?.doctor_id?.name,
      }));
      columns = [
        { header: "ID", accessor: (item) => item.id },
        { header: "Medicine Name", accessor: (item) => item.medicine_name },
        { header: "Dosage", accessor: (item) => item.dosage },
        { header: "Frequency", accessor: (item) => item.frequency },
        { header: "Duration", accessor: (item) => item.duration },
        { header: "Instructions", accessor: (item) => item.instructions },
        { header: "Price", accessor: (item) => `$${item.price?.toFixed(2)}` },
        { header: "Date", accessor: (item) => item.date },
        { header: "Department", accessor: (item) => item.department },
        { header: "Doctor Name", accessor: (item) => item.doctor_name },
        { header: "Status", accessor: (item) => item.status },
        { header: "Created At", accessor: (item) => item.created_at },
      ];
    }

    switch (format.toLowerCase()) {
      case "pdf":
        exportToPDF(data, filename, title, columns);
        break;
      case "csv":
        exportToCSV(data, filename, columns);
        break;
      case "excel":
        exportToExcel(data, filename, columns);
        break;
      default:
        console.error("Unsupported format:", format);
    }
  };

  // Optional: Function to export a specific prescription as PDF
  const handleExportPrescriptionPDF = async (prescriptionId) => {
    const { data: prescription } = await supabase
      .from("prescriptions")
      .select(
        "*, medicine_id (name, price), appointment_id (patient_id (first_name, last_name, date_of_birth, gender, phone), doctor_id (name), date, medical_records (diagnosis))"
      )
      .eq("id", prescriptionId)
      .single();

    if (!prescription) {
      alert("Prescription not found");
      return;
    }

    const patient = {
      firstName: prescription.appointment_id.patient_id.first_name,
      lastName: prescription.appointment_id.patient_id.last_name,
      dateOfBirth: prescription.appointment_id.patient_id.date_of_birth,
      gender: prescription.appointment_id.patient_id.gender,
      phone: prescription.appointment_id.patient_id.phone,
    };

    const doctor = prescription.appointment_id.doctor_id.name;
    const consultation = {
      date: prescription.appointment_id.date,
      diagnosis:
        prescription.appointment_id.medical_records?.[0]?.diagnosis || "N/A",
    };

    const prescriptions = [
      {
        medicineName: prescription.medicine_id.name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
      },
    ];

    generatePrescriptionPDF(patient, doctor, prescriptions, consultation);
  };

  const renderPagination = (report, page, setPage, total, limit) => {
    const totalPages = Math.ceil(total / limit);
    return (
      <div className="flex justify-between items-center mt-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    );
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {overviewData.totalPatients}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Appointments
              </p>
              <p className="text-3xl font-bold text-green-600">
                {overviewData.totalAppointments}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-purple-600">
                ${overviewData.revenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Medicines Dispensed
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {overviewData.medicinesDispensed}
              </p>
            </div>
            <Pill className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Overview Summary
        </h3>
        <p className="text-gray-600">
          This overview provides key metrics for the selected date range. Use
          filters and exports for detailed analysis.
        </p>
      </div>
    </div>
  );

  const renderPatientReports = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Patient Reports
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Name"
          value={patientFilters.name}
          onChange={(e) =>
            setPatientFilters({ ...patientFilters, name: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Email"
          value={patientFilters.email}
          onChange={(e) =>
            setPatientFilters({ ...patientFilters, email: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Phone"
          value={patientFilters.phone}
          onChange={(e) =>
            setPatientFilters({ ...patientFilters, phone: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={patientFilters.gender}
          onChange={(e) =>
            setPatientFilters({ ...patientFilters, gender: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          value={patientFilters.status}
          onChange={(e) =>
            setPatientFilters({ ...patientFilters, status: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={patientFilters.bloodType}
          onChange={(e) =>
            setPatientFilters({ ...patientFilters, bloodType: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Blood Types</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
        <input
          type="number"
          placeholder="Min Age"
          value={patientFilters.ageMin}
          onChange={(e) =>
            setPatientFilters({ ...patientFilters, ageMin: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="number"
          placeholder="Max Age"
          value={patientFilters.ageMax}
          onChange={(e) =>
            setPatientFilters({ ...patientFilters, ageMax: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <Button
          onClick={() => handleApplyFilters("patients")}
          className="col-span-1 md:col-span-4"
        >
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("patients", "id")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                ID
              </th>
              <th
                onClick={() => handleSort("patients", "first_name")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                First Name
              </th>
              <th
                onClick={() => handleSort("patients", "last_name")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Last Name
              </th>
              <th
                onClick={() => handleSort("patients", "email")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Email
              </th>
              <th
                onClick={() => handleSort("patients", "phone")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Phone
              </th>
              <th
                onClick={() => handleSort("patients", "date_of_birth")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                DOB
              </th>
              <th
                onClick={() => handleSort("patients", "gender")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Emergency Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medical History
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allergies
              </th>
              <th
                onClick={() => handleSort("patients", "blood_type")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Blood Type
              </th>
              <th
                onClick={() => handleSort("patients", "status")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Status
              </th>
              <th
                onClick={() => handleSort("patients", "created_at")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Created At
              </th>
              <th
                onClick={() => handleSort("patients", "updated_at")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Updated At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patientsData.map((patient) => (
              <tr key={patient.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.first_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.date_of_birth}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.gender}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {patient.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.emergency_contact}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {patient.medical_history?.join(", ")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {patient.allergies?.join(", ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.blood_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.created_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.updated_at}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination(
        "patients",
        patientsPage,
        setPatientsPage,
        patientsTotal,
        patientsLimit
      )}
    </div>
  );

  const renderAppointmentReports = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Appointment Reports
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select
          value={appointmentFilters.type}
          onChange={(e) =>
            setAppointmentFilters({
              ...appointmentFilters,
              type: e.target.value,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Types</option>
          <option value="consultation">Consultation</option>
          <option value="follow-up">Follow-up</option>
          <option value="emergency">Emergency</option>
          <option value="checkup">Checkup</option>
        </select>
        <select
          value={appointmentFilters.status}
          onChange={(e) =>
            setAppointmentFilters({
              ...appointmentFilters,
              status: e.target.value,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="text"
          placeholder="Doctor Name"
          value={appointmentFilters.doctorName}
          onChange={(e) =>
            setAppointmentFilters({
              ...appointmentFilters,
              doctorName: e.target.value,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Patient Name"
          value={appointmentFilters.patientName}
          onChange={(e) =>
            setAppointmentFilters({
              ...appointmentFilters,
              patientName: e.target.value,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <Button
          onClick={() => handleApplyFilters("appointments")}
          className="col-span-1 md:col-span-4"
        >
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("appointments", "id")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor Name
              </th>
              <th
                onClick={() => handleSort("appointments", "date")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Date
              </th>
              <th
                onClick={() => handleSort("appointments", "time")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Time
              </th>
              <th
                onClick={() => handleSort("appointments", "type")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Type
              </th>
              <th
                onClick={() => handleSort("appointments", "status")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symptoms
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th
                onClick={() => handleSort("appointments", "created_at")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Created At
              </th>
              <th
                onClick={() => handleSort("appointments", "updated_at")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Updated At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointmentsData.map((appt) => (
              <tr key={appt.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appt.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appt.patient_id?.first_name} {appt.patient_id?.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appt.doctor_id?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appt.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appt.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appt.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appt.status}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {appt.symptoms}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {appt.notes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appt.created_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {appt.updated_at}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination(
        "appointments",
        appointmentsPage,
        setAppointmentsPage,
        appointmentsTotal,
        appointmentsLimit
      )}
    </div>
  );

  const renderPharmacyReports = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pharmacy Reports
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Medicine Name"
          value={pharmacyFilters.name}
          onChange={(e) =>
            setPharmacyFilters({ ...pharmacyFilters, name: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Category"
          value={pharmacyFilters.category}
          onChange={(e) =>
            setPharmacyFilters({ ...pharmacyFilters, category: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={pharmacyFilters.lowStock}
            onChange={(e) =>
              setPharmacyFilters({
                ...pharmacyFilters,
                lowStock: e.target.checked,
              })
            }
            className="mr-2"
          />
          Low Stock
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={pharmacyFilters.nearExpiry}
            onChange={(e) =>
              setPharmacyFilters({
                ...pharmacyFilters,
                nearExpiry: e.target.checked,
              })
            }
            className="mr-2"
          />
          Near Expiry
        </label>
        <Button
          onClick={() => handleApplyFilters("pharmacy")}
          className="col-span-1 md:col-span-4"
        >
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("pharmacy", "id")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                ID
              </th>
              <th
                onClick={() => handleSort("pharmacy", "name")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Name
              </th>
              <th
                onClick={() => handleSort("pharmacy", "generic_name")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Generic Name
              </th>
              <th
                onClick={() => handleSort("pharmacy", "manufacturer")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Manufacturer
              </th>
              <th
                onClick={() => handleSort("pharmacy", "category")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Category
              </th>
              <th
                onClick={() => handleSort("pharmacy", "stock")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Stock
              </th>
              <th
                onClick={() => handleSort("pharmacy", "min_stock")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Min Stock
              </th>
              <th
                onClick={() => handleSort("pharmacy", "price")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Price
              </th>
              <th
                onClick={() => handleSort("pharmacy", "expiry_date")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Expiry Date
              </th>
              <th
                onClick={() => handleSort("pharmacy", "batch_number")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Batch Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prescribed
              </th>
              <th
                onClick={() => handleSort("pharmacy", "created_at")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Created At
              </th>
              <th
                onClick={() => handleSort("pharmacy", "updated_at")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Updated At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pharmacyData.map((med) => (
              <tr key={med.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.generic_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.manufacturer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.min_stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${med.price?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.expiry_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.batch_number}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {med.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.prescribed}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.created_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {med.updated_at}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination(
        "pharmacy",
        pharmacyPage,
        setPharmacyPage,
        pharmacyTotal,
        pharmacyLimit
      )}
    </div>
  );

  const renderFinancialReports = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Financial Reports
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Medicine Name"
          value={financialFilters.medicineName}
          onChange={(e) =>
            setFinancialFilters({
              ...financialFilters,
              medicineName: e.target.value,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={financialFilters.department}
          onChange={(e) =>
            setFinancialFilters({
              ...financialFilters,
              department: e.target.value,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <Button
          onClick={() => handleApplyFilters("financial")}
          className="col-span-1 md:col-span-2"
        >
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("financial", "id")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medicine Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dosage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instructions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor Name
              </th>
              <th
                onClick={() => handleSort("financial", "status")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Status
              </th>
              <th
                onClick={() => handleSort("financial", "created_at")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {financialData.map((fin) => (
              <tr key={fin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.medicine_id?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.dosage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.frequency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.duration}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {fin.instructions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${fin.medicine_id?.price?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.appointment_id?.appointment_id?.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.appointment_id?.appointment_id?.doctor_id?.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.appointment_id?.appointment_id?.doctor_id?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fin.created_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer">
                  <button onClick={() => handleExportPrescriptionPDF(fin.id)}>
                    Export Prescription
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPagination(
        "financial",
        financialPage,
        setFinancialPage,
        financialTotal,
        financialLimit
      )}
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case "overview":
        return renderOverviewReport();
      case "patients":
        return renderPatientReports();
      case "appointments":
        return renderAppointmentReports();
      case "pharmacy":
        return renderPharmacyReports();
      case "financial":
        return renderFinancialReports();
      default:
        return renderOverviewReport();
    }
  };

  const reportTypes = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "patients", name: "Patient Reports", icon: Users },
    { id: "appointments", name: "Appointment Reports", icon: Calendar },
    { id: "pharmacy", name: "Pharmacy Reports", icon: Pill },
    { id: "financial", name: "Financial Reports", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Professional reports with advanced filtering, sorting, pagination,
            and export capabilities.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleExportReport("pdf")}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("csv")}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportReport("excel")}
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="flex space-x-6">
        <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Report Types</h3>
          <nav className="space-y-2">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedReport === report.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{report.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex-1">{renderReportContent()}</div>
      </div>
    </div>
  );
};

export default ReportsModule;
