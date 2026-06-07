import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get current calling user session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header.');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      throw new Error('Invalid admin session token.');
    }

    // 2. Parse and log the incoming body
    const body = await req.json();
    console.log('Incoming Payload Body:', body);

    const { organizationId, email } = body;
    if (!organizationId || !email) {
      throw new Error(`Missing fields. Received orgId: ${organizationId}, email: ${email}`);
    }

    // 3. Confirm Organization metadata and administrator ownership mapping
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('id, created_by')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      console.error('Organization lookup failed:', orgError);
      throw new Error(`Target organization database reference not found for ID: ${organizationId}`);
    }

    if (org.created_by !== user.id) {
      throw new Error('Access Denied: You are not the authorized creator of this tenant organization.');
    }

    // 4. Fire DB entry write transaction
    console.log(`Attempting insert into organization_members for Org: ${organizationId}, Email: ${email}`);
    
    const { data: inviteRow, error: inviteError } = await supabaseClient
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        email: email,
        status: 'invited',
        role: 'member'
      })
      .select()
      .single();

    if (inviteError) {
      console.error('PostgreSQL Database Insertion Error Detail:', inviteError);
      if (inviteError.code === '23505') {
        throw new Error('A pending invitation already exists for this email address.');
      }
      throw new Error(`Database rejected operation: ${inviteError.message}`);
    }

    console.log('Successfully wrote roster row record to database:', inviteRow);

    return new Response(JSON.stringify({ success: true, data: inviteRow }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Caught Function Execution Exception:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})