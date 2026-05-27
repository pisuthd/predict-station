import { Copy, ExternalLink, Link, Hash } from 'lucide-react';
import { DeploymentInfo } from '../../types/api';

interface FormInfoCardsProps {
  deployment: DeploymentInfo;
  onCopy: (text: string) => void;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
  truncateAddress: (address: string) => string;
}

export default function FormInfoCards({ 
  deployment, 
  onCopy, 
  formatDate, 
  formatTime,
  truncateAddress 
}: FormInfoCardsProps) {
  return (
    <div className="space-y-4">
      {/* Info Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Network */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Network</p>
          <p className="text-sm font-semibold text-gray-900 capitalize">{deployment.network}</p>
        </div>
        
        {/* Deployed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Deployed</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(deployment.deployedAt)}</p>
          <p className="text-xs text-gray-400">{formatTime(deployment.deployedAt)}</p>
        </div>
        
        {/* Expires */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Expires</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(deployment.expiresAt)}</p>
          <p className="text-xs text-gray-400">{deployment.epochs} epoch(s)</p>
        </div>
        
        {/* Creator */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Creator</p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-mono text-gray-900 truncate">
              {truncateAddress(deployment.creatorAddress)}
            </p>
            <button
              onClick={() => onCopy(deployment.creatorAddress)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Copy address"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Portal URL Card */}
      {deployment.portalUrl && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Link size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Form URL</p>
                <p className="text-xs text-gray-500 truncate max-w-md">{deployment.portalUrl}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => deployment.portalUrl && onCopy(deployment.portalUrl)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Copy URL"
              >
                <Copy size={18} />
              </button>
              <a
                href={deployment.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary-hover transition-colors text-sm"
              >
                <ExternalLink size={16} />
                Open
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Site Object ID */}
      {deployment.siteObjectId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Hash size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Site Object ID</p>
                <p className="text-xs font-mono text-gray-500">{deployment.siteObjectId}</p>
              </div>
            </div>
            <button
              onClick={() => deployment.siteObjectId && onCopy(deployment.siteObjectId)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="Copy ID"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}