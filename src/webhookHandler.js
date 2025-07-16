const winston = require('winston');

// Reuse the logger from the main file or create a new one
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'webhook.log' })
  ],
});

/**
 * Sends a message to a webhook URL using native fetch
 * @param {string} webhookUrl - The URL of the webhook
 * @param {Object} payload - The data to send to the webhook
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<void>}
 */
async function sendToWebhook(webhookUrl, payload, retries = 3) {
  try {
    logger.info(`======== WEBHOOK REQUEST START ========`);
    logger.info(`URL: ${webhookUrl}`);
    logger.info(`Payload: ${JSON.stringify(payload, null, 2)}`);
    
    // Setup fetch options
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    };
    
    logger.info(`Request Headers: ${JSON.stringify(options.headers, null, 2)}`);
    logger.info(`Request Body: ${options.body}`);
    
    // Make the request with fetch
    const response = await fetch(webhookUrl, options);
    const responseText = await response.text();
    
    logger.info(`======== WEBHOOK RESPONSE START ========`);
    logger.info(`Status: ${response.status} ${response.statusText}`);
    logger.info(`Response Headers:`);
    response.headers.forEach((value, name) => {
      logger.info(`  ${name}: ${value}`);
    });
    
    try {
      // Try to parse as JSON
      const responseData = JSON.parse(responseText);
      logger.info(`Response Body (JSON): ${JSON.stringify(responseData, null, 2)}`);
    } catch (e) {
      // Log as text if not JSON
      logger.info(`Response Body (Text): ${responseText}`);
    }
    logger.info(`======== WEBHOOK RESPONSE END ========`);

    if (response.ok) {
      logger.info(`Webhook sent successfully. Status: ${response.status}`);
      return response;
    } else {
      // Log error information
      logger.error(`Webhook error: HTTP Status ${response.status} ${response.statusText}`);
      
      if (retries > 0) {
        logger.info(`Retrying webhook. Attempts remaining: ${retries - 1}`);
        // Wait for 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return sendToWebhook(webhookUrl, payload, retries - 1);
      } else {
        logger.error('Maximum webhook retry attempts reached. Giving up.');
        throw new Error(`Webhook failed with status ${response.status}`);
      }
    }
  } catch (error) {
    // Log detailed error information
    logger.error(`======== WEBHOOK ERROR ========`);
    logger.error(`Error Type: ${error.name}`);
    logger.error(`Error Message: ${error.message}`);
    logger.error(`Error Stack: ${error.stack}`);
    
    // Retry logic
    if (retries > 0) {
      logger.info(`Retrying webhook. Attempts remaining: ${retries - 1}`);
      // Wait for 2 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return sendToWebhook(webhookUrl, payload, retries - 1);
    } else {
      logger.error('Maximum webhook retry attempts reached. Giving up.');
      throw error;
    }
  }
}

/**
 * Formats a Discord message for webhook delivery
 * @param {Object} message - Discord.js message object
 * @returns {Object} - Formatted payload
 */
function formatMessageForWebhook(message) {
  // Vereenvoudigde payload met alleen de meest essentiële velden
  const payload = {
    text: message.content,
    sessionId: message.author.id,
    channel: {
      id: message.channelId,
      name: message.channel?.name || 'unknown'
    },
    author: {
      id: message.author.id,
      username: message.author.username
    },
    timestamp: message.createdTimestamp,
    id: message.id
  };
  
  // Handle attachments if present
  if (message.attachments && message.attachments.size > 0) {
    payload.attachments = [];
    
    message.attachments.forEach(attachment => {
      payload.attachments.push({
        id: attachment.id,
        url: attachment.url,
        filename: attachment.name,
        contentType: attachment.contentType,
        size: attachment.size,
        proxyURL: attachment.proxyURL,
        width: attachment.width,
        height: attachment.height
      });
    });
    
    logger.info(`Message has ${payload.attachments.length} attachments`);
  }
  
  logger.info(`Formatted message: ${JSON.stringify(payload, null, 2)}`);
  return payload;
}

module.exports = {
  sendToWebhook,
  formatMessageForWebhook,
}; 
