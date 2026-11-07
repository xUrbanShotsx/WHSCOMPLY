"use client";

import { MeetingsView } from "@/components/app/MeetingsView";

export default function ConsultationPage() {
  return (
    <MeetingsView
      kinds={["WHS committee", "Pre-start meeting", "Coordination meeting"]}
      title="Consultation"
      sub="WHS committee meetings, daily pre-starts and subcontractor coordination. Record who attended and what was discussed, so consultation with workers is on the record."
      addLabel="Schedule meeting"
      emptyTitle="No meetings yet."
      emptyBody="Schedule a WHS committee meeting or a pre-start and tick off who attends."
    />
  );
}
