import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Spinner from './Spinner';

/** Top progress bar + floating pill "Memproses tindakan..." untuk setiap request Inertia. */
export default function LoadingIndicator() {
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const offStart = router.on('start', () => setBusy(true));
        const offFinish = router.on('finish', () => setBusy(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    if (!busy) return null;

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden bg-indigo-100" role="progressbar">
                <div className="animate-progress-bar h-full w-full bg-primary" />
            </div>
            <div className="fixed bottom-4 right-4 z-[70] flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
                <Spinner />
                Memproses tindakan...
            </div>
        </>
    );
}
