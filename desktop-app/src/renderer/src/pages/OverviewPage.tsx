import PageWrapper from '../components/common/PageWrapper';
import { WelcomeCard, AIStatusCard, AccountCard } from '../components/dashboard';


export default function OverviewPage() {
  return (
    <PageWrapper title="Overview">
      <WelcomeCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountCard network="testnet" />
        <AIStatusCard />
      </div>


    </PageWrapper>
  );
}