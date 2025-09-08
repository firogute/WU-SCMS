Patients table – stores basic patient data.

SQL Query



CREATE TABLE public.patients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text NOT NULL,
    date_of_birth date NOT NULL,
    gender text NOT NULL CHECK (gender = ANY (ARRAY['male','female','other'])),
    address text NOT NULL,
    emergency_contact text NOT NULL,
    medical_history text[] DEFAULT '{}'::text[],
    allergies text[] DEFAULT '{}'::text[],
    blood_type text,
    status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active','inactive'])),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

Medicines table – catalog of medicines stocked by the pharmacy.

SQL Query



CREATE TABLE public.medicines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    generic_name text NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    stock integer NOT NULL DEFAULT 0,
    min_stock integer NOT NULL DEFAULT 10,
    price numeric NOT NULL,
    expiry_date date NOT NULL,
    batch_number text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT medicines_pkey PRIMARY KEY (id)
);

Users table – staff members (doctors, nurses, etc.).

SQL Query



CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    role text NOT NULL CHECK (role = ANY (ARRAY[
        'admin','doctor','nurse','pharmacist','receptionist','laboratory'])),
    department text,
    avatar text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    password text,
    phone text,
    gender text CHECK (gender = ANY (ARRAY['male','female','other'])),
    employee_id text,
    shift text CHECK (shift = ANY (ARRAY[
        'morning','evening','night','full-time'])),
    status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY[
        'active','inactive','on-leave'])),
    address text,
    emergency_contact text,
    qualifications text[] DEFAULT '{}'::text[],
    specialization text,
    username text,
    date_of_birth date,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

Appointments table – links patients with doctors.

SQL Query



CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    doctor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    date date NOT NULL,
    time time WITHOUT TIME ZONE NOT NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY[
        'consultation','follow-up','emergency','checkup'])),
    status text DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY[
        'scheduled','completed','cancelled','no-show'])),
    symptoms text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT appointments_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);

Medical_records table – clinical notes for a patient visit.

SQL Query



CREATE TABLE public.medical_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    doctor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    date date NOT NULL,
    symptoms text NOT NULL,
    diagnosis text NOT NULL,
    treatment text NOT NULL,
    follow_up_date date,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    lab_results jsonb,
    vital_signs jsonb,
    CONSTRAINT medical_records_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX idx_medical_records_appointment_id ON public.medical_records(appointment_id);

Prescriptions table – medicines prescribed in a consultation.

SQL Query



CREATE TABLE public.prescriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid REFERENCES public.medical_records(id) ON DELETE SET NULL,
    medicine_id uuid REFERENCES public.medicines(id) ON DELETE SET NULL,
    medicine_name text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    duration text NOT NULL,
    instructions text,
    created_at timestamptz DEFAULT now(),
    status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY[
        'pending','processing','ready','dispensed','cancelled'])),
    CONSTRAINT prescriptions_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_prescriptions_appointment_id ON public.prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_medicine_id ON public.prescriptions(medicine_id);

Lab_tests table – lab work requested for a patient.

SQL Query



CREATE TABLE public.lab_tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    test_name text NOT NULL,
    status text DEFAULT 'pending'::text,
    assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
    notes text,
    results text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    CONSTRAINT lab_tests_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_lab_tests_appointment_id ON public.lab_tests(appointment_id);
CREATE INDEX idx_lab_tests_patient_id ON public.lab_tests(patient_id);
CREATE INDEX idx_lab_tests_assigned_to ON public.lab_tests(assigned_to);

Nurse_tasks table – tasks for nursing staff.

SQL Query



CREATE TABLE public.nurse_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    task text NOT NULL,
    status text DEFAULT 'pending'::text,
    assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
    notes text,
    completed_at timestamp,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    CONSTRAINT nurse_tasks_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_nurse_tasks_appointment_id ON public.nurse_tasks(appointment_id);
CREATE INDEX idx_nurse_tasks_patient_id ON public.nurse_tasks(patient_id);
CREATE INDEX idx_nurse_tasks_assigned_to ON public.nurse_tasks(assigned_to);

Surgical_history table – previous surgeries for a patient.

SQL Query



CREATE TABLE public.surgical_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    procedure text NOT NULL,
    date date NOT NULL,
    surgeon text,
    facility text,
    outcome text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT surgical_history_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_surgical_history_patient_id ON public.surgical_history(patient_id);

Chronic_conditions table – long‑term conditions per patient.

SQL Query



CREATE TABLE public.chronic_conditions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    condition text NOT NULL,
    diagnosed_date date,
    status text,
    severity text,
    treatment text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT chronic_conditions_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_chronic_conditions_patient_id ON public.chronic_conditions(patient_id);

Family_history table – hereditary health information.

SQL Query



CREATE TABLE public.family_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    relation text NOT NULL,
    condition text NOT NULL,
    age_of_onset integer,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT family_history_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_family_history_patient_id ON public.family_history(patient_id);

Optional – enable Row‑Level Security for any of the above tables if you want fine‑grained access control. Example for patients:

SQL Query



ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

You can repeat the ALTER TABLE … ENABLE ROW LEVEL SECURITY command for each table that requires it, then add appropriate CREATE POLICY statements.

