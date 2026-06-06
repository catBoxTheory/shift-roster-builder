export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function dayLabel(day) {
  return DAY_LABELS[day] ?? "Day";
}
