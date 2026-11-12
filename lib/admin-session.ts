const ADMIN_EMAIL_STORAGE_KEY = "farol_admin_email";
const ADMIN_EMAIL_CHANGE_EVENT = "farol:admin-email-changed";

export function getAdminEmail() {
    return window.sessionStorage.getItem(ADMIN_EMAIL_STORAGE_KEY) ?? "";
}

export function subscribeToAdminEmail(onChange: () => void) {
    window.addEventListener(ADMIN_EMAIL_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(ADMIN_EMAIL_CHANGE_EVENT, onChange);
}

export function setAdminEmail(email: string) {
    window.sessionStorage.setItem(ADMIN_EMAIL_STORAGE_KEY, email);
    window.dispatchEvent(new Event(ADMIN_EMAIL_CHANGE_EVENT));
}

export function clearAdminEmail() {
    window.sessionStorage.removeItem(ADMIN_EMAIL_STORAGE_KEY);
    window.dispatchEvent(new Event(ADMIN_EMAIL_CHANGE_EVENT));
}
