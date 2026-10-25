import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getAnnouncementUser() {
  const supabase = createClient(await cookies());
  const { data: { user }, error } = await supabase.auth.getUser();
  return error ? null : user;
}
