import { useState, useEffect, useCallback } from 'react';

interface SubmissionData {
  blobId: string;
  objectId: string;
  slug: string;
  formName: string;
  submittedAt: string;
  responses: Record<string, unknown>;
}

interface UseBlobSubmissionsReturn {
  submissions: SubmissionData[];
  loading: boolean;
  error: string | null;
  getSubmissionsForSlug: (slug: string) => SubmissionData[];
  refresh: () => void;
}

export function useBlobSubmissions(
  address: string | null,
  network: 'testnet' | 'mainnet' = 'testnet'
): UseBlobSubmissionsReturn {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!address) {
      setSubmissions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.api.submissions.getOwned({
        address,
        network,
      });

      if (result.success) {
        setSubmissions(result.submissions || []);
      } else {
        setError(result.error || 'Failed to fetch submissions');
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Failed to fetch submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [address, network]);

  const getSubmissionsForSlug = useCallback(
    (slug: string): SubmissionData[] => {
      return submissions.filter((s) => s.slug === slug);
    },
    [submissions]
  );

  const refresh = useCallback(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    error,
    getSubmissionsForSlug,
    refresh,
  };
}

// Hook for fetching submissions for a specific slug
export function useSiteSubmissions(
  address: string | null,
  slug: string | null,
  network: 'testnet' | 'mainnet' = 'testnet'
) {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!address || !slug) {
      setSubmissions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.api.submissions.getBySlug({
        address,
        slug,
        network,
      });

      if (result.success) {
        setSubmissions(result.submissions || []);
      } else {
        setError(result.error || 'Failed to fetch submissions');
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Failed to fetch submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [address, slug, network]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    error,
    refresh: fetchSubmissions,
  };
}