import { Clock, FileText, Upload, RefreshCw, Star, Download } from 'lucide-react';
import { useSiteSubmissions } from '../../hooks/useBlobSubmissions';

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

interface SubmissionData {
  blobId: string;
  objectId: string;
  slug: string;
  formName: string;
  submittedAt: string;
  responses: Record<string, unknown>;
}

interface ResponsesListProps {
  slug: string;
  creatorAddress: string;
  network?: string;
  fields: FormField[];
  portalUrl?: string | null;
}

export default function ResponsesList({ 
  slug, 
  creatorAddress, 
  network,
  fields,
  portalUrl 
}: ResponsesListProps) { 
   
  const {
    submissions,
    loading,
    error,
    refresh,
  } = useSiteSubmissions(creatorAddress, slug, (network as 'testnet' | 'mainnet') || 'testnet');

  // Get human-readable value for export
  const getExportValue = (fieldId: string, value: unknown): string => {
    const field = fields.find(f => f.id === fieldId);
    
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'object' && value !== null) {
      if ('filename' in value) return (value as {filename: string}).filename;
      return JSON.stringify(value);
    }

    if (!field) return String(value);

    switch (field.type) {
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'rating':
        return `${value}/${field.max || 5}`;
      case 'date':
        try {
          return new Date(String(value)).toLocaleDateString();
        } catch {
          return String(value);
        }
      default:
        return String(value);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Submitted At', ...fields.map(f => f.label)];
    const rows = submissions.map(sub => {
      const answers = sub.responses || {};
      return [
        new Date(sub.submittedAt).toLocaleString(),
        ...fields.map(f => getExportValue(f.id, answers[f.id]))
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses-${slug}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to JSON with human-readable field names
  const exportToJSON = () => {
    const data = submissions.map(sub => {
      const answers = sub.responses || {};
      const humanResponses: Record<string, string> = {};
      
      fields.forEach(f => {
        humanResponses[f.label] = getExportValue(f.id, answers[f.id]);
      });
      
      return {
        submittedAt: sub.submittedAt,
        blobId: sub.blobId,
        ...humanResponses
      };
    });
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses-${slug}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'Unknown';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Map raw response value to human-readable format
  const mapFieldValue = (fieldId: string, value: unknown): React.ReactNode => {
    const field = fields.find(f => f.id === fieldId);
    
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">-</span>;
    }

    // Handle file upload responses
    if (typeof value === 'object' && value !== null && 'blobId' in value) {
      const fileData = value as { filename: string; blobId: string; size?: number };
      return (
        <div className="flex items-center gap-1">
          <Upload size={12} className="text-blue-500" />
          <span className="text-blue-600">{fileData.filename}</span>
        </div>
      );
    }

    if (!field) {
      return String(value);
    }

    switch (field.type) {
      case 'checkbox':
        return (
          <span className={value ? 'text-green-600' : 'text-gray-400'}>
            {value ? '✓' : '✗'}
          </span>
        );

      case 'rating':
        const numValue = typeof value === 'number' ? value : parseInt(String(value)) || 0;
        const max = field.max || 5;
        return (
          <div className="flex items-center gap-1">
            {[...Array(max)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className={i < numValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
              />
            ))}
            <span className="ml-1 text-xs">{numValue}/{max}</span>
          </div>
        );

      case 'select':
        if (field.options && field.options.includes(String(value))) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
              {String(value)}
            </span>
          );
        }
        return String(value);

      case 'date':
        try {
          const date = new Date(String(value));
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
          return String(value);
        }

      case 'email':
        return (
          <span className="text-blue-600">{String(value)}</span>
        );

      case 'url':
        return (
          <span className="text-blue-600 truncate max-w-[200px] block">{String(value)}</span>
        );

      case 'tel':
        return <span>{String(value)}</span>;

      default:
        return String(value);
    }
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="ml-3 text-gray-500">Loading responses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 rounded-lg bg-accent-primary text-white hover:bg-accent-primary-hover"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses yet</h3>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
            Share your form to start collecting responses.
          </p>
          {portalUrl && (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-primary text-white font-medium hover:bg-accent-primary-hover transition-colors"
            >
              Open Form
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-gray-900">{submissions.length} Response{submissions.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            title="Export to CSV"
          >
            <Download size={14} />
            CSV
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            title="Export to JSON"
          >
            <Download size={14} />
            JSON
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Response Cards - Minimal */}
      {submissions.map((submission: SubmissionData, index: number) => {
        const answers = submission.responses || {};

        return (
          <div 
            key={submission.objectId || index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            {/* Minimal header - just timestamp */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <Clock size={12} />
              <span>{formatDate(submission.submittedAt)}</span>
            </div>

            {/* Response Fields - compact grid */}
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 min-w-[80px] truncate">{field.label}:</span>
                  <span className="text-gray-900 flex-1 truncate">
                    {mapFieldValue(field.id, answers[field.id])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}