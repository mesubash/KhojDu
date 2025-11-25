# Default Users Configuration

## Overview
The backend automatically creates three default users on startup for testing purposes.

## Default Users

### 1. Admin User
- **Email:** `admin@khojdu.com`
- **Password:** `adminpassword`
- **Role:** ADMIN
- **Full Name:** System Administrator
- **Phone:** 9800000000
- **Occupation:** System Administrator
- **Status:** Verified & Active

**Permissions:**
- Full system access
- User management
- System configuration
- All administrative functions

---

### 2. Tenant User
- **Email:** `tenant@khojdu.com`
- **Password:** `tenantpassword`
- **Role:** TENANT
- **Full Name:** Test Tenant
- **Phone:** 9800000001
- **Occupation:** Software Engineer
- **Status:** Verified & Active

**Permissions:**
- Search for properties
- View property listings
- Contact landlords
- Manage own profile
- Save favorites

---

### 3. Landlord User
- **Email:** `landlord@khojdu.com`
- **Password:** `landlordpassword`
- **Role:** LANDLORD
- **Full Name:** Test Landlord
- **Phone:** 9800000002
- **Occupation:** Property Owner
- **Status:** Verified & Active

**Permissions:**
- Create property listings
- Manage own properties
- View tenant inquiries
- Respond to messages
- Manage own profile

---

## How It Works

### Automatic Creation
The `DefaultUserConfig.java` class runs on application startup:

```java
@Bean
public CommandLineRunner createDefaultUsers() {
    return args -> {
        // Creates admin, tenant, and landlord users
        // Only if they don't already exist
    };
}
```

### Duplicate Prevention
- Checks if user exists by email before creating
- If user exists, skips creation
- Logs status for each user

### Console Output
On startup, you'll see:
```
🔧 Checking and creating default users...
   Creating ADMIN user: admin@khojdu.com
   ✅ ADMIN user created: admin@khojdu.com / adminpassword
   Creating TENANT user: tenant@khojdu.com
   ✅ TENANT user created: tenant@khojdu.com / tenantpassword
   Creating LANDLORD user: landlord@khojdu.com
   ✅ LANDLORD user created: landlord@khojdu.com / landlordpassword
✅ Default users initialization complete!
⚠️  IMPORTANT: Change all default passwords immediately in production!
```

Or if users already exist:
```
🔧 Checking and creating default users...
   ✓ ADMIN user already exists: admin@khojdu.com
   ✓ TENANT user already exists: tenant@khojdu.com
   ✓ LANDLORD user already exists: landlord@khojdu.com
✅ Default users initialization complete!
```

---

## Testing Login

### Test Admin Login
```bash
curl -X POST http://localhost:8089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@khojdu.com",
    "password": "adminpassword"
  }'
```

### Test Tenant Login
```bash
curl -X POST http://localhost:8089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant@khojdu.com",
    "password": "tenantpassword"
  }'
```

### Test Landlord Login
```bash
curl -X POST http://localhost:8089/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@khojdu.com",
    "password": "landlordpassword"
  }'
```

---

## Frontend Login

### Login Page
Navigate to: `http://localhost:3000/auth/login`

**Try these credentials:**

1. **Admin:**
   - Email: `admin@khojdu.com`
   - Password: `adminpassword`

2. **Tenant:**
   - Email: `tenant@khojdu.com`
   - Password: `tenantpassword`

3. **Landlord:**
   - Email: `landlord@khojdu.com`
   - Password: `landlordpassword`

---

## Security Notes

### ⚠️ Important Security Warnings

1. **Development Only**
   - These default users are for **development and testing only**
   - **DO NOT use in production** with these passwords

2. **Change Passwords**
   - Change all default passwords immediately after first login
   - Use strong, unique passwords for each account

3. **Remove in Production**
   - Consider disabling default user creation in production
   - Or use environment variables for credentials
   - Or create users through admin interface

4. **Password Security**
   - Passwords are hashed using BCrypt
   - Never store plain text passwords
   - Use strong password policies

### Production Recommendations

**Option 1: Disable Default Users**
```java
@Profile("!prod")  // Only run in non-production
@Bean
public CommandLineRunner createDefaultUsers() {
    // ...
}
```

**Option 2: Environment Variables**
```java
@Value("${default.admin.email:admin@khojdu.com}")
private String adminEmail;

@Value("${default.admin.password:adminpassword}")
private String adminPassword;
```

**Option 3: Remove Entirely**
- Delete or comment out the `DefaultUserConfig.java` class
- Create users manually through admin interface

---

## User Profile Structure

Each user has:

### User Entity
- ID (UUID)
- Email (unique)
- Password Hash (BCrypt)
- Full Name
- Phone (10 digits)
- Role (ADMIN/TENANT/LANDLORD)
- Date of Birth
- Occupation
- Is Verified (boolean)
- Is Active (boolean)
- Created At
- Updated At

### User Profile Entity
- ID
- User (reference)
- Bio
- Avatar URL
- Preferences
- Additional metadata

---

## Role-Based Access

### ADMIN
- Can access admin dashboard
- Can manage all users
- Can view all properties
- Can moderate content
- Full system access

### TENANT
- Can search properties
- Can view listings
- Can contact landlords
- Can save favorites
- Can manage own profile

### LANDLORD
- Can create listings
- Can manage properties
- Can view inquiries
- Can respond to tenants
- Can manage own profile

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    role VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    occupation VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### User Profiles Table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Troubleshooting

### Users Not Created
**Check:**
1. Database connection is working
2. Tables exist (run migrations)
3. No duplicate emails in database
4. Check application logs for errors

### Login Fails
**Check:**
1. User was created successfully (check logs)
2. Email is correct (case-sensitive)
3. Password is correct
4. User is active and verified
5. Backend is running

### Password Reset
If you need to reset a default user password:

```sql
-- Reset admin password to 'newpassword'
UPDATE users 
SET password_hash = '$2a$10$...' -- Use BCrypt hash
WHERE email = 'admin@khojdu.com';
```

Or delete and recreate:
```sql
DELETE FROM user_profiles WHERE user_id IN (
    SELECT id FROM users WHERE email = 'admin@khojdu.com'
);
DELETE FROM users WHERE email = 'admin@khojdu.com';
-- Restart application to recreate
```

---

## Summary

✅ **Three default users** - Admin, Tenant, Landlord
✅ **Auto-created on startup** - No manual setup needed
✅ **Pre-verified** - Ready to use immediately
✅ **Unique credentials** - Different emails and phones
✅ **Role-based** - Proper permissions for each role
✅ **Idempotent** - Safe to restart application
✅ **Logged** - Clear console output

**Quick Test:**
1. Start backend
2. Check logs for user creation
3. Login with any of the three accounts
4. Verify role-specific access

**Remember:** Change all passwords before deploying to production! 🔒
