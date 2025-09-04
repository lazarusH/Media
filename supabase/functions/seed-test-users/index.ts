import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = "https://unhhxjrflgovwsnczynh.supabase.co";

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

    const users = [
      {
        office_name: "የኮሙኒኬሽን ጽህፈት ቤት",
        email: "የኮሙኒኬሽንጽህፈትቤት@akaki.gov.et".toLowerCase(),
        password: "admin123",
        role: "admin" as const,
      },
      {
        office_name: "የከተማ ጽህፈት ቤት",
        email: "የከተማጽህፈትቤት@akaki.gov.et".toLowerCase(),
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

    async function createOrGetUser(user: typeof users[number]) {
      const existing = await findUserByEmail(user.email);
      if (existing) return existing;

      const { data, error } = await admin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          office_name: user.office_name,
          role: user.role,
        },
      });
      if (error) throw error;
      return data.user;
    }

    const results = [] as Array<{ email: string; id: string | undefined; ok: boolean; error?: string }>;

    for (const u of users) {
      try {
        const user = await createOrGetUser(u);
        const userId = user?.id;
        if (!userId) throw new Error("No user id returned");

        const { error: upsertErr } = await admin
          .from("profiles")
          .upsert(
            {
              user_id: userId,
              office_name: u.office_name,
              role: u.role,
            },
            { onConflict: "user_id" }
          );
        if (upsertErr) throw upsertErr;

        results.push({ email: u.email, id: userId, ok: true });
      } catch (e: any) {
        console.error("Seeding user failed", u.email, e?.message || e);
        results.push({ email: u.email, id: undefined, ok: false, error: e?.message || String(e) });
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
