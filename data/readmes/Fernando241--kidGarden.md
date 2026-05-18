# Kidgarden - Comprehensive Preschool Management System

**Kidgarden** is an advanced administrative and academic MIS (Management Information System). It was designed to automate the complete lifecycle of a private preschool, from the initial enrollment request to financial management and official documentation.

---

## 🚀 Specialized Business Logic

### 📑 Automated Enrollment Workflow (Slot Requests)
- **Application Processing:** Prospective students can submit "Slot Requests" which enter a pending state.
- **Admin Validation:** Using specialized roles, administrators review and approve applications.
- **Smart Data Distribution:** Upon approval, the system automatically migrates and separates data into distinct entities (**Guardian/Parent** and **Student**) within the database, ensuring data integrity and normalization.

### 💰 Financial & Academic Control
- **Multi-Concept Billing:** Handling of Tuition, Monthly Fees, and Enrollment payments.
- **Document Engine:** Automated generation of certificates, student records, and enrollment proofs.

### 👥 Advanced Access Control
- **Role-Based Security:** Granular permissions implemented via **Spatie** and custom **Middleware** to protect financial and administrative actions.
- **User Personas:** Distinct dashboards and permissions for Teachers, Administrators, and Parents.

---

## 🛠️ Technical Stack

### Backend & UI
- **Framework:** Laravel (MVC Architecture).
- **Reactivity:** **Livewire** for real-time validation and fast UI responses.
- **Dashboard:** **AdminLTE** with deep customization and unique Tailwind CSS components.
- **Styling:** Fully custom UI logic using **Tailwind CSS**.

### Database & Logic
- **Data Integrity:** Complex relationships managed through Eloquent ORM.
- **Automated Workflows:** Logic-heavy controllers for data separation and notification triggering.

---
*Developed as a high-impact solution for educational administration.*