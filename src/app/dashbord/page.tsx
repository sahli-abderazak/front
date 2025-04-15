import { Card } from "@/components/ui/card"
import { DashboardHeader } from "../components/dashboard-header"
import { DashboardSidebar } from "../components/dashboard-sidebar"
import { StatsCards } from "../components/stats-cards"
import { DashboardCharts } from "../components/dashboard-charts"
import { TeamLeads } from "../components/team-leads"
import { TodayActivities } from "../components/today-activities"
import { RecentActivities } from "../components/recent-activities"
import { UpcomingLeaves } from "../components/upcoming-leaves"
import { WelcomeBanner } from "../components/welcome-banner"
import { QuickActions } from "../components/quick-actions"


export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Sidebar - visible on desktop, hidden on mobile (handled by MobileSidebar) */}
          <div className="hidden md:block md:col-span-1 lg:col-span-1">
            <div className="sticky top-20">
              <DashboardSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-5 lg:col-span-5 space-y-6">
            {/* Welcome Banner */}
            <WelcomeBanner />

            {/* Quick Actions */}
            <QuickActions />

            {/* Stats Cards */}
            <div className="grid gap-6">
              <StatsCards />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <DashboardCharts />
              </Card>
            </div>

            {/* Team and Activities Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <TeamLeads />
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <TodayActivities />
              </Card>
            </div>

            {/* Recent Activities and Leaves */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <RecentActivities />
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <UpcomingLeaves />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}