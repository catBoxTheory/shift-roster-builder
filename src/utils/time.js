const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTimeToMinutes(time) {
  const match = TIME_PATTERN.exec(time);

  if (!match) {
    throw new Error(`Invalid time: ${time}`);
  }

  const [, hours, minutes] = match;
  return Number(hours) * 60 + Number(minutes);
}

export function calculateShiftHours({ startTime, endTime }) {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (endMinutes <= startMinutes) {
    throw new Error("End time must be after start time");
  }

  return (endMinutes - startMinutes) / 60;
}
