import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import PageWrapper from '../components/common/PageWrapper';
import { ArrowLeft, RefreshCw, Clock, FileText, Database, Eye, ExternalLink } from 'lucide-react';
import { useSiteSubmissions } from '../hooks/useBlobSubmissions';

export default function FormSubmissionsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Get creator address and network from deployment info
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  
  const {
    submissions,
    loading,
    error,
    refresh,
  } = useSiteSubmissions(address, slug || null, network);

  useEffect(() => {
    // Get creator address and network from deployment info using slug
    const loadDeployment = async () => {
      if (!slug) return;
      
      try {
        const deployment = await window.api.deployments.get(slug);
        if (deployment) {
          if (deployment.creatorAddress) {
            setAddress(deployment.creatorAddress);
          }
          if (deployment.network) {
            setNetwork(deployment.network as 'testnet' | 'mainnet');
          }
        }
      } catch (err) {
        console.error('Failed to get deployment:', err);
      }
    };
    loadDeployment();
  }, [slug]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading && submissions.length === 0) {
    return (
      <PageWrapper title="Form Responses">
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

  return (
    <PageWrapper title="Form Responses">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>

          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-default)]">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-accent-primary" />
              <span className="text-sm text-[var(--color-text-muted)]">Total Responses</span>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {submissions.length}
            </p>
          </div>

          <div className="p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-default)]">
            <div className="flex items-center gap-2 mb-2">
              <Database size={16} className="text-green-500" />
              <span className="text-sm text-[var(--color-text-muted)]">Deployment Slug</span>
            </div>
            <p className="text-sm font-mono text-[var(--color-text-primary)] truncate">
              {slug || 'N/A'}
            </p>
          </div>

          <div className="p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-default)]">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-yellow-500" />
              <span className="text-sm text-[var(--color-text-muted)]">Latest Response</span>
            </div>
            <p className="text-sm text-[var(--color-text-primary)]">
              {submissions.length > 0
                ? formatDate(submissions[0].submittedAt)
                : 'No responses'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-default)]">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 flex items-center justify-center mb-4">
              <FileText size={32} className="text-accent-primary" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              No responses yet
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] text-center max-w-md">
              Responses will appear here once users submit your form. Share your form portal link to start collecting responses.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission, index) => (
              <motion.div
                key={submission.objectId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-default)] hover:border-accent-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary font-medium">
                        #{index + 1}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {formatDate(submission.submittedAt)}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                      {submission.formName || 'Form Response'}
                    </h4>
                  </div>
                  <button
                    onClick={() => copyToClipboard(submission.blobId)}
                    className="p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    title="Copy Blob ID"
                  >
                    <FileText size={14} />
                  </button>
                </div>

                {/* Blob Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-[var(--color-bg-elevated)] rounded-lg">
                    <span className="text-xs text-[var(--color-text-muted)] block mb-1">Blob ID</span>
                    <p className="text-xs font-mono text-[var(--color-text-primary)] truncate">
                      {submission.blobId.slice(0, 20)}...
                    </p>
                  </div>
                  <div className="p-3 bg-[var(--color-bg-elevated)] rounded-lg">
                    <span className="text-xs text-[var(--color-text-muted)] block mb-1">Object ID</span>
                    <p className="text-xs font-mono text-[var(--color-text-primary)] truncate">
                      {submission.objectId.slice(0, 20)}...
                    </p>
                  </div>
                </div>

                {/* Responses Preview */}
                {Object.keys(submission.responses).length > 0 && (
                  <div className="p-3 bg-[var(--color-bg-elevated)] rounded-lg">
                    <span className="text-xs text-[var(--color-text-muted)] block mb-2">Responses</span>
                    <div className="space-y-2">
                      {Object.entries(submission.responses).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <span className="text-xs text-[var(--color-text-muted)] min-w-[80px]">{key}:</span>
                          <span className="text-xs text-[var(--color-text-primary)]">
                            {String(value).slice(0, 50)}{String(value).length > 50 ? '...' : ''}
                          </span>
                        </div>
                      ))}
                      {Object.keys(submission.responses).length > 3 && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                          +{Object.keys(submission.responses).length - 3} more fields
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border-default)]">
                  <a
                    href={`https://walruscan.com/${network}/blob/${submission.blobId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-xs font-medium hover:bg-accent-primary-hover transition-colors"
                  >
                    <ExternalLink size={12} />
                    View on Walrus
                  </a>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] text-xs font-medium hover:bg-[var(--color-bg-surface)] transition-colors">
                    <Eye size={12} />
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </PageWrapper>
  );
}