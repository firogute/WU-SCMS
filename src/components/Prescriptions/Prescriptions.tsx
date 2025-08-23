import React, { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Pill,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Prescription {
  id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: string;
  created_at: string;
  medicines: {
    name: string;
    generic_name: string;
    manufacturer: string;
    description: string;
  };
  medical_records: {
    id: string;
    diagnosis: string;
    treatment: string;
    vital_signs: any;
    lab_results: any;
    patients: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      medical_history: string[];
      allergies: string[];
    };
    users: {
      id: string;
      name: string;
      email: string;
      specialization: string;
    };
  };
}

const Prescriptions: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from("prescriptions")
          .select(
            `
            id,
            medicine_name,
            dosage,
            frequency,
            duration,
            instructions,
            status,
            created_at,
            medicines (
              name,
              generic_name,
              manufacturer,
              description
            ),
            medical_records (
              id,
              diagnosis,
              treatment,
              vital_signs,
              lab_results,
              patients (
                id,
                first_name,
                last_name,
                email,
                phone,
                medical_history,
                allergies
              ),
              users (
                id,
                name,
                email,
                specialization
              )
            )
          `
          )
          .order("created_at", { ascending: false });

        if (statusFilter !== "all") query = query.eq("status", statusFilter);
        if (dateRange) {
          const [start, end] = dateRange.split(" to ");
          query = query.gte("created_at", start).lte("created_at", end);
        }

        const { data, error } = await query;
        if (error) throw error;
        setPrescriptions(data || []);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError("Failed to load prescriptions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "pharmacist") fetchPrescriptions();
  }, [user, statusFilter, dateRange]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "dispensed":
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const columnHelper = createColumnHelper<Prescription>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => (
          <span className="text-sm text-gray-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor(
        (row) =>
          `${row.medical_records?.patients?.first_name} ${row.medical_records?.patients?.last_name}`,
        {
          id: "patient",
          header: "Patient",
        }
      ),
      columnHelper.accessor((row) => row.medical_records?.users?.name, {
        id: "doctor",
        header: "Doctor",
      }),
      columnHelper.accessor("medicine_name", {
        header: "Medicine",
      }),
      columnHelper.accessor("dosage", {
        header: "Dosage",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <div className="flex items-center space-x-2">
            {getStatusIcon(info.getValue() as string)}
            <span className="capitalize">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Date",
        cell: (info) => format(new Date(info.getValue()), "PPP"),
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => (
          <div className="flex space-x-2">
            <Link
              to={`/prescriptions/${info.row.original.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button className="text-gray-600 hover:text-gray-800">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: prescriptions,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Pill className="h-6 w-6 mr-2 text-blue-600" />
            Prescriptions
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, doctor, or medicine..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
              />
            </div>
            <div className="relative">
              <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="dispensed">Dispensed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Date range (YYYY-MM-DD to YYYY-MM-DD)"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          )
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700">
            Showing {table.getRowModel().rows.length} of {prescriptions.length}{" "}
            prescriptions
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
