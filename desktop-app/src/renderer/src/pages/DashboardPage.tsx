import PageWrapper from '../components/common/PageWrapper';
import { WelcomeCard, CLICard, AIStatusCard } from '../components/dashboard';

export default function DashboardPage() {
  return (
    <PageWrapper title="Dashboard">
      <WelcomeCard />

      {/* Second Row: CLI Card (Left) + AI Status (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CLICard />
        <AIStatusCard />
      </div>
    </PageWrapper>
  );
}
