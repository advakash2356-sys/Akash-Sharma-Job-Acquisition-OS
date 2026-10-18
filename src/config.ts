// Owner contact details come from env vars (VITE_*). Set them in .env.local; see .env.example.
export const CONTACT_EMAIL: string = import.meta.env.VITE_CONTACT_EMAIL || 'admin@example.com';
export const CONTACT_PHONE: string = import.meta.env.VITE_CONTACT_PHONE || '+91 00000 00000';
