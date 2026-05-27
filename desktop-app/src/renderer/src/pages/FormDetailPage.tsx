import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import PageWrapper from '../components/common/PageWrapper';
import { ArrowLeft, FileText } from 'lucide-react';
import { DeploymentInfo } from '../types/api';
import FormDetailHeader from '../components/form/FormDetailHeader';
import FormInfoCards from '../components/form/FormInfoCards';
import FormPreview from '../components/form/FormPreview';
import ResponsesList from '../components/form/ResponsesList';

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

type TabType = 'details' | 'responses' | 'export';

export default function FormDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState<DeploymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');

  useEffect(() => {
    loadDeployment();
  }, [slug]);

  const loadDeployment = async () => {
    if (!slug) return;
    
    setLoading(true);
    try {
      const deploymentData = await window.api.deployments.get(slug);
      if (deploymentData) {
        setDeployment(deploymentData);
      }
    } catch (error) {
      console.error('Failed to load deployment:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  if (loading) {
    return (
      <PageWrapper title="Form Details">
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!deployment) {
    return (
      <PageWrapper title="Form Details">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center mb-6">
            <FileText size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Deployment not found</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            This deployment may have been deleted.
          </p>
          <button
            onClick={() => navigate('/recent-forms')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Recent Forms
          </button>
        </div>
      </PageWrapper>
    );
  }

  const fields = deployment.formFields as FormField[] || [];

  return (
    <PageWrapper title={deployment.formName}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl"
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/recent-forms')}
          className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Recent Forms</span>
        </button>

        {/* Header with tabs */}
        <FormDetailHeader 
          deployment={deployment}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Info Cards */}
            <FormInfoCards 
              deployment={deployment}
              onCopy={copyToClipboard}
              formatDate={formatDate}
              formatTime={formatTime}
              truncateAddress={truncateAddress}
            />

            {/* Form Preview */}
            <FormPreview 
              formName={deployment.formName}
              fields={fields}
            />
          </div>
        )}

        {activeTab === 'responses' && (
          <ResponsesList
            slug={deployment.slug}
            creatorAddress={deployment.creatorAddress}
            network={deployment.network}
            fields={fields}
            portalUrl={deployment.portalUrl}
          />
        )}

        {activeTab === 'export' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Form</h3>
            <p className="text-sm text-gray-500 mb-6">
              Download this form as a JSON file that you can import later.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-64">
                {JSON.stringify({
                  version: '1.0',
                  exportedAt: new Date().toISOString(),
                  deployment: {
                    slug: deployment.slug,
                    network: deployment.network,
                    epochs: deployment.epochs,
                    formName: deployment.formName,
                    creatorAddress: deployment.creatorAddress,
                    siteObjectId: deployment.siteObjectId,
                    portalUrl: deployment.portalUrl,
                    formFields: fields,
                  }
                }, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => {
                const exportData = {
                  version: '1.0',
                  exportedAt: new Date().toISOString(),
                  deployment: {
                    slug: deployment.slug,
                    network: deployment.network,
                    epochs: deployment.epochs,
                    formName: deployment.formName,
                    creatorAddress: deployment.creatorAddress,
                    siteObjectId: deployment.siteObjectId,
                    portalUrl: deployment.portalUrl,
                    formFields: fields,
                  }
                };
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${deployment.formName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary-hover transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download JSON
            </button>
          </div>
        )}
      </motion.div>
    </PageWrapper>
  );
}