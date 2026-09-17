const { Telegraf, Markup, session } = require('telegraf');

// ============================================================
// CONFIG
// ============================================================

const bot = new Telegraf(process.env.BOT_TOKEN);
const adminBot = new Telegraf(process.env.ADMIN_BOT_TOKEN);

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

bot.use(session());

// ============================================================
// PLANOS
// ============================================================

const PACOTES = {
  semanal: {
    id: 'semanal',
    nome: 'VIP Semanal',
    preco: 'R$34,90',
    periodo: 'por semana',
    descricao: 'Acesso por 7 dias',
    link: 'https://whop.com/checkout/plan_TbOzc9NaBjJZJ'
  },

  mensal: {
    id: 'mensal',
    nome: 'VIP Mensal',
    preco: 'R$97,00',
    periodo: 'por mês',
    descricao: 'Acesso por 30 dias',
    link: 'https://whop.com/checkout/plan_Gphp0LZML7qph'
  },

  trimestral: {
    id: 'trimestral',
    nome: 'VIP Trimestral',
    preco: 'R$247,00',
    periodo: '3 meses',
    descricao: 'Acesso por 90 dias',
    link: 'https://whop.com/checkout/plan_zZx8KgPMb3ZDW'
  }
};

// ============================================================
// HELPERS
// ============================================================

function nomeUsuario(ctx) {
  return ctx.from?.first_name || 'amigo';
}

function menuPrincipal() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('⚽ Como funciona', 'como_funciona')
    ],
    [
      Markup.button.callback('🔥 Ver planos VIP', 'ver_planos')
    ],
    [
      Markup.button.callback('❓ Dúvidas', 'duvidas')
    ],
    [
      Markup.button.callback('💬 Falar com suporte', 'suporte')
    ]
  ]);
}

function botaoVoltar() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('⬅️ Voltar ao menu', 'menu')
    ]
  ]);
}

function botaoPlanos() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🔥 Ver planos VIP', 'ver_planos')
    ],
    [
      Markup.button.callback('⬅️ Voltar', 'menu')
    ]
  ]);
}

async function editarMensagem(ctx, texto, teclado = null) {
  try {
    if (teclado) {
      return await ctx.editMessageText(texto, {
        parse_mode: 'Markdown',
        ...teclado
      });
    }

    return await ctx.editMessageText(texto, {
      parse_mode: 'Markdown'
    });

  } catch (error) {

    // Caso a mensagem não possa ser editada,
    // envia uma nova.
    if (
      error.description?.includes('message is not modified') ||
      error.description?.includes('message to edit')
    ) {
      return;
    }

    console.error('Erro ao editar mensagem:', error);

    return ctx.reply(texto, {
      parse_mode: 'Markdown',
      ...(teclado || {})
    });
  }
}

// ============================================================
// /START
// ============================================================

bot.start(async (ctx) => {

  // Limpa sessão
  ctx.session = {};

  const nome = nomeUsuario(ctx);

  const mensagem =
`⚽ *PALPITE10 VIP*

Olá, *${nome}*! 👋

Bem-vindo ao PALPITE10.

Aqui você encontra análises e insights de futebol preparados pela nossa equipe.

📊 Análises pré-jogo
⚽ Mercados de futebol
📅 Conteúdo diário
💬 Suporte pelo Telegram

Tudo de forma simples e direto no seu Telegram.

👇 *O que você gostaria de fazer?*`;

  await ctx.reply(
    mensagem,
    {
      parse_mode: 'Markdown',
      ...menuPrincipal()
    }
  );
});

// ============================================================
// MENU
// ============================================================

bot.action('menu', async (ctx) => {

  await ctx.answerCbQuery();

  const nome = nomeUsuario(ctx);

  await editarMensagem(
    ctx,

`⚽ *PALPITE10 VIP*

Olá, *${nome}*! 👋

O que você gostaria de fazer?

Escolha uma opção abaixo 👇`,

    menuPrincipal()
  );
});

// ============================================================
// COMO FUNCIONA
// ============================================================

