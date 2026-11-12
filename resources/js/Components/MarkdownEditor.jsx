import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useEffect, useRef } from 'react';

/** TOAST UI Editor (Markdown). Gunakan `key` untuk me-remount ketika nilai awal berganti. */
export default function MarkdownEditor({ value = '', onChange, height = '55vh' }) {
    const el = useRef(null);
    const instance = useRef(null);
    const handler = useRef(onChange);
    handler.current = onChange;

    useEffect(() => {
        instance.current = new Editor({
            el: el.current,
            height,
            initialEditType: 'markdown',
            previewStyle: 'vertical',
            initialValue: value,
            usageStatistics: false,
            placeholder: 'Tulis artikel dalam format Markdown...',
            events: { change: () => handler.current?.(instance.current.getMarkdown()) },
        });
        return () => {
            instance.current?.destroy();
            instance.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={el} />;
}
