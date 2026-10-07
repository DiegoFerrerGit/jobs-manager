import TrackerClient from "./TrackerClient";
import { getTrackerData } from "./actions";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TrackerPage() {
  const user = await getCurrentUser();
  if (!user?.sub) {
    redirect("/login");
  }

  const data = await getTrackerData();

  return <TrackerClient
      initialData={data}
      currentUser={{ name: (user as any).name || (user as any).email || "Usuario", picture: (user as any).picture }}
    />;
}