bot.action('como_funciona', async (ctx) => {

  await ctx.answerCbQuery();

  await editarMensagem(
    ctx,

`⚽ *COMO FUNCIONA?*

É simples:

*1️⃣ Escolha um plano*

Selecione o período de acesso que deseja.

*2️⃣ Faça o pagamento*

Você será direcionado para um checkout seguro.

*3️⃣ Envie a confirmação*

Depois do pagamento, volte para o Telegram e clique em *"Já fiz o pagamento"*.

*4️⃣ Acesso VIP*

Após a confirmação do pagamento, nossa equipe verifica a compra e libera seu acesso.

👇 Escolha uma opção:`,

    Markup.inlineKeyboard([
      [
        Markup.button.callback('🔥 Ver planos', 'ver_planos')
      ],
      [
        Markup.button.callback('⬅️ Voltar', 'menu')
      ]
    ])
  );
});

// ============================================================
// PLANOS
// ============================================================

bot.action('ver_planos', async (ctx) => {

  await ctx.answerCbQuery();

  await enviarPlanos(ctx);
});

bot.command('pacotes', async (ctx) => {

  await enviarPlanos(ctx);
});

async function enviarPlanos(ctx) {

  const mensagem =
`🔥 *PLANOS PALPITE10 VIP*

Escolha o período de acesso:

📅 *VIP Semanal*
R$34,90 / semana
└ Acesso por 7 dias

📆 *VIP Mensal*
R$97,00 / mês
└ Acesso por 30 dias

🗓️ *VIP Trimestral*
R$247,00 / 3 meses
└ Acesso por 90 dias

👇 *Selecione seu plano:*`;

  const teclado = Markup.inlineKeyboard([

    [
      Markup.button.callback(
        '📅 Semanal — R$34,90',
        'plano_semanal'
      )
    ],

    [
      Markup.button.callback(
        '📆 Mensal — R$97,00',
        'plano_mensal'
      )
    ],

    [
      Markup.button.callback(
        '🗓️ Trimestral — R$247,00',
        'plano_trimestral'
      )
    ],

    [
      Markup.button.callback(
        '⬅️ Voltar',
        'menu'
      )
    ]

  ]);

  if (ctx.callbackQuery) {

    return editarMensagem(
      ctx,
      mensagem,
      teclado
    );

  }

  return ctx.reply(
    mensagem,
    {
      parse_mode: 'Markdown',
      ...teclado
    }
  );
}

// ============================================================
// DETALHES DOS PLANOS
// ============================================================

bot.action('plano_semanal', async (ctx) => {

  await ctx.answerCbQuery();

  await mostrarPlano(ctx, PACOTES.semanal);
});

bot.action('plano_mensal', async (ctx) => {

  await ctx.answerCbQuery();

  await mostrarPlano(ctx, PACOTES.mensal);
});

bot.action('plano_trimestral', async (ctx) => {

  await ctx.answerCbQuery();

  await mostrarPlano(ctx, PACOTES.trimestral);
});

async function mostrarPlano(ctx, pacote) {

  ctx.session.pacoteEscolhido = pacote.id;

  let destaque = '';

  if (pacote.id === 'mensal') {
    destaque = '\n⭐ *Opção escolhida por muitos membros*';
  }

  if (pacote.id === 'trimestral') {
    destaque = '\n💰 *Maior período de acesso*';
  }

  const mensagem =
`🔥 *${pacote.nome}*

💰 *${pacote.preco} ${pacote.periodo}*

${pacote.descricao}
${destaque}

Você terá acesso ao conteúdo VIP durante o período contratado.

👇 *Deseja continuar?*`;

  const teclado = Markup.inlineKeyboard([

    [
      Markup.button.url(
        '💳 PAGAR AGORA',
        pacote.link
      )
    ],

    [
      Markup.button.callback(
        '✅ Já fiz o pagamento',
        'confirmar_pagamento'
      )
    ],

    [
      Markup.button.callback(
        '❓ Tenho dúvidas',
        'duvidas_pagamento'
      )
    ],

    [
      Markup.button.callback(
        '⬅️ Voltar aos planos',
        'ver_planos'
      )
    ]

  ]);

  await editarMensagem(
    ctx,
    mensagem,
    teclado
  );
}

// ============================================================
// JÁ FIZ O PAGAMENTO
// ============================================================

