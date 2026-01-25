import { NextResponse } from 'next/server';

type CronResponse = {
  ok: true;
  timestamp: string;
} | {
  ok: false;
  error: string;
};

const ERROR_MESSAGES = {
  missingWebhook: 'Missing SLACK_CRON_WEBHOOK_URL environment variable.',
  missingSecret: 'Missing or invalid cron secret.',
  slackFailure: 'Failed to post Slack heartbeat.',
} as const;

function validateSecret(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authorizationHeader = request.headers.get('authorization');
  return authorizationHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!validateSecret(request)) {
    const body: CronResponse = { ok: false, error: ERROR_MESSAGES.missingSecret };
    return NextResponse.json(body, { status: 401 });
  }

  const webhookUrl = process.env.SLACK_CRON_WEBHOOK_URL;
  if (!webhookUrl) {
    const body: CronResponse = { ok: false, error: ERROR_MESSAGES.missingWebhook };
    return NextResponse.json(body, { status: 500 });
  }

  const timestamp = new Date().toISOString();
  const payload = {
    text: `[supervision-fe-2] Vercel cron heartbeat at ${timestamp}`,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Slack webhook failed', response.status, errorText);
      const body: CronResponse = { ok: false, error: ERROR_MESSAGES.slackFailure };
      return NextResponse.json(body, { status: 502 });
    }

    const body: CronResponse = { ok: true, timestamp };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error('Slack webhook failed', error);
    const body: CronResponse = { ok: false, error: ERROR_MESSAGES.slackFailure };
    return NextResponse.json(body, { status: 502 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
