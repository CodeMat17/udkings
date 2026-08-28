import { cronJobs } from "convex/server";
import { internal } from "./_generated/api.js";

/**
 * Scheduled housekeeping.
 *
 * Just the one job: collecting photographs that were uploaded and then never
 * attached to anything, because the admin closed the tab mid-form. See
 * `admin:sweepOrphanedUploads` for why this cannot be done in the browser.
 *
 * Daily, at a quiet hour for Lagos (02:10 UTC is 03:10 WAT).
 */
const crons = cronJobs();

crons.daily(
  "sweep orphaned uploads",
  { hourUTC: 2, minuteUTC: 10 },
  internal.admin.sweepOrphanedUploads,
);

export default crons;
