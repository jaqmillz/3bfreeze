import { createClient } from "@/lib/supabase/server";

export interface BreachInfo {
  id: string;
  code: string;
  name: string;
  description: string;
  date: string;
  recordsAffected: string | null;
  dataExposed: string[];
  active: boolean;
}

/**
 * Look up a breach code from the database (server-side only).
 * Returns null if the code doesn't exist or is inactive.
 */
export async function getBreachByCode(
  code: string
): Promise<BreachInfo | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("breach_codes")
    .select("id, code, name, description, date, records_affected, data_exposed, active")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    description: data.description,
    date: data.date,
    recordsAffected: data.records_affected,
    dataExposed: data.data_exposed,
    active: data.active,
  };
}
