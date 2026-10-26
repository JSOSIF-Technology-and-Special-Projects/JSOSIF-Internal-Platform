import "server-only";
import { supabaseDb } from "@/utils/supabaseDb";
import { getAnnouncementUser } from "./getAnnouncementUser";

export async function getAnnouncementAuthor() {
  const user = await getAnnouncementUser();
  if (!user) throw new Error("Please sign in again before posting.");

  const { data: member, error } = await supabaseDb
    .from("members")
    .select("name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Unable to look up your name. Please try again.");

  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  const name = member?.name?.trim() || (typeof metadataName === "string" ? metadataName.trim() : "");
  if (!name) throw new Error("Your account needs a name before posting. Please update your member record.");
  return { id: user.id, name: name.slice(0, 255) };
}
