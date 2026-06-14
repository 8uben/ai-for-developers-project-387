import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./Layout";
import { AdminLayout } from "./AdminLayout";
import { HomePage } from "../pages/HomePage";
import { EventTypesListPage } from "../pages/EventTypesListPage";
import { SlotsPage } from "../pages/SlotsPage";
import { AdminEventTypesPage } from "../pages/AdminEventTypesPage";
import { AdminBookingsPage } from "../pages/AdminBookingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Лендинг
      { index: true, element: <HomePage /> },
      // Гость: каталог → выбор слота
      { path: "book", element: <EventTypesListPage /> },
      { path: "book/:eventTypeId", element: <SlotsPage /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminEventTypesPage /> },
      { path: "bookings", element: <AdminBookingsPage /> },
    ],
  },
]);