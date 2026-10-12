import { redirect } from "next/navigation";

// "/" is the landing page - kept as a redirect so old /home links still work.
export default function Page() {
  redirect("/");
}
