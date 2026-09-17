const { Telegraf, Markup, session } = require('telegraf');

// ============================================================
// INICIALIZAÇÃO DOS BOTS
// ============================================================
const bot = new Telegraf(process.env.BOT_TOKEN);
const adminBot = new Telegraf(process.env.ADMIN_BOT_TOKEN);
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Sessão em memória (simples, funciona para começar)
bot.use(session());

// ============================================================
// CONFIGURAÇÃO DOS PACOTES VIP
// Substitua os "link" pelos seus links de checkout reais
// ============================================================
const PACOTES = {
  semanal: {
    nome: 'VIP Semanal',
    preco: 'R$34,90 / semana',
    link: 'https://whop.com/checkout/plan_TbOzc9NaBjJZJ' // 👈 COLOQUE SEU LINK AQUI
  },
  mensal: {
    nome: 'VIP Mensal',
    preco: 'R$97,00 / mês',
    link: 'https://whop.com/checkout/plan_Gphp0LZML7qph' // 👈 COLOQUE SEU LINK AQUI
  },
  trimestral: {
    nome: 'VIP Trimestral (3 Meses)',
    preco: 'R$247,00 / 3 meses',
    link: 'https://whop.com/checkout/plan_zZx8KgPMb3ZDW' // 👈 COLOQUE SEU LINK AQUI
  }
};

// ============================================================
// 1. COMANDO /start - BOAS-VINDAS + AQUECIMENTO
// ============================================================
bot.start(async (ctx) => {
  ctx.session = {};
  const nomeUsuario = ctx.from.first_name || 'Campeão';

  await ctx.reply(
    `👋 Bem-vindo ao *PALPITE10 VIP*, ${nomeUsuario}!\n\n` +
    `Você está cansado de perder dinheiro com apostas arriscadas? 🛑\n\n` +
    `Nossa equipe de analistas fornece *palpites de futebol de alta precisão* diariamente. ` +
    `Não é chute — analisamos estatísticas, lesões e forma das equipes para te dar a melhor vantagem.`,
    { parse_mode: 'Markdown', ...Markup.removeKeyboard() }
  );

  setTimeout(async () => {
    try {
      await ctx.reply(
        `📊 *Por que se juntar a nós?*\n\n` +
        `✅ Mais de 80% de taxa de acerto no mês passado\n` +
        `✅ Bilhetes VIP diários (Over/Under, BTTS, Placar Exato)\n` +
        `✅ Suporte 24/7 no Telegram\n` +
        `✅ Análises pré-jogo completas\n\n` +
        `Vamos criar seu perfil para enviar os palpites certos pra você.`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('📝 Criar Perfil', 'criar_perfil')]
          ])
        }
      );
    } catch (err) {
      console.error('Erro no aquecimento:', err);
    }
  }, 2000);
});

// ============================================================
// 2. CRIAÇÃO DE PERFIL
// ============================================================
bot.action('criar_perfil', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.passo = 'aguardando_nome';
  await ctx.editMessageText(
    `Ótimo! Vamos te configurar em 2 passos rápidos. 🚀\n\n` +
    `*Passo 1:* Qual é o seu nome (ou apelido)?`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================================
// 3. MÁQUINA DE ESTADOS (nome → experiência → pacotes)
// ============================================================
bot.on('text', async (ctx) => {
  const texto = ctx.message.text;
  const passo = ctx.session?.passo;

  // Passo 1: Nome
  if (passo === 'aguardando_nome') {
    ctx.session.nome = texto;
    ctx.session.passo = 'aguardando_experiencia';

    return ctx.reply(
      `Prazer em te conhecer, *${texto}*! 👋\n\n` +
      `*Passo 2:* Como você descreveria sua experiência com apostas?`,
      {
        parse_mode: 'Markdown',
        ...Markup.keyboard([['Iniciante', 'Intermediário', 'Profissional']])
          .oneTime()
          .resize()
      }
    );
  }

  // Passo 2: Experiência
  if (passo === 'aguardando_experiencia') {
    ctx.session.experiencia = texto;
    ctx.session.passo = null;

    await ctx.reply(
      `✅ *Perfil Completo!*\n\n` +
      `👤 Nome: ${ctx.session.nome}\n` +
      `⭐ Nível: ${ctx.session.experiencia}\n\n` +
      `Com base no seu perfil, recomendo começar com nossos *Pacotes VIP*:`,
      { parse_mode: 'Markdown', ...Markup.removeKeyboard() }
    );

    return enviarPacotes(ctx);
  }
});

// ============================================================
// 4. ENVIO DOS PACOTES
// ============================================================
async function enviarPacotes(ctx) {
  const texto =
    `🔥 *PACOTES PALPITE10 VIP* 🔥\n\n` +
    `Escolha o plano ideal para seus objetivos:\n\n` +
    `📅 *Semanal* — R$34,90 (ideal para testar)\n` +
    `📆 *Mensal* — R$97,00 (mais popular)\n` +
    `🗓️ *Trimestral* — R$247,00 (melhor custo-benefício)`;

  const teclado = Markup.inlineKeyboard([
    [Markup.button.callback('📅 VIP Semanal — R$34,90', 'comprar_semanal')],
    [Markup.button.callback('📆 VIP Mensal — R$97,00', 'comprar_mensal')],
    [Markup.button.callback('🗓️ VIP Trimestral — R$247,00', 'comprar_trimestral')]
  ]);

  await ctx.reply(texto, { parse_mode: 'Markdown', ...teclado });
}

// ============================================================
// 5. BOTÕES DE COMPRA
// ============================================================
bot.action('comprar_semanal', (ctx) => enviarCheckout(ctx, PACOTES.semanal, 'semanal'));
bot.action('comprar_mensal', (ctx) => enviarCheckout(ctx, PACOTES.mensal, 'mensal'));
bot.action('comprar_trimestral', (ctx) => enviarCheckout(ctx, PACOTES.trimestral, 'trimestral'));

async function enviarCheckout(ctx, pacote, chave) {
  await ctx.answerCbQuery();
  ctx.session.pacoteEscolhido = chave;

  await ctx.reply(
    `🛒 *Você selecionou:* ${pacote.nome}\n` +
    `💰 *Preço:* ${pacote.preco}\n\n` +
    `Clique no botão abaixo para completar o pagamento seguro.\n\n` +
    `⚠️ Após pagar, clique em *"Já Paguei"* para liberarmos seu acesso.`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('💳 Pagar Agora', pacote.link)],
        [Markup.button.callback('✅ Já Paguei', 'confirmar_pagamento')]
      ])
    }
  );
}

