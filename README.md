# Discord Bot Webhook Forwarder

A Discord bot that monitors specific channels for messages and forwards them to configured webhooks.

## Features

- Monitors multiple Discord channels for new messages
- Forwards message content and metadata to configured webhooks
- Includes health check endpoint
- Comprehensive logging

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the environment example file and configure it:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file with your:
   - Discord bot token and client ID
   - Channel IDs to monitor
   - Webhook URLs for each channel

### Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to the "Bot" tab and create a bot
4. Under "Privileged Gateway Intents", enable:
   - Server Members Intent
   - Message Content Intent
5. Copy the bot token and add it to your `.env` file
6. Invite the bot to your server using the OAuth2 URL Generator:
   - Select "bot" scope
   - Select permissions: "Read Messages/View Channels", "Send Messages"

## Running the Bot

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## Webhook Payload Format

The webhook will receive a JSON payload with the following structure:

```json
{
  "channelId": "123456789012345678",
  "channelName": "channel-name",
  "authorId": "123456789012345678",
  "authorUsername": "username",
  "content": "Message content",
  "attachments": [],
  "timestamp": 1640995200000,
  "messageId": "123456789012345678",
  "guildId": "123456789012345678"
}
``` 