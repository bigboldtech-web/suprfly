import Badge from './Badge';
import type { CommentStatus } from '@/types';

const statusMap: Record<CommentStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'muted' | 'info' }> = {
  PENDING_REVIEW: { label: 'Pending Review', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'info' },
  QUEUED: { label: 'Queued', variant: 'info' },
  POSTING: { label: 'Posting', variant: 'info' },
  POSTED: { label: 'Posted', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
  REJECTED: { label: 'Rejected', variant: 'muted' },
  FILTERED: { label: 'Filtered', variant: 'muted' },
};

export default function StatusBadge({ status }: { status: CommentStatus }) {
  const config = statusMap[status] || { label: status, variant: 'muted' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
