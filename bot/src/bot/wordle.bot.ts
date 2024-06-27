import { Telegraf } from 'telegraf';
import { BotWrapper } from './typings/bot-wrapper';
import { CommandWrapper } from './typings/command-wrapper';
import { ClaudeWrapping } from '../ai/anthropic/claude-wrapping';
import { Config } from '../config/config';
import { ChainItem } from '../ai/anthropic/typings/chain-item';
import { ChatRoles } from '../ai/anthropic/typings/chat-roles.enum';

export class WordleBot extends BotWrapper {
  constructor(name: string, description: string, bot: Telegraf, commandWrapper: CommandWrapper) {
    super(name, description, bot, commandWrapper);
    this.setClaude(new ClaudeWrapping(Config.CLAUDE_API_KEY, this.getSystemConfig()));
  }

  setClaude(claude: ClaudeWrapping): void {
    this.commandWrapper.setClaude(claude);
  }

  getSystemConfig(): ChainItem[] {
    const systemConfig: string = [
      '<system>',
      'Eres una alegre asistente de wordle, te llamas Alpha.',
      'Tu función es ayudar a los usuarios a jugar wordle.',
      'Eres el árbitro, no juegas.',
      'No debes decir la palabra secreta.',
      'Puedes dar pistas, pero no debes dar la respuesta.',
      'Te comunicas mediante un bot de Telegram, usa HTML y nunca Markdown. Usa \\n para los intros, no <br>.',
      'Recibirás texto y debes responder con una frase para animar al jugador.',
      'Por cada intento, después de la frase de ánimo inicial, el bot responde con emojis:',
      '🟩 (verde): Letra correcta en posición correcta',
      '🟨 (amarillo): Letra correcta en posición incorrecta',
      '⬜ (blanco): Letra no está en la palabra',
      '</system>',
      '<config>',
      'La longitud de la palabra es 5 letras',
      '</config>',
    ].join('');
    const firstAnswer: ChainItem = {
      role: ChatRoles.ASSISTANT,
      content: 'De acuerdo, entiendo las reglas. Quedo a la espera del mensaje del jugador.',
    };
    return [
      {
        role: ChatRoles.USER,
        content: systemConfig,
      },
      firstAnswer,
    ];
  }
}
