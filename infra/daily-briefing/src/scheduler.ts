import { SQSClient, SendMessageBatchCommand, type SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface DailyBriefingPreference {
  enabled: boolean;
  time: string; // HH:MM
  timezone: string;
  lastSentDate?: string;
}

interface UserWithBriefing {
  id: string;
  email: string;
  preferences: {
    daily_briefing?: DailyBriefingPreference;
  };
}

interface BriefingQueueMessage {
  userId: string;
  email: string;
  timezone: string;
  scheduledTime: string;
  date: string;
}

const sqs = new SQSClient({});
const QUEUE_URL = process.env.QUEUE_URL!;

function getSupabase(): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Check if a user's briefing time falls within the time window
 */
function isTimeWithinWindow(
  userTime: string,
  userTimezone: string,
  windowStart: Date,
  windowEnd: Date,
): boolean {
  try {
    // Get today's date in the user's timezone
    const now = new Date();
    const userDateStr = now.toLocaleDateString('en-CA', { timeZone: userTimezone });

    // Parse user's preferred time
    const [hours, minutes] = userTime.split(':').map(Number);

    // Create a date object for the user's briefing time today in their timezone
    const userBriefingStr = `${userDateStr}T${userTime}:00`;

    // Convert to UTC by creating date in user's timezone perspective
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Get timezone offset
    const parts = formatter.formatToParts(now);
    const partsMap: Record<string, string> = {};
    parts.forEach(p => { partsMap[p.type] = p.value; });

    // Create the briefing time in UTC
    const userBriefingLocal = new Date(
      parseInt(partsMap.year),
      parseInt(partsMap.month) - 1,
      parseInt(partsMap.day),
      hours,
      minutes,
      0,
    );

    // Get the offset between user's timezone and UTC
    const utcNow = new Date(now.toISOString());
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
    const offset = localNow.getTime() - utcNow.getTime();

    // Convert user's local briefing time to UTC
    const userBriefingUTC = new Date(userBriefingLocal.getTime() - offset);

    // Check if the briefing time falls within the window
    return userBriefingUTC >= windowStart && userBriefingUTC < windowEnd;
  } catch (error) {
    console.error(`Error checking time for timezone ${userTimezone}:`, error);
    return false;
  }
}

/**
 * Get today's date in YYYY-MM-DD format for a given timezone
 */
function getTodayInTimezone(timezone: string): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone });
}

/**
 * Query users whose briefing time is due
 */
async function queryUsersForBriefing(
  supabase: SupabaseClient,
  windowStart: Date,
  windowEnd: Date,
): Promise<BriefingQueueMessage[]> {
  // Query all users with daily_briefing enabled
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, preferences')
    .not('preferences->daily_briefing', 'is', null);

  if (error) {
    console.error('Error querying users:', error);
    throw error;
  }

  if (!users || users.length === 0) {
    console.log('No users with daily briefing preferences found');
    return [];
  }

  const eligibleUsers: BriefingQueueMessage[] = [];

  for (const user of users as UserWithBriefing[]) {
    const pref = user.preferences?.daily_briefing;

    // Skip if not enabled or missing required fields
    if (!pref?.enabled || !pref.time || !pref.timezone) {
      continue;
    }

    // Get today's date in user's timezone
    const todayInUserTz = getTodayInTimezone(pref.timezone);

    // Skip if already sent today
    if (pref.lastSentDate === todayInUserTz) {
      continue;
    }

    // Check if briefing time is within our window
    if (isTimeWithinWindow(pref.time, pref.timezone, windowStart, windowEnd)) {
      eligibleUsers.push({
        userId: user.id,
        email: user.email,
        timezone: pref.timezone,
        scheduledTime: new Date().toISOString(),
        date: todayInUserTz,
      });
    }
  }

  return eligibleUsers;
}

/**
 * Send messages to SQS in batches
 */
async function sendToSQS(messages: BriefingQueueMessage[]): Promise<void> {
  const batchSize = 10;

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);

    const entries: SendMessageBatchRequestEntry[] = batch.map((msg, index) => ({
      Id: `${i + index}`,
      MessageBody: JSON.stringify(msg),
      MessageGroupId: msg.userId,
      MessageDeduplicationId: `${msg.userId}-${msg.date}`,
    }));

    const command = new SendMessageBatchCommand({
      QueueUrl: QUEUE_URL,
      Entries: entries,
    });

    try {
      const result = await sqs.send(command);

      if (result.Failed && result.Failed.length > 0) {
        console.error('Failed to send some messages:', result.Failed);
      }

      console.log(`Sent batch of ${batch.length} messages to SQS`);
    } catch (error) {
      console.error('Error sending batch to SQS:', error);
      throw error;
    }
  }
}

/**
 * Lambda handler - triggered every 5 minutes by EventBridge
 */
export async function handler(): Promise<void> {
  console.log('Daily briefing scheduler started');

  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  console.log(`Checking for users with briefing time between ${fiveMinutesAgo.toISOString()} and ${now.toISOString()}`);

  const supabase = getSupabase();

  try {
    // Query users whose briefing time is due
    const eligibleUsers = await queryUsersForBriefing(supabase, fiveMinutesAgo, now);

    if (eligibleUsers.length === 0) {
      console.log('No users due for briefing at this time');
      return;
    }

    console.log(`Found ${eligibleUsers.length} users due for briefing`);

    // Send messages to SQS
    await sendToSQS(eligibleUsers);

    console.log('Scheduler completed successfully');
  } catch (error) {
    console.error('Scheduler failed:', error);
    throw error;
  }
}
