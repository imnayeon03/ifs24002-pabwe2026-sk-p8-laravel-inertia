import { initials } from '../lib/format';

export default function Avatar({ user, size = 'h-8 w-8' }) {
    return user?.profile_photo_url ? (
        <img src={user.profile_photo_url} alt={user.name} className={`${size} rounded-full object-cover`} />
    ) : (
        <span className={`${size} inline-flex items-center justify-center rounded-full bg-primary text-xs font-semibold text-white`}>
            {initials(user?.name)}
        </span>
    );
}
