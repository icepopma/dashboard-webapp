# Discord Notification Configuration

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Discord Webhook URL for agent notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Discord Channel ID for agent notifications (optional, defaults to #agent-collaboration)
DISCORD_CHANNEL_ID=1479290254086111232
```

## How to Get Discord Webhook URL

1. Go to your Discord server
2. Navigate to the channel where you want notifications (e.g., #agent-collaboration)
3. Click the gear icon (Edit Channel)
4. Go to Integrations > Webhooks
5. Click "New Webhook"
6. Give it a name (e.g., "Agent Heartbeat Bot")
7. Click "Copy Webhook URL"
8. Paste it into your `.env.local` file

## Notification Format

When an agent is marked as dead (no heartbeat for >3 minutes), the webhook will send:

```
🚨 **Agent Dead Alert**

**Session**: session-xxx
**Last Heartbeat**: 2026-03-10T03:00:00Z
**Current Feature**: feat-001
**Status**: Dead (no heartbeat for >3 minutes)

Please investigate and restart if needed.
```

## Testing

To test the notification:

```bash
curl -X POST http://localhost:3000/api/agent/heartbeat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-dead-agent",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "status": "running",
    "current_feature": "feat-test"
  }'
```

Then wait 3+ minutes and check the agent status:

```bash
curl http://localhost:3000/api/agent/heartbeat?session_id=test-dead-agent
```

If the agent is dead, you should see a Discord notification.
