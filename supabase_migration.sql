-- ==========================================
-- 1. CLEAN RESET (Optional safety check)
-- ==========================================
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS organizations;

-- ==========================================
-- 2. CREATE CORE TABLES WITH CONSTRAINTS
-- ==========================================

-- Create the Organizations Multi-Tenant Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('School', 'Nonprofit', 'Business')),
    type_specific_field TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Relational Organization Members Table
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('invited', 'active')),
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE,
    -- Rule 3: "Prevent duplicate invitations to the same email within the same org"
    CONSTRAINT unique_org_email_invite UNIQUE (organization_id, email)
);

-- ==========================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. CONFIGURE ISOLATED ACCESSIBILITY POLICIES
-- ==========================================

-- Admins can only see organizations they explicitly created
CREATE POLICY "Admins can view their own organizations" 
ON organizations FOR SELECT 
USING (auth.uid() = created_by);

-- Admins can only insert organizations tied to their unique user ID
CREATE POLICY "Admins can create their own organizations" 
ON organizations FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Admins can view member directories ONLY for organizations they own
CREATE POLICY "Admins can view members of their own organizations" 
ON organization_members FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM organizations 
        WHERE organizations.id = organization_members.organization_id 
        AND organizations.created_by = auth.uid()
    )
);

-- Admins can modify member matrices ONLY for organizations they own
CREATE POLICY "Admins can insert members into their own organizations" 
ON organization_members FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM organizations 
        WHERE organizations.id = organization_members.organization_id 
        AND organizations.created_by = auth.uid()
    )
);