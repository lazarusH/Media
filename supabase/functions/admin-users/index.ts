import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AdminUsersRequest = {
  action: "update_profile" | "change_password" | "delete_user";
  targetUserId: string;
  officeName?: string;
  newPassword?: string;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Connection": "keep-alive",
      ...corsHeaders,
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  let payload: AdminUsersRequest | null = null;
  try {
    payload = (await req.json()) as AdminUsersRequest;
  } catch (_e) {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  if (!payload || !payload.action || !payload.targetUserId) {
    return jsonResponse(400, { error: "Missing required fields" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") ?? "",
      },
    },
  });

  // Authenticate caller
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  // Ensure caller is admin
  const { data: role, error: roleError } = await supabase.rpc("get_user_role", {
    user_uuid: user.id,
  });
  if (roleError || role !== "admin") {
    return jsonResponse(403, { error: "Forbidden" });
  }

  // Use service role client for privileged operations
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRoleKey) {
    return jsonResponse(500, { error: "Missing service role key" });
  }
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    switch (payload.action) {
      case "update_profile": {
        if (!payload.officeName) {
          return jsonResponse(400, { error: "officeName is required" });
        }
        // Update profile name
        const { error: updateError } = await adminClient
          .from("profiles")
          .update({ office_name: payload.officeName })
          .eq("user_id", payload.targetUserId);
        if (updateError) throw updateError;

        // Update auth email to match deterministic scheme used on sign-in
        const normalized = payload.officeName.trim().toLowerCase();
        const enc = new TextEncoder();
        const buf = await crypto.subtle.digest("SHA-256", enc.encode(normalized));
        const hex = Array.from(new Uint8Array(buf))
          .slice(0, 10)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        const email = `u-${hex}@akaki.gov.et`;

        const { error: emailErr } = await adminClient.auth.admin.updateUserById(
          payload.targetUserId,
          { email, email_confirm: true }
        );
        if (emailErr) throw emailErr;
        return jsonResponse(200, { success: true });
      }
      case "change_password": {
        if (!payload.newPassword || payload.newPassword.length < 6) {
          return jsonResponse(400, { error: "newPassword must be at least 6 chars" });
        }
        const { error: pwError } = await adminClient.auth.admin.updateUserById(
          payload.targetUserId,
          { password: payload.newPassword }
        );
        if (pwError) throw pwError;
        return jsonResponse(200, { success: true });
      }
      case "delete_user": {
        // Delete dependent data first if needed
        const { error: delReqErr } = await adminClient
          .from("media_requests")
          .delete()
          .eq("user_id", payload.targetUserId);
        if (delReqErr) throw delReqErr;

        const { error: delProfErr } = await adminClient
          .from("profiles")
          .delete()
          .eq("user_id", payload.targetUserId);
        if (delProfErr) throw delProfErr;

        const { error: delAuthErr } = await adminClient.auth.admin.deleteUser(
          payload.targetUserId
        );
        if (delAuthErr) throw delAuthErr;

        return jsonResponse(200, { success: true });
      }
    }
  } catch (e) {
    return jsonResponse(500, { error: String(e) });
  }

  return jsonResponse(400, { error: "Unsupported action" });
});


