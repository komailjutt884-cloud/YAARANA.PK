import { createClient } from '@supabase/supabase-js';

// Clean Supabase Connection Setup
// You can replace these variable values later when configuring your live database.
// Note: Use the base Supabase URL (without /rest/v1/) so the client can construct correct paths for both Auth and REST APIs.
const SUPABASE_URL = "https://xsafhfpjzxfvtphlxnqf.supabase.co";
const SUPABASE_PUBLIC = "sb_publishable_2np47wMlzaVc5s4F1SM9yw_z3cyNOHo";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLIC);
export const supabase = supabaseClient;
