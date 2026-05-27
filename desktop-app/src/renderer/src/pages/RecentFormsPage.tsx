import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import PageWrapper from '../components/common/PageWrapper';
import DeploymentsTable from '../components/forms/DeploymentsTable';
import { DeploymentInfo } from '../types/api';

export default function RecentFormsPage() {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate structure (new format with deployment object)
      if (!data.version || !data.deployment || !data.deployment.slug || !data.deployment.formName || !data.deployment.formFields) {
        alert('Invalid form file format');
        return;
      }

      // Import via IPC
      const result = await window.api.deployments.import(data);
      if (result.success) {
        fetchDeployments();
      } else {
        alert('Failed to import: ' + result.error);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchDeployments = async () => {
    setIsLoading(true);
    try {
      const allDeployments = await window.api.deployments.getAll();
      setDeployments(allDeployments || []);
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const handleDeploymentClick = (slug: string) => {
    navigate(`/form/${slug}`);
  };

  const handleDelete = async (slug: string) => {
    try {
      await window.api.deployments.delete(slug);
      fetchDeployments();
    } catch (error) {
      console.error('Failed to delete deployment:', error);
      throw error;
    }
  };

  return (
    <PageWrapper 
      title="Recent Forms"
      action={
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Import
          </button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
        <DeploymentsTable
          deployments={deployments}
          onRefresh={fetchDeployments}
          onDelete={handleDelete}
          onDeploymentClick={handleDeploymentClick}
        />
      )}
    </PageWrapper>
  );
}