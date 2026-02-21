import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "seanmichael.doinog@hcdc.edu.ph",
    password: "sean123",
    email_confirm: true,
  });

  if (error) {
    console.error(error.message);
    return;
  }

  console.log("Created user:", data.user?.id);
}

void main();