// ============================================================
// 6. CONFIRMAÇÃO DE PAGAMENTO → ENVIA PARA O ADMIN BOT
// ============================================================
bot.action('confirmar_pagamento', async (ctx) => {
  await ctx.answerCbQuery();

  const user = ctx.from;
  const pacote = PACOTES[ctx.session?.pacoteEscolhido];

  if (!pacote) {
    return ctx.reply(
      '❌ Ocorreu um erro. Por favor, reinicie com /start.'
    );
  }

  const dataHora = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });

  const mensagemAdmin =
    `🔔 *NOVA VENDA CONFIRMADA!* 🔔\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `👤 *Nome informado:* ${ctx.session.nome || 'Não informado'}\n` +
    `📛 *Nome Telegram:* ${user.first_name || ''} ${user.last_name || ''}\n` +
    `🔗 *Username:* ${user.username ? '@' + user.username : 'Sem username'}\n` +
    `🆔 *Chat ID:* \`${user.id}\`\n` +
    `🌎 *Idioma:* ${user.language_code || 'N/A'}\n` +
    `⭐ *Premium:* ${user.is_premium ? 'Sim' : 'Não'}\n\n` +
    `📦 *Pacote:* ${pacote.nome}\n` +
    `💰 *Preço:* ${pacote.preco}\n` +
    `⭐ *Nível:* ${ctx.session.experiencia || 'Não informado'}\n\n` +
    `📅 *Data:* ${dataHora}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⚠️ _Verifique o pagamento e libere o acesso manualmente._`;

  try {
    await adminBot.telegram.sendMessage(ADMIN_CHAT_ID, mensagemAdmin, {
      parse_mode: 'Markdown'
    });

    await ctx.reply(
      `✅ *Pagamento em análise!*\n\n` +
      `Recebemos sua confirmação, ${ctx.session.nome || ''}!\n\n` +
      `Nossa equipe vai verificar o pagamento e liberar seu acesso VIP em poucos minutos.\n\n` +
      `Obrigado pela confiança! ⚽🔥`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('Erro ao enviar para o admin:', err);
    await ctx.reply(
      '❌ Erro ao processar. Por favor, tente novamente em instantes.'
    );
  }
});

// ============================================================
// 7. COMANDO /help
// ============================================================
bot.help((ctx) => {
  ctx.reply(
    `📖 *Central de Ajuda PALPITE10 VIP*\n\n` +
    `• /start — Iniciar e criar perfil\n` +
    `• /help — Ver esta mensagem\n` +
    `• /pacotes — Ver pacotes VIP disponíveis\n\n` +
    `📩 Suporte: entre em contato pelo nosso canal oficial.`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================================
// 8. COMANDO /pacotes (atalho direto)
// ============================================================
bot.command('pacotes', (ctx) => enviarPacotes(ctx));

// ============================================================
// 9. HANDLER DE ERROS GLOBAL
// ============================================================
bot.catch((err, ctx) => {
  console.error(`Erro no update ${ctx.updateType}:`, err);
});

// ============================================================
// 10. EXPORT PARA VERCEL (WEBHOOK)
// ============================================================
module.exports = async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.status(200).send('Erro');
  }
};
