import { NextResponse } from "next/server";
import { requireAdminContextJson } from "@/lib/server/api-auth";
import { textValue } from "@/lib/server/form";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

async function audit(organizationId: string, userId: string, action: string, targetTable: string, targetId: string, metadata = {}) {
  await getSupabaseAdminClient().from("audit_log").insert({
    organization_id: organizationId,
    actor_user_id: userId,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata
  });
}

export async function POST(request: Request) {
  const { user, context, response } = await requireAdminContextJson();

  if (response || !user || !context) {
    return response ?? NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const action = textValue(formData, "action");
  const jobId = textValue(formData, "jobId");
  const stagingId = textValue(formData, "stagingId");
  const adminClient = getSupabaseAdminClient();

  try {
    if (!jobId) {
      return NextResponse.json({ error: "Falta el job de importación." }, { status: 400 });
    }

    if (action === "approve-staging" || action === "reject-staging") {
      if (!stagingId) {
        return NextResponse.json({ error: "Falta el dato a revisar." }, { status: 400 });
      }

      const status = action === "approve-staging" ? "approved" : "rejected";
      const { error } = await adminClient
        .from("transparency_import_staging")
        .update({
          status,
          review_notes: textValue(formData, "reviewNotes") || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", stagingId)
        .eq("organization_id", context.organization.id)
        .eq("job_id", jobId);

      if (error) {
        throw new Error(error.message);
      }

      await adminClient
        .from("transparency_import_diffs")
        .update({ status: status === "approved" ? "approved" : "rejected", updated_at: new Date().toISOString() })
        .eq("staging_id", stagingId)
        .eq("organization_id", context.organization.id)
        .eq("job_id", jobId);

      await audit(context.organization.id, user.id, `transparency_import_${status}`, "transparency_import_staging", stagingId, {
        jobId
      });
      return NextResponse.json({ ok: true, message: status === "approved" ? "Dato aprobado." : "Dato rechazado." });
    }

    if (action === "cancel-job") {
      const { error } = await adminClient
        .from("transparency_import_jobs")
        .update({ status: "cancelled", finished_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", jobId)
        .eq("organization_id", context.organization.id);

      if (error) {
        throw new Error(error.message);
      }

      await adminClient
        .from("system_locks")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("organization_id", context.organization.id)
        .eq("reason", "transparency_portal_import")
        .eq("status", "active");

      await audit(context.organization.id, user.id, "transparency_import_cancelled", "transparency_import_jobs", jobId, {});
      return NextResponse.json({ ok: true, message: "Importación cancelada." });
    }

    if (action === "apply-approved") {
      return NextResponse.json(
        {
          error:
            "La aplicación definitiva de cambios queda bloqueada en esta fase. Primero revisa y aprueba datos; la consolidación se implementará en la siguiente iteración."
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se ha podido revisar la importación." },
      { status: 400 }
    );
  }
}
