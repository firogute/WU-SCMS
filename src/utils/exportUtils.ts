import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Explicit import
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Patient, Prescription, MedicalRecord } from "../types";

// Apply autoTable to jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToPDF = (
  data: any[],
  filename: string,
  title: string,
  columns: { header: string; accessor: (item: any) => any }[]
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 22);

  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

  // Add table using autoTable
  autoTable(doc, {
    head: [columns.map((col) => col.header)],
    body: data.map((item) => columns.map((col) => col.accessor(item))),
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
    },
  });

  doc.save(`${filename}.pdf`);
};

export const exportToCSV = (
  data: any[],
  filename: string,
  columns: { header: string; accessor: (item: any) => any }[]
) => {
  const headers = columns.map((col) => col.header).join(",");
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = col.accessor(item);
        return typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      })
      .join(",")
  );

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
};

export const exportToExcel = (
  data: any[],
  filename: string,
  columns: { header: string; accessor: (item: any) => any }[]
) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => {
      const row: any = {};
      columns.forEach((col) => {
        row[col.header] = col.accessor(item);
      });
      return row;
    })
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Types
interface Patient {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  phone: string;
}

interface Prescription {
  medicine_name: string;
}

interface MedicalRecord {
  diagnosis: string;
  treatment: string;
  date: string;
}

// Helper: Load logo from /public folder
const loadLogo = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generatePrescriptionPDF = async (
  patient: Patient,
  doctor: string,
  prescriptions: Prescription[],
  medicalRecord: MedicalRecord
) => {
  const doc = new jsPDF();

  // ✅ Load logo from public folder
  const logo = await loadLogo("/logo.png");

  // Page width
  const pageWidth = doc.internal.pageSize.getWidth();

  // ✅ Center logo at top
  const logoWidth = 30; // adjust size if needed
  const logoX = (pageWidth - logoWidth) / 2;
  doc.addImage(logo, "PNG", logoX, 10, logoWidth, 30);

  // Clinic Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("WOLLEGA UNIVERSITY CLINIC", pageWidth / 2, 50, {
    align: "center",
  });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Nekemte, Ethiopia", pageWidth / 2, 58, { align: "center" });
  doc.text(
    "Phone: +251-57-661-1234 | Email: clinic@wollega.edu.et",
    pageWidth / 2,
    64,
    {
      align: "center",
    }
  );

  doc.line(14, 72, pageWidth - 14, 72);

  // Prescription Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PRESCRIPTION", pageWidth / 2, 85, { align: "center" });

  // Patient Info
  doc.setFont("helvetica", "bold");
  doc.text("Patient Information", 14, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${patient.first_name} ${patient.last_name}`, 14, 108);
  doc.text(
    `Age: ${
      new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    } yrs`,
    14,
    116
  );
  doc.text(`Gender: ${patient.gender}`, 14, 124);
  doc.text(`Phone: ${patient.phone}`, 14, 132);

  // Doctor Info
  doc.setFont("helvetica", "bold");
  doc.text("Doctor Information", 120, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: Dr. ${doctor}`, 120, 108);
  doc.text(`Diagnosis: ${medicalRecord.diagnosis}`, 120, 116);
  doc.text(
    `Date: ${new Date(medicalRecord.date).toLocaleDateString()}`,
    120,
    124
  );

  // Medicines Section
  doc.setFont("helvetica", "bold");
  doc.text("Prescribed Medicines", 14, 150);

  // Random dosage generator
  const randomDosage = () => {
    const doses = ["50mg", "100mg", "250mg", "500mg", "5mg", "10mg"];
    return doses[Math.floor(Math.random() * doses.length)];
  };

  const prescriptionData = prescriptions.map((p, i) => [
    i + 1,
    p.medicine_name.toUpperCase(),
    randomDosage(),
  ]);

  autoTable(doc, {
    head: [["#", "MEDICINE", "DOSAGE"]],
    body: prescriptionData,
    startY: 160,
    styles: { fontSize: 12, cellPadding: 4 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 100 },
      2: { cellWidth: 60 },
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.line(14, finalY, pageWidth - 14, finalY);

  doc.setFont("helvetica", "bold");
  doc.text("Doctor's Signature: ____________________", 14, finalY + 15);
  doc.text("Date: ____________________", 120, finalY + 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This prescription is valid for 30 days from the date of issue.",
    14,
    finalY + 30
  );
  doc.text(
    "Follow the prescribed dosage and consult your doctor if you experience any side effects.",
    14,
    finalY + 36
  );

  // Save File
  doc.save(
    `Prescription_${patient.first_name}_${patient.last_name}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
};
