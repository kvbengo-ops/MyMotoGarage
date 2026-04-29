import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/shared/AppLayout'
import GarageDashboard from './pages/GarageDashboard'
import VehicleDetail from './pages/VehicleDetail'
import SystemStatus from './pages/SystemStatus'
import AiMechanic from './pages/AiMechanic'
import AddLog from './pages/AddLog'
import SettingsPage from './pages/SettingsPage'
import BikeLayout from './components/shared/BikeLayout'

import AddVehicle from './pages/AddVehicle'
import VehicleSetupWizard from './pages/VehicleSetupWizard'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,         element: <GarageDashboard /> },
      { path: 'settings',    element: <SettingsPage /> },
    ],
  },
  {
    path: '/bike/:bikeId',
    element: <BikeLayout />,
    children: [
      { index: true,         element: <VehicleDetail /> },
      { path: 'status',      element: <SystemStatus /> },
      { path: 'mechanic',    element: <AiMechanic /> },
    ],
  },
  { path: '/bike/:bikeId/add-log',  element: <AddLog /> },
  { path: '/add-vehicle',           element: <AddVehicle /> },
  { path: '/setup-vehicle/:bikeId', element: <VehicleSetupWizard /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
