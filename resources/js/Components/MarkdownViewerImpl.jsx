import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { useEffect, useRef } from 'react';

/** TOAST UI Viewer: merender Markdown menjadi HTML. */
export default function MarkdownViewerImpl({ content = '' }) {
    const el = useRef(null);

    useEffect(() => {
        const viewer = new Viewer({ el: el.current, initialValue: content, usageStatistics: false });
        return () => viewer.destroy();
    }, [content]);

    return <div ref={el} />;
}
