import PageWrapper from '../components/common/PageWrapper';
import { WelcomeCard, AIStatusCard, AccountCard } from '../components/dashboard';


export default function OverviewPage() {
  return (
    <PageWrapper title="Overview">
      <WelcomeCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountCard
          address={"0x98d9d3e7b644182c87310ba8c6c7fdb4a2f2338cd0db58d7e6fa88e562129318"}
          network="testnet"
          setNetwork={() => { }}
          hasWallet={true}
        />
        <AIStatusCard />
      </div>


    </PageWrapper>
  );
}