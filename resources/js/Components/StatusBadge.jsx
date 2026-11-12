export default function StatusBadge({ published }) {
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {published ? 'Published' : 'Draf'}
        </span>
    );
}
