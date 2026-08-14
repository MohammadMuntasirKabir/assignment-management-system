export type AssignmentStatus = "Draft" | "Published";

const STATUS_LABELS: Record<string, string> = {
  "0": "Draft",
  "1": "Published",
  Draft: "Draft",
  Published: "Published",
};

export function assignmentStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

export function assignmentStampClass(status: string): string {
  return assignmentStatusLabel(status) === "Published" ? "stamp stamp-blue" : "stamp stamp-gray";
}
