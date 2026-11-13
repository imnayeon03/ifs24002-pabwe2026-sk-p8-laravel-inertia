import { lazy, Suspense } from 'react';

const Impl = lazy(() => import('./MarkdownViewerImpl'));

export default function MarkdownViewer(props) {
    return (
        <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-slate-100" aria-label="Memuat artikel" />}>
            <Impl {...props} />
        </Suspense>
    );
}
