import { RotateCw, Trash2, Search, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { DeploymentInfo } from '../../types/api';
import ConfirmModal from '../common/ConfirmModal';

interface DeploymentsTableProps {
  deployments: DeploymentInfo[];
  onRefresh?: () => void;
  onDelete?: (slug: string) => void;
  onDeploymentClick?: (slug: string) => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DeploymentsTable({ deployments, onRefresh, onDelete, onDeploymentClick }: DeploymentsTableProps) {
  const [filter, setFilter] = useState('');
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const filteredDeployments = deployments.filter(deployment => 
    deployment.formName.toLowerCase().includes(filter.toLowerCase()) ||
    deployment.slug.toLowerCase().includes(filter.toLowerCase())
  );

  const getNetworkBadge = (network: string) => {
    const colors = {
      mainnet: 'bg-green-500/20 text-green-500',
      testnet: 'bg-yellow-500/20 text-yellow-500',
    };
    return colors[network as keyof typeof colors] || 'bg-blue-500/20 text-blue-500';
  };

  const getDeploymentName = (slug: string) => {
    const deployment = deployments.find(d => d.slug === slug);
    return deployment?.formName || slug;
  };

  const columns = [
    { key: 'formName', label: 'Form Name' },
    { key: 'network', label: 'Network' },
    { key: 'deployedAt', label: 'Deployed' },
    { key: 'expiresAt', label: 'Expires' },
    { key: 'actions', label: '' },
  ];

  const handleDeleteClick = (slug: string) => {
    setDeletingSlug(slug);
  };

  const handleConfirmDelete = () => {
    if (deletingSlug && onDelete) {
      onDelete(deletingSlug);
    }
    setDeletingSlug(null);
  };

  const handleCancelDelete = () => {
    setDeletingSlug(null);
  };

  return (
    <>
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-default)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Deployments ({deployments.length})
          </h3>
          <div className="flex items-center gap-3">
            {/* Filter input */}
            <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]">
              <Search size={14} className="text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter..."
                className="bg-transparent text-sm outline-none w-40 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-accent-primary transition-colors text-sm"
            >
              <RotateCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredDeployments.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-muted)]">
              {deployments.length === 0 ? 'No deployments yet' : 'No deployments found'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-[var(--color-text-muted)]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDeployments.map((deployment) => (
                  <tr
                    key={deployment.slug}
                    onClick={() => onDeploymentClick?.(deployment.slug)}
                    className="border-b border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {deployment.formName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getNetworkBadge(deployment.network)}`}>
                        {deployment.network}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-muted)]">
                      {formatDate(deployment.deployedAt)}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-muted)]">
                      {formatDate(deployment.expiresAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {deployment.portalUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(deployment.portalUrl!, '_blank');
                            }}
                            className="p-2 rounded-lg hover:bg-accent-primary/10 text-[var(--color-text-muted)] hover:text-accent-primary transition-colors"
                            title="Open Portal"
                          >
                            <ExternalLink size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(deployment.slug);
                            }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deletingSlug !== null}
        title="Delete Deployment"
        message={`Are you sure you want to delete "${getDeploymentName(deletingSlug || '')}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCancelDelete}
      />
    </>
  );
}