bot.action('confirmar_pagamento', async (ctx) => {

  await ctx.answerCbQuery();

  const pacoteId = ctx.session?.pacoteEscolhido;

  if (!pacoteId || !PACOTES[pacoteId]) {

    return editarMensagem(
      ctx,

`⚠️ *Plano não identificado*

Por favor, escolha seu plano novamente.`,

      botaoPlanos()
    );
  }

  const pacote = PACOTES[pacoteId];

  const user = ctx.from;

  const dataHora = new Date().toLocaleString(
    'pt-BR',
    {
      timeZone: 'America/Sao_Paulo'
    }
  );

  const mensagemAdmin =
`🔔 *NOVA SOLICITAÇÃO DE VERIFICAÇÃO*

━━━━━━━━━━━━━━━━━━

👤 *Nome:* ${user.first_name || 'N/A'}
📛 *Sobrenome:* ${user.last_name || 'N/A'}
🔗 *Username:* ${
    user.username
      ? '@' + user.username
      : 'Sem username'
  }

🆔 *Chat ID:* \`${user.id}\`

📦 *Plano:* ${pacote.nome}
💰 *Preço:* ${pacote.preco} ${pacote.periodo}

📅 *Data:* ${dataHora}

━━━━━━━━━━━━━━━━━━

⚠️ *Verifique o pagamento antes de liberar o acesso.*`;

  try {

    await adminBot.telegram.sendMessage(
      ADMIN_CHAT_ID,
      mensagemAdmin,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '✅ Pagamento verificado',
              `aprovar_${user.id}_${pacoteId}`
            )
          ]
        ])
      }
    );

    await editarMensagem(
      ctx,

`⏳ *Pagamento enviado para verificação*

Obrigado, *${nomeUsuario(ctx)}*! 👋

Nossa equipe recebeu sua solicitação.

Assim que o pagamento for confirmado, seu acesso VIP será liberado.

⚽ *Aguarde alguns minutos.*`,

      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            '🏠 Menu principal',
            'menu'
          )
        ],
        [
          Markup.button.callback(
            '💬 Falar com suporte',
            'suporte'
          )
        ]
      ])
    );

  } catch (error) {

    console.error(
      'Erro ao enviar confirmação:',
      error
    );

    await ctx.reply(
      '❌ Não foi possível enviar a confirmação. Tente novamente.'
    );
  }
});

// ============================================================
// "AINDA NÃO PAGUEI"
// ============================================================

bot.action('ainda_nao_paguei', async (ctx) => {

  await ctx.answerCbQuery();

  const pacoteId = ctx.session?.pacoteEscolhido;

  if (!pacoteId || !PACOTES[pacoteId]) {
    return editarMensagem(
      ctx,
      'Escolha primeiro um plano:',
      botaoPlanos()
    );
  }

  const pacote = PACOTES[pacoteId];

  await editarMensagem(
    ctx,

`💳 *Pagamento ainda não realizado*

Sem problema!

Você selecionou:

*${pacote.nome}*
💰 ${pacote.preco} ${pacote.periodo}

Quando estiver pronto, clique abaixo para realizar o pagamento.`,

    Markup.inlineKeyboard([
      [
        Markup.button.url(
          '💳 Pagar agora',
          pacote.link
        )
      ],
      [
        Markup.button.callback(
          '⬅️ Voltar',
          `plano_${pacoteId}`
        )
      ]
    ])
  );
});

// ============================================================
// DÚVIDAS SOBRE PAGAMENTO
// ============================================================

bot.action('duvidas_pagamento', async (ctx) => {

  await ctx.answerCbQuery();

  await editarMensagem(
    ctx,

`❓ *DÚVIDAS SOBRE O PAGAMENTO*

*O pagamento é seguro?*
O checkout é realizado através da plataforma de pagamento indicada no botão.

*Quando recebo o acesso?*
Após a confirmação do pagamento pela nossa equipe.

*Posso cancelar?*
Consulte as condições apresentadas no checkout antes de concluir a compra.

👇 Se ainda tiver dúvidas, fale com nosso suporte.`,

    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          '💬 Falar com suporte',
          'suporte'
        )
      ],
      [
        Markup.button.callback(
          '🔥 Ver planos',
          'ver_planos'
        )
      ],
      [
        Markup.button.callback(
          '⬅️ Voltar',
          'menu'
        )
      ]
    ])
  );
});

// ============================================================
// FAQ
// ============================================================

