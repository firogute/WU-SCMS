import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Patient, Appointment, Medicine, Consultation, User } from "../types";

export const useDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Patients
  const getPatients = async (filters?: any) => {
    setLoading(true);
    try {
      let query = supabase.from("patients").select("*");

      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.bloodType) {
        query = query.eq("blood_type", filters.bloodType);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patient: Partial<Patient>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .insert([
          {
            first_name: patient.firstName,
            last_name: patient.lastName,
            email: patient.email,
            phone: patient.phone,
            date_of_birth: patient.dateOfBirth,
            gender: patient.gender,
            address: patient.address,
            emergency_contact: patient.emergencyContact,
            medical_history: patient.medicalHistory,
            allergies: patient.allergies,
            blood_type: patient.bloodType,
            status: patient.status || "active",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (id: string, patient: Partial<Patient>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .update({
          first_name: patient.firstName,
          last_name: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          date_of_birth: patient.dateOfBirth,
          gender: patient.gender,
          address: patient.address,
          emergency_contact: patient.emergencyContact,
          medical_history: patient.medicalHistory,
          allergies: patient.allergies,
          blood_type: patient.bloodType,
          status: patient.status,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("patients").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Appointments
  const getAppointments = async (filters?: any) => {
    setLoading(true);
    try {
      let query = supabase.from("appointments").select(`
          *,
          patients(first_name, last_name),
          users(name)
        `);

      if (filters?.date) {
        query = query.eq("date", filters.date);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.doctorId) {
        query = query.eq("doctor_id", filters.doctorId);
      }

      const { data, error } = await query.order("date", { ascending: true });
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointment: Partial<Appointment>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert([
          {
            patient_id: appointment.patientId,
            doctor_id: appointment.doctorId,
            date: appointment.date,
            time: appointment.time,
            type: appointment.type,
            status: appointment.status || "scheduled",
            symptoms: appointment.symptoms,
            notes: appointment.notes,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (
    id: string,
    appointment: Partial<Appointment>
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          patient_id: appointment.patientId,
          doctor_id: appointment.doctorId,
          date: appointment.date,
          time: appointment.time,
          type: appointment.type,
          status: appointment.status,
          symptoms: appointment.symptoms,
          notes: appointment.notes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Medicines
  const getMedicines = async (filters?: any) => {
    setLoading(true);
    try {
      let query = supabase.from("medicines").select("*");

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,generic_name.ilike.%${filters.search}%`
        );
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.lowStock) {
        query = query.lt("stock", supabase.raw("min_stock"));
      }

      const { data, error } = await query.order("name", { ascending: true });
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createMedicine = async (medicine: Partial<Medicine>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("medicines")
        .insert([
          {
            name: medicine.name,
            generic_name: medicine.genericName,
            manufacturer: medicine.manufacturer,
            category: medicine.category,
            stock: medicine.stock,
            min_stock: medicine.minStock,
            price: medicine.price,
            expiry_date: medicine.expiryDate,
            batch_number: medicine.batchNumber,
            description: medicine.description,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMedicine = async (id: string, medicine: Partial<Medicine>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("medicines")
        .update({
          name: medicine.name,
          generic_name: medicine.genericName,
          manufacturer: medicine.manufacturer,
          category: medicine.category,
          stock: medicine.stock,
          min_stock: medicine.minStock,
          price: medicine.price,
          expiry_date: medicine.expiryDate,
          batch_number: medicine.batchNumber,
          description: medicine.description,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicine = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("medicines").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Consultations
  const getConsultations = async (filters?: any) => {
    setLoading(true);
    try {
      let query = supabase.from("consultations").select(`
          *,
          patients(first_name, last_name),
          users(name),
          prescriptions(*)
        `);

      if (filters?.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }
      if (filters?.doctorId) {
        query = query.eq("doctor_id", filters.doctorId);
      }

      const { data, error } = await query.order("date", { ascending: false });
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createConsultation = async (consultation: Partial<Consultation>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("consultations")
        .insert([
          {
            patient_id: consultation.patientId,
            doctor_id: consultation.doctorId,
            appointment_id: consultation.appointmentId,
            date: consultation.date,
            symptoms: consultation.symptoms,
            diagnosis: consultation.diagnosis,
            treatment: consultation.treatment,
            follow_up_date: consultation.followUpDate,
            notes: consultation.notes,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPatients,
    createPatient,
    updatePatient,
    deletePatient,
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    getConsultations,
    createConsultation,
  };
};
