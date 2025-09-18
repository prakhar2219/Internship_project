 Approach:
This project uses a shared schema with a tenantId column for multi-tenancy.

How it works:
Users and Notes have a tenantId field that links them to a specific tenant.
All API queries filter by tenantId so that:
Users can only access data belonging to their tenant.
Members cannot see or modify notes from other tenants.
Admins can only manage users within their tenant.

frontend-https://internship-project-frontend-pied.vercel.app/
backend-https://internship-project-server-ruddy.vercel.app/
