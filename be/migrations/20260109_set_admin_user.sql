-- Set admin role for a specific user
-- Replace 'your-user-email@example.com' with the email of the user you want to make admin

-- Option 1: By email
-- UPDATE users SET role = 'admin' WHERE email = 'your-user-email@example.com';

-- Option 2: By user ID
-- UPDATE users SET role = 'admin' WHERE id = 'your-user-uuid-here';

-- To run this migration:
-- 1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/vdwjfekcsnurtjsieojv/sql
-- 2. Copy and paste the UPDATE statement with your email/user ID
-- 3. Run the query

-- Example (uncomment and modify):
-- UPDATE users SET role = 'admin' WHERE email = 'admin@yourcompany.com';

-- Verify the change:
-- SELECT id, email, role FROM users WHERE role = 'admin';
