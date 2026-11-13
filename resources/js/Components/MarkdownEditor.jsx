import { lazy, Suspense } from 'react';

// TOAST UI Editor ±500 KB: hanya diunduh ketika editor benar-benar dibuka.
const Impl = lazy(() => import('./MarkdownEditorImpl'));

export default function MarkdownEditor(props) {
    return (
        <Suspense fallback={<div className="h-[55vh] animate-pulse rounded-lg bg-slate-100" aria-label="Memuat editor" />}>
            <Impl {...props} />
        </Suspense>
    );
}
