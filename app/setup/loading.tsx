import { PageSkeleton } from '@/components/PageSkeleton';

export default function Loading() {
  return <PageSkeleton width="max-w-xl" rows={2} panel={false} />;
}
