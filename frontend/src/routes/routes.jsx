import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import HomePage from "../pages/HomePage";
import DoctorsPage from "../pages/DoctorsPage";
import DoctorProfilePage from "../pages/DoctorProfilePage";
import HowItWorksPage from "../pages/HowItWorksPage";
import PricingPage from "../pages/PricingPage";

// Auth & Context
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { DoctorSearchProvider } from "../context/DoctorSearchContext";

// TanStack Query
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "../lib/queryClient";

// Auth Pages
import PatientLoginPage from "../pages/auth/PatientLoginPage";
import DoctorLoginPage from "../pages/auth/DoctorLoginPage";

// Patient Dashboard
import PrivateRoute from "../components/layout/PrivateRoute";
import PatientDashboardLayout from "../components/layout/PatientDashboardLayout";
import PatientOverview from "../pages/patient/PatientOverview";
import PatientPayments from "../pages/patient/PatientPayments";
import PatientConsultations from "../pages/patient/PatientConsultations";
import PatientPrescriptions from "../pages/patient/PatientPrescriptions";
import PatientProfile from "../pages/patient/PatientProfile";
import PaymentSuccessPage from "../pages/payment/PaymentSuccessPage";

// Doctor Dashboard
import DoctorDashboardLayout from "../components/layout/DoctorDashboardLayout";
import DoctorOverview from "../pages/doctor/DoctorOverview";
import DoctorQueuePage from "../pages/doctor/DoctorQueuePage";
import DoctorPatientsPage from "../pages/doctor/DoctorPatientsPage";
import DoctorPrescriptionWriter from "../pages/doctor/DoctorPrescriptionWriter";
import DoctorAvailabilityPage from "../pages/doctor/DoctorAvailabilityPage";

// Call Room
import CallRoomPage from "../pages/CallRoomPage";

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <DoctorSearchProvider>
          <Outlet />
        </DoctorSearchProvider>
      </ThemeProvider>
    </AuthProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

const routes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "doctors",
            element: <DoctorsPage />,
          },
          {
            path: "doctors/:id",
            element: <DoctorProfilePage />,
          },
          {
            path: "how-it-works",
            element: <HowItWorksPage />,
          },
          {
            path: "pricing",
            element: <PricingPage />,
          },
          {
            path: "find-doctors",
            element: <DoctorsPage />,
          },
          {
            path: "login",
            element: <Navigate to="/login/patient" replace />,
          },
          {
            path: "login/patient",
            element: <PatientLoginPage />,
          },
          {
            path: "register/patient",
            element: <PatientLoginPage />,
          },
          {
            path: "login/doctor",
            element: <DoctorLoginPage />,
          },
          {
            path: "register/doctor",
            element: <DoctorLoginPage />,
          },
          {
            path: "payment/success",
            element: (
              <PrivateRoute allowedRole="patient">
                <PaymentSuccessPage />
              </PrivateRoute>
            ),
          },
          // Patient Protected Routes
          {
            path: "patient",
            element: (
              <PrivateRoute allowedRole="patient">
                <PatientDashboardLayout />
              </PrivateRoute>
            ),

            children: [
              {
                path: "dashboard",
                element: <PatientOverview />,
              },
              {
                path: "payments",
                element: <PatientPayments />,
              },
              {
                path: "consultations",
                element: <PatientConsultations />,
              },
              {
                path: "prescriptions",
                element: <PatientPrescriptions />,
              },
              {
                path: "profile",
                element: <PatientProfile />,
              },
            ],
          },
          // Doctor Protected Routes
          {
            path: "doctor",
            element: (
              <PrivateRoute allowedRole="doctor">
                <DoctorDashboardLayout />
              </PrivateRoute>
            ),
            children: [
              {
                index: true,
                element: <Navigate to="/doctor/dashboard" replace />,
              },
              {
                path: "dashboard",
                element: <DoctorOverview />,
              },
              {
                path: "queue",
                element: <DoctorQueuePage />,
              },
              {
                path: "patients",
                element: <DoctorPatientsPage />,
              },
              {
                path: "prescriptions/new",
                element: <DoctorPrescriptionWriter />,
              },
              {
                path: "availability",
                element: <DoctorAvailabilityPage />,
              },
            ],
          },
          // Shared Call Room Route
          {
            path: "room/:roomId",
            element: (
              <PrivateRoute allowedRoles={["patient", "doctor"]}>
                <CallRoomPage />
              </PrivateRoute>
            ),
          },
        ],
      },
    ],
  },
]);

export default routes;

