import Navbar from '../../components/layout/Navbar'
import AppWrapper from '../../components/layout/AppWrapper'
import PlaceholderPage from '../../components/PlaceholderPage'

export default function DashboardPage() {
  return (
    <AppWrapper>
      <Navbar />
      <PlaceholderPage title="Dashboard" />
    </AppWrapper>
  )
}