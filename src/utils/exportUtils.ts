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

export const generatePrescriptionPDF = (
  patient: Patient,
  doctor: string,
  prescriptions: Prescription[],
  medicalRecord: MedicalRecord
) => {
  const doc = new jsPDF();

  // Apply autoTable to this instance
  autoTable(doc, {});

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("WOLLEGA UNIVERSITY CLINIC", 105, 25, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Nekemte, Ethiopia", 105, 32, { align: "center" });
  doc.text("Phone: +251-57-661-1234 | Email: clinic@wollega.edu.et", 105, 38, {
    align: "center",
  });

  // Line separator
  doc.line(14, 45, 196, 45);

  // Prescription header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PRESCRIPTION", 105, 55, { align: "center" });

  // Patient information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Information:", 14, 70);

  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${patient.first_name} ${patient.last_name}`, 14, 78);
  doc.text(
    `Age: ${
      new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    } years`,
    14,
    86
  );
  doc.text(`Gender: ${patient.gender}`, 14, 94);
  doc.text(`Phone: ${patient.phone}`, 14, 102);

  // Doctor information
  doc.text(
    `Date: ${new Date(medicalRecord.date).toLocaleDateString()}`,
    120,
    78
  );
  doc.text(`Doctor: ${doctor}`, 120, 86);
  doc.text(`Diagnosis: ${medicalRecord.diagnosis}`, 120, 94);

  // Prescription table
  doc.setFont("helvetica", "bold");
  doc.text("Prescribed Medications:", 14, 120);

  const prescriptionData = prescriptions.map((prescription, index) => [
    index + 1,
    prescription.medicine_name,
    prescription.dosage,
    prescription.frequency,
    prescription.duration,
    prescription.instructions,
  ]);

  autoTable(doc, {
    head: [
      ["#", "Medicine", "Dosage", "Frequency", "Duration", "Instructions"],
    ],
    body: prescriptionData,
    startY: 125,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 50 },
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.line(14, finalY, 196, finalY);

  doc.setFont("helvetica", "bold");
  doc.text("Doctor's Signature: ________________________", 14, finalY + 15);
  doc.text("Date: ________________________", 120, finalY + 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This prescription is valid for 30 days from the date of issue.",
    14,
    finalY + 30
  );
  doc.text(
    "Please follow the prescribed dosage and consult your doctor if you experience any side effects.",
    14,
    finalY + 36
  );

  // Save the PDF
  doc.save(
    `prescription_${patient.first_name}_${patient.last_name}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
};
