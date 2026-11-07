"use client";

import { MeetingsView } from "@/components/app/MeetingsView";

export default function ToolboxPage() {
  return (
    <MeetingsView
      kinds={["Toolbox talk"]}
      title="Toolbox talks"
      sub="Short briefings on site. Record the topic and tick off who attended, so consultation is on the record."
      addLabel="Schedule talk"
      emptyTitle="No toolbox talks yet."
      emptyBody="Schedule one and the project's crew is added to the attendance list."
    />
  );
}
