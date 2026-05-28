import PageWrapper from '../components/common/PageWrapper';
import { WelcomeCard, AIStatusCard, AccountCard } from '../components/dashboard';
import WelcomeModelModal from '../components/common/WelcomeModelModal';
import { useAI } from '../context/AIContext';

export default function OverviewPage() {
  const { showWelcomeModal, setShowWelcomeModal, enableAI } = useAI();

  return (
    <>
      <WelcomeModelModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onSelect={(model) => enableAI(model)}
      />

      <PageWrapper title="Overview">
        <WelcomeCard />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AccountCard network="testnet" />
          <AIStatusCard />
        </div>
      </PageWrapper>
    </>
  );
}