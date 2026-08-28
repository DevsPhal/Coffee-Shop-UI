import { redirect } from "next/navigation";

/** Legacy mobile-only URL. /menu now serves both layouts responsively. */
export default function MenuPhonePage() {
  redirect("/menu");
}