These statements fully recreate the custom tables in your Supabase project. System tables under auth, storage, vault, realtime, etc., are managed by Supabase and needNow render each DDL block with display_query.


Reasoned

Below is the full set of CREATE statements for the tables you added in the public schema, ordered so that foreign‑key references always point to a table that has already been created.
Each block is rendered with display_query – you can copy the generated SQL straight into the Supabase SQL editor to recreate the schema.

Patients table – stores basic patient data.

SQL Query



CREATE TABLE public.patients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text NOT NULL,
    date_of_birth date NOT NULL,
    gender text NOT NULL CHECK (gender = ANY (ARRAY['male','female','other'])),
    address text NOT NULL,
    emergency_contact text NOT NULL,
    medical_history text[] DEFAULT '{}'::text[],
    allergies text[] DEFAULT '{}'::text[],
    blood_type text,
    status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active','inactive'])),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

Medicines table – catalog of medicines stocked by the pharmacy.

SQL Query



CREATE TABLE public.medicines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    generic_name text NOT NULL,
    manufacturer text NOT NULL,
    category text NOT NULL,
    stock integer NOT NULL DEFAULT 0,
    min_stock integer NOT NULL DEFAULT 10,
    price numeric NOT NULL,
    expiry_date date NOT NULL,
    batch_number text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT medicines_pkey PRIMARY KEY (id)
);

Users table – staff members (doctors, nurses, etc.).

SQL Query



CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    role text NOT NULL CHECK (role = ANY (ARRAY[
        'admin','doctor','nurse','pharmacist','receptionist','laboratory'])),
    department text,
    avatar text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    password text,
    phone text,
    gender text CHECK (gender = ANY (ARRAY['male','female','other'])),
    employee_id text,
    shift text CHECK (shift = ANY (ARRAY[
        'morning','evening','night','full-time'])),
    status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY[
        'active','inactive','on-leave'])),
    address text,
    emergency_contact text,
    qualifications text[] DEFAULT '{}'::text[],
    specialization text,
    username text,
    date_of_birth date,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

Appointments table – links patients with doctors.

SQL Query



CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    doctor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    date date NOT NULL,
    time time WITHOUT TIME ZONE NOT NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY[
        'consultation','follow-up','emergency','checkup'])),
    status text DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY[
        'scheduled','completed','cancelled','no-show'])),
    symptoms text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT appointments_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);





CREATE TABLE public.medical_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    doctor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    date date NOT NULL,
    symptoms text NOT NULL,
    diagnosis text NOT NULL,
    treatment text NOT NULL,
    follow_up_date date,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    lab_results jsonb,
    vital_signs jsonb,
    CONSTRAINT medical_records_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX idx_medical_records_appointment_id ON public.medical_records(appointment_id);




CREATE TABLE public.prescriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid REFERENCES public.medical_records(id) ON DELETE SET NULL,
    medicine_id uuid REFERENCES public.medicines(id) ON DELETE SET NULL,
    medicine_name text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    duration text NOT NULL,
    instructions text,
    created_at timestamptz DEFAULT now(),
    status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY[
        'pending','processing','ready','dispensed','cancelled'])),
    CONSTRAINT prescriptions_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_prescriptions_appointment_id ON public.prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_medicine_id ON public.prescriptions(medicine_id);




CREATE TABLE public.lab_tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    test_name text NOT NULL,
    status text DEFAULT 'pending'::text,
    assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
    notes text,
    results text,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    CONSTRAINT lab_tests_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_lab_tests_appointment_id ON public.lab_tests(appointment_id);
CREATE INDEX idx_lab_tests_patient_id ON public.lab_tests(patient_id);
CREATE INDEX idx_lab_tests_assigned_to ON public.lab_tests(assigned_to);




CREATE TABLE public.nurse_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    task text NOT NULL,
    status text DEFAULT 'pending'::text,
    assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
    notes text,
    completed_at timestamp,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    CONSTRAINT nurse_tasks_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_nurse_tasks_appointment_id ON public.nurse_tasks(appointment_id);
CREATE INDEX idx_nurse_tasks_patient_id ON public.nurse_tasks(patient_id);
CREATE INDEX idx_nurse_tasks_assigned_to ON public.nurse_tasks(assigned_to);




CREATE TABLE public.surgical_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    procedure text NOT NULL,
    date date NOT NULL,
    surgeon text,
    facility text,
    outcome text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT surgical_history_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_surgical_history_patient_id ON public.surgical_history(patient_id);




CREATE TABLE public.chronic_conditions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    condition text NOT NULL,
    diagnosed_date date,
    status text,
    severity text,
    treatment text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT chronic_conditions_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_chronic_conditions_patient_id ON public.chronic_conditions(patient_id);




CREATE TABLE public.family_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
    relation text NOT NULL,
    condition text NOT NULL,
    age_of_onset integer,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT family_history_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_family_history_patient_id ON public.family_history(patient_id);



ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;




CREATE TABLE public.patients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text NOT NULL,
    date_of_birth date NOT NULL,
    gender text NOT NULL CHECK (gender = ANY (ARRAY['male','female','other'])),
    address text NOT NULL,
    emergency_contact text NOT NULL,
    medical_history text[] DEFAULT '{}'::text[],
    allergies text[] DEFAULT '{}'::text[],
    blood_type text,
    status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active','inactive'])),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);


