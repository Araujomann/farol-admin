import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
    dashboard: (
        <>
            <rect x="3" y="3" width="8" height="8" rx="1.5" />
            <rect x="13" y="3" width="8" height="5" rx="1.5" />
            <rect x="13" y="10" width="8" height="11" rx="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </>
    ),
    reports: (
        <>
            <path d="M8 3h7l5 5v13H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
            <path d="M15 3v5h5M10 13h6M10 17h6" />
            <path d="M4 7H3v14a2 2 0 0 0 2 2h12v-1" />
        </>
    ),
    bell: (
        <>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
        </>
    ),
    alert: (
        <>
            <path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4m0 4h.01" />
        </>
    ),
    calendar: (
        <>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
        </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    cloud: (
        <>
            <path d="M20 16.2A4.5 4.5 0 0 0 18.5 7.5 6 6 0 0 0 7 9a4 4 0 0 0 0 8h12" />
            <path d="m8 20 2-2m4 2 2-2" />
        </>
    ),
    edit: (
        <>
            <path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
        </>
    ),
    eye: (
        <>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    eyeOff: (
        <>
            <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.1 3.9M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4.1-.9" />
        </>
    ),
    filter: (
        <>
            <path d="M4 7h16M7 12h10m-7 5h4" />
            <circle cx="8" cy="7" r="1" />
            <circle cx="14" cy="12" r="1" />
            <circle cx="12" cy="17" r="1" />
        </>
    ),
    imageOff: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m3 3 18 18M10 10l-4 5m8-1 2 2m-5-5 1-1" />
        </>
    ),
    lock: (
        <>
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2" />
        </>
    ),
    refresh: (
        <>
            <path d="M20 7v5h-5M4 17v-5h5" />
            <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />
        </>
    ),
    share: (
        <>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4" />
        </>
    ),
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </>
    ),
    thumbsUp: (
        <>
            <path d="M7 10v12" />
            <path d="M7 10h3.5l2.2-6.1a2 2 0 0 1 3.8 1.2L15.5 10h4a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.2 21H7" />
            <path d="M3 10h4v12H3a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1Z" />
        </>
    ),
    users: (
        <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="10" cy="7" r="4" />
            <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
    ),
    mail: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </>
    ),
    upload: (
        <>
            <path d="M12 16V4m-5 5 5-5 5 5" />
            <path d="M4 16v4h16v-4" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
    pin: (
        <>
            <path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13Z" />
            <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        </>
    ),
    logout: (
        <>
            <path d="M10 17l5-5-5-5M15 12H3" />
            <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
};

export type IconName = keyof typeof paths;

export function Icon({
    name,
    ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
    return (
        <svg
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            {...props}
        >
            {paths[name]}
        </svg>
    );
}
