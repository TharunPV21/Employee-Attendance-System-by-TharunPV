const LATE_THRESHOLD_HOUR = 10;
const LATE_THRESHOLD_MINUTE = 0;

function tharunGetDateOnly(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function tharunComputeStatus(checkInTime) {
  if (!checkInTime) return 'absent';
  const checkIn = new Date(checkInTime);
  const lateAt = new Date(checkIn);
  lateAt.setHours(LATE_THRESHOLD_HOUR, LATE_THRESHOLD_MINUTE, 0, 0);
  if (checkIn > lateAt) return 'late';
  return 'present';
}

function tharunComputeTotalHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
}

module.exports = {
  tharunGetDateOnly,
  tharunComputeStatus,
  tharunComputeTotalHours,
};
