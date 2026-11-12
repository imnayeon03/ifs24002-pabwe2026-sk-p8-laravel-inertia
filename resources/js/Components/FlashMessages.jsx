import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessages() {
    const { flash } = usePage().props;
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (flash?.success) setMsg({ type: 'success', text: flash.success });
        else if (flash?.error) setMsg({ type: 'error', text: flash.error });
        else return;
        const t = setTimeout(() => setMsg(null), 5000);
        return () => clearTimeout(t);
    }, [flash?.success, flash?.error]);

    if (!msg) return null;
    const tone = msg.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';

    return (
        <div role="status" className={`fixed right-4 top-4 z-[60] max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${tone}`}>
            <div className="flex items-start gap-3">
                <span className="flex-1">{msg.text}</span>
                <button type="button" onClick={() => setMsg(null)} aria-label="Tutup" className="opacity-80 hover:opacity-100">✕</button>
            </div>
        </div>
    );
}