bot.action('duvidas', async (ctx) => {

  await ctx.answerCbQuery();

  await editarMensagem(
    ctx,

`❓ *PERGUNTAS FREQUENTES*

*⚽ O que recebo no VIP?*
Você recebe acesso ao conteúdo e às análises disponibilizadas pela PALPITE10.

*📅 Com que frequência são enviados?*
Os conteúdos são publicados de acordo com a programação do canal.

*💳 Como faço para entrar?*
Escolha um plano, faça o pagamento e envie a confirmação pelo botão do bot.

*📱 Preciso instalar outro aplicativo?*
Não. O acesso principal é feito pelo Telegram.

*🆘 Preciso de ajuda?*
Clique em *Falar com suporte*.`,

    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          '🔥 Ver planos',
          'ver_planos'
        )
      ],
      [
        Markup.button.callback(
          '💬 Suporte',
          'suporte'
        )
      ],
      [
        Markup.button.callback(
          '⬅️ Voltar',
          'menu'
        )
      ]
    ])
  );
});

// ============================================================
// SUPORTE
// ============================================================

bot.action('suporte', async (ctx) => {

  await ctx.answerCbQuery();

  await editarMensagem(
    ctx,

`💬 *SUPORTE PALPITE10*

Precisa de ajuda?

Nossa equipe pode ajudar com:

• Pagamento
• Acesso VIP
• Dúvidas sobre os planos
• Problemas técnicos

👇 Clique abaixo para falar conosco.`,

    Markup.inlineKeyboard([
      [
        Markup.button.url(
          '💬 Falar com suporte',
          'https://t.me/SEU_USERNAME_DE_SUPORTE'
        )
      ],
      [
        Markup.button.callback(
          '⬅️ Voltar',
          'menu'
        )
      ]
    ])
  );
});

// ============================================================
// COMANDOS
// ============================================================

bot.help(async (ctx) => {

  await ctx.reply(
`📖 *CENTRAL DE AJUDA*

Escolha uma opção:`,

    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback(
            '🔥 Ver planos',
            'ver_planos'
          )
        ],
        [
          Markup.button.callback(
            '⚽ Como funciona',
            'como_funciona'
          )
        ],
        [
          Markup.button.callback(
            '❓ Dúvidas',
            'duvidas'
          )
        ],
        [
          Markup.button.callback(
            '💬 Suporte',
            'suporte'
          )
        ]
      ])
    }
  );
});

bot.command('menu', async (ctx) => {

  const nome = nomeUsuario(ctx);

  await ctx.reply(
`⚽ *PALPITE10 VIP*

Olá, *${nome}*! 👋

O que você gostaria de fazer?`,

    {
      parse_mode: 'Markdown',
      ...menuPrincipal()
    }
  );
});

// ============================================================
// BOTÕES ADMIN
// ============================================================

adminBot.action(
  /^aprovar_(\d+)_(semanal|mensal|trimestral)$/,
  async (ctx) => {

    await ctx.answerCbQuery();

    const userId = ctx.match[1];
    const planoId = ctx.match[2];

    const pacote = PACOTES[planoId];

    if (!pacote) {
      return ctx.reply('Plano inválido.');
    }

    // IMPORTANTE:
    // Aqui você pode futuramente conectar
    // sua lógica real de liberação de acesso.

    try {

      await bot.telegram.sendMessage(
        userId,

`🎉 *PAGAMENTO CONFIRMADO!*

Seu pagamento foi verificado.

📦 *Plano:* ${pacote.nome}
💰 *Valor:* ${pacote.preco}

✅ Seu acesso VIP será liberado pela equipe.

Bem-vindo ao PALPITE10! ⚽🔥`,

        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.url(
                '⚽ Entrar no VIP',
                'https://t.me/SEU_CANAL_VIP'
              )
            ]
          ])
        }
      );

      await ctx.editMessageText(
`✅ *PAGAMENTO APROVADO*

👤 User ID: \`${userId}\`

📦 Plano: ${pacote.nome}
💰 Valor: ${pacote.preco}

O cliente foi notificado.`,

        {
          parse_mode: 'Markdown'
        }
      );

    } catch (error) {

      console.error(
        'Erro ao aprovar pagamento:',
        error
      );

      await ctx.reply(
        '❌ Não foi possível notificar o cliente.'
      );
    }
  }
);

// ============================================================
// ERROS
// ============================================================

bot.catch((err, ctx) => {

  console.error(
    `Erro no update ${ctx.updateType}:`,
    err
  );
});

// ============================================================
// VERCEL WEBHOOK
// ============================================================

module.exports = async (req, res) => {

  try {

    await bot.handleUpdate(req.body);

    res.status(200).send('OK');

  } catch (err) {

    console.error(
      'Erro no webhook:',
      err
    );

    res.status(200).send('OK');
  }
};
