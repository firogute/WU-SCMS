import React, { useState } from "react";
import {
  Pill,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Package,
  TrendingDown,
} from "lucide-react";
import { Medicine } from "../../types";
import MedicineForm from "./MedicineForm";
import Button from "../UI/Button";

const PharmacyInventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>(
    undefined
  );
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: "1",
      name: "Paracetamol",
      genericName: "Acetaminophen",
      manufacturer: "PharmaCorp",
      category: "Analgesics",
      stock: 5,
      minStock: 20,
      price: 25.5,
      expiryDate: "2025-06-15",
      batchNumber: "PC001",
      description: "Pain reliever and fever reducer",
    },
    {
      id: "2",
      name: "Amoxicillin",
      genericName: "Amoxicillin Trihydrate",
      manufacturer: "AntibioTech",
      category: "Antibiotics",
      stock: 45,
      minStock: 30,
      price: 89.0,
      expiryDate: "2025-12-31",
      batchNumber: "AT002",
      description: "Broad-spectrum antibiotic",
    },
    {
      id: "3",
      name: "Lisinopril",
      genericName: "Lisinopril",
      manufacturer: "CardioMed",
      category: "Cardiovascular",
      stock: 12,
      minStock: 15,
      price: 156.75,
      expiryDate: "2025-09-20",
      batchNumber: "CM003",
      description: "ACE inhibitor for hypertension",
    },
    {
      id: "4",
      name: "Metformin",
      genericName: "Metformin HCl",
      manufacturer: "DiabetesCare",
      category: "Antidiabetic",
      stock: 78,
      minStock: 25,
      price: 45.25,
      expiryDate: "2025-11-10",
      batchNumber: "DC004",
      description: "Type 2 diabetes medication",
    },
    {
      id: "5",
      name: "Ibuprofen",
      genericName: "Ibuprofen",
      manufacturer: "PainRelief Inc",
      category: "Analgesics",
      stock: 8,
      minStock: 25,
      price: 32.8,
      expiryDate: "2025-08-05",
      batchNumber: "PR005",
      description: "Anti-inflammatory pain reliever",
    },
  ]);

  const categories = [
    "all",
    ...Array.from(new Set(medicines.map((m) => m.category))),
  ];

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockMedicines = medicines.filter((m) => m.stock <= m.minStock);
  const totalValue = medicines.reduce((sum, m) => sum + m.stock * m.price, 0);

  const getStockStatus = (medicine: Medicine) => {
    if (medicine.stock === 0)
      return { status: "out-of-stock", color: "bg-red-100 text-red-800" };
    if (medicine.stock <= medicine.minStock)
      return { status: "low-stock", color: "bg-yellow-100 text-yellow-800" };
    return { status: "in-stock", color: "bg-green-100 text-green-800" };
  };

  const handleAddMedicine = () => {
    setEditingMedicine(undefined);
    setShowMedicineForm(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowMedicineForm(true);
  };

  const handleDeleteMedicine = (medicineId: string) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      setMedicines((prev) => prev.filter((m) => m.id !== medicineId));
    }
  };

  const handleSaveMedicine = (medicineData: Partial<Medicine>) => {
    if (editingMedicine) {
      // Update existing medicine
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === editingMedicine.id
            ? ({ ...m, ...medicineData } as Medicine)
            : m
        )
      );
    } else {
      // Add new medicine
      const newMedicine: Medicine = {
        ...medicineData,
        id: Date.now().toString(),
      } as Medicine;
      setMedicines((prev) => [...prev, newMedicine]);
    }
    setShowMedicineForm(false);
  };

  const handleReorder = (medicine: Medicine) => {
    // Simulate reordering by adding stock
    const reorderQuantity = medicine.minStock * 2;
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === medicine.id ? { ...m, stock: m.stock + reorderQuantity } : m
      )
    );
    alert(`Reordered ${reorderQuantity} units of ${medicine.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pharmacy Inventory
          </h1>
          <p className="text-gray-600">Manage medicine stock and inventory</p>
        </div>
        <Button onClick={handleAddMedicine} icon={<Plus />}>
          Add Medicine
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Medicines
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {medicines.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Low Stock Alerts
              </p>
              <p className="text-2xl font-bold text-red-600">
                {lowStockMedicines.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Stock Value
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${totalValue.toFixed(2)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-purple-600">
                {categories.length - 1}
              </p>
            </div>
            <Pill className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Low Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {lowStockMedicines.map((medicine) => (
              <div
                key={medicine.id}
                className="flex items-center justify-between bg-white p-3 rounded border"
              >
                <div className="flex items-center space-x-3">
                  <Pill className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-sm text-gray-600">
                      Current: {medicine.stock} | Min: {medicine.minStock}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleReorder(medicine)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine);
                const isExpiringSoon =
                  new Date(medicine.expiryDate) <
                  new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                return (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Pill className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {medicine.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {medicine.genericName}
                          </div>
                          <div className="text-xs text-gray-400">
                            Batch: {medicine.batchNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {medicine.stock} units
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {medicine.minStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${medicine.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </div>
                      {isExpiringSoon && (
                        <div className="text-xs text-red-600">
                          Expiring soon
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
                      >
                        {stockStatus.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditMedicine(medicine)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(medicine.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{filteredMedicines.length}</span> of{" "}
              <span className="font-medium">{medicines.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <MedicineForm
        medicine={editingMedicine}
        isOpen={showMedicineForm}
        onClose={() => setShowMedicineForm(false)}
        onSave={handleSaveMedicine}
      />
    </div>
  );
};

export default PharmacyInventory;
