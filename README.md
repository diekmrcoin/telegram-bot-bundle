# Bundle of Telegram Bot with AI Integration

This project is a bundle of Telegram bots designed to integrate AI functionalities, enhancing the organizational and interactive capabilities for the Diekmrcoin software studio. It leverages the power of AI to provide a more dynamic and responsive user experience.

## Project Overview

The bot is built to interact with users on Telegram, offering a range of commands and AI-powered responses. It's part of Diekmrcoin's initiative to incorporate more AI into their operations, making interactions more engaging and efficient.

## Features

- AI Integration: Utilizes the `@anthropic-ai/sdk` for advanced AI capabilities.
- Command Handling: Supports various commands, including a welcome message via the `/start` command.
- Environment Variables: Uses a `.env` file to securely manage sensitive information like bot tokens and API keys.

## Getting Started

1. Clone the repository to your local machine.
2. Navigate to the `bot/` directory.
3. Install the dependencies by running `npm install`.
4. Create a `.env` file in the `bot/` directory and add your Telegram bot token and any other required API keys or credentials.
5. Start the bot by running `npm start` from the `bot/` directory.
6. Your Telegram bot is now up and running! Interact with it by sending messages or commands on Telegram.

## Setting the webhook with Telegram api

```bash
curl https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=$FULL_URL_TO_FUNCTION&secret_token=$SECRET_TOKEN
```

## Serverless Deployment

The bot can be deployed as a serverless function on AWS Lambda. To deploy the bot, follow these steps:

1. Cd into the `bot/` directory.
2. Install the npm dependencies by running `npm install`.
3. Create a `.env` file in the `bot/` directory and add your Telegram bot token and any other required API keys or credentials.
4. Configure aws-cli with your AWS credentials: `aws configure`.
5. Run `npm run deploy` to deploy the bot to AWS Lambda.

## Env content

```env
# Add your Telegram bot token here
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_SECRET_TOKEN=YOUR_ANTHROPIC_API_KEY
# List of channels
TELEGRAM_ALLOWED_CHAT_IDS=0,1,2
# Add any other environment variables or API keys here
CLAUDE_API_KEY=YOUR_CLAUDE
```

## Telegram webhook config

`npm run set-webhook -- -t $BOT_TOKEN -D '{ "url": $FULL_URL_TO_FUNCTION }'`
Telegram [docs](https://core.telegram.org/bots/api#setwebhook)

## Contributing

We welcome contributions! If you have suggestions, bug reports, or feature requests, please open an issue or submit a pull request. See the [Contributing](bot/README.md#Contributing) section in the bot's README for more details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Authors

- Diego Maroto

---

For more information on how to use, extend, or contribute to this project, please refer to the individual README files within the project directories.
