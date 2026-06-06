-- 1. Create custom Enumerated Types for strict validation
CREATE TYPE org_type AS ENUM ('School', 'Nonprofit', 'Business');
CREATE TYPE member_status AS ENUM ('invited', 'active');

-- 2. Create the Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type org_type NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- To store type-specific conditional fields flexibly
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create the Organization Members Table
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable until invite is accepted
    email TEXT NOT NULL,
    status member_status DEFAULT 'invited'::member_status NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_org_email UNIQUE (organization_id, email) -- Prevents duplicate invites in the same org
);

-- 4. Enable Row Level Security (RLS) globally on our tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Security Policies for Organizations
-- Policy: Admins can only see organizations they personally created
CREATE POLICY "Admins can view their own organizations" 
ON organizations FOR SELECT 
USING (auth.uid() = created_by);

-- Policy: Admins can insert organizations specifying themselves as creator
CREATE POLICY "Admins can create organizations" 
ON organizations FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- 6. Define RLS Security Policies for Organization Members
-- Policy: Admins can view members belonging to an organization they manage
CREATE POLICY "Admins can view members of their organizations" 
ON organization_members FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM organizations 
        WHERE organizations.id = organization_members.organization_id 
        AND organizations.created_by = auth.uid()
    )
);

-- Policy: Security architecture forces writes via Edge Function or Admin verification
CREATE POLICY "Admins can insert member records if they own the parent organization"
ON organization_members FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = organization_members.organization_id
        AND organizations.created_by = auth.uid()
    )
);