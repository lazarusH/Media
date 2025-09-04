import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://unhhxjrflgovwsnczynh.supabase.co";

async function officeToEmail(officeName: string): Promise<string> {
  const normalized = officeName.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(hash))
    .slice(0, 10) // 10 bytes -> 20 hex chars
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `u-${hex}@akaki.gov.et`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY secret");
      return new Response(
        JSON.stringify({ error: "Service role key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(SUPABASE_URL, serviceRoleKey);

    // Check if this is a dynamic user creation request
    const body = await req.json().catch(() => null);
    
    if (body && body.officeName) {
      // Dynamic user creation
      console.log('Creating dynamic user:', body);
      
      const email = await officeToEmail(body.officeName);
      const user = await createOrGetUser(email, body.password, body.officeName, body.role);
      const userId = user?.id;
      
      if (!userId) throw new Error("No user id returned");

      const { error: upsertErr } = await admin
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            office_name: body.officeName,
            role: body.role,
          },
          { onConflict: "user_id" }
        );
      if (upsertErr) throw upsertErr;

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { office_name: body.officeName, email, id: userId } 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default seed behavior - create preset test users
    const seeds = [
      {
        office_name: "የኮሙኒኬሽን ጽህፈት ቤት",
        password: "admin123",
        role: "admin" as const,
      },
      {
        office_name: "የከተማ ጽህፈት ቤት",
        password: "office123",
        role: "office" as const,
      },
    ];

    async function findUserByEmail(email: string) {
      let page = 1;
      const perPage = 200;
      while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
        if (error) throw error;
        const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (found) return found;
        if (data.users.length < perPage) return null; // no more pages
        page += 1;
      }
    }

    async function createOrGetUser(email: string, password: string, office_name: string, role: "admin" | "office") {
      const existing = await findUserByEmail(email);
      if (existing) return existing;

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { office_name, role },
      });
      if (error) throw error;
      return data.user;
    }

    const results: Array<{ office_name: string; email: string; id?: string; ok: boolean; error?: string }> = [];

    for (const s of seeds) {
      try {
        const email = await officeToEmail(s.office_name);
        const user = await createOrGetUser(email, s.password, s.office_name, s.role);
        const userId = user?.id;
        if (!userId) throw new Error("No user id returned");

        const { error: upsertErr } = await admin
          .from("profiles")
          .upsert(
            {
              user_id: userId,
              office_name: s.office_name,
              role: s.role,
            },
            { onConflict: "user_id" }
          );
        if (upsertErr) throw upsertErr;

        results.push({ office_name: s.office_name, email, id: userId, ok: true });
      } catch (e: any) {
        console.error("Seeding user failed", s.office_name, e?.message || e);
        const email = await officeToEmail(s.office_name).catch(() => "");
        results.push({ office_name: s.office_name, email, ok: false, error: e?.message || String(e) });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("seed-test-users error:", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
