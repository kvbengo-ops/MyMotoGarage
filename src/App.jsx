import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/shared/AppLayout'
import GarageDashboard from './pages/GarageDashboard'
import VehicleDetail from './pages/VehicleDetail'
import SystemStatus from './pages/SystemStatus'
import AiMechanic from './pages/AiMechanic'
import BikeWash from './pages/BikeWash'
import AddLog from './pages/AddLog'
import SettingsPage from './pages/SettingsPage'
import BikeLayout from './components/shared/BikeLayout'
import AddVehicle from './pages/AddVehicle'
import VehicleSetupWizard from './pages/VehicleSetupWizard'
import SplashScreen from './components/shared/SplashScreen'

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
      { path: 'wash',        element: <BikeWash /> },
    ],
  },
  { path: '/bike/:bikeId/add-log',  element: <AddLog /> },
  { path: '/add-vehicle',           element: <AddVehicle /> },
  { path: '/setup-vehicle/:bikeId', element: <VehicleSetupWizard /> },
])

export default function App() {
  // Show splash once per browser session
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('splashShown') === 'true'
  )

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true')
    setSplashDone(true)
  }

  return (
    <>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      <RouterProvider router={router} />
    </>
  )
}
