const { Telegraf, Markup, session } = require('telegraf');

// ============================================================
// CONFIG
// ============================================================

const bot = new Telegraf(process.env.BOT_TOKEN);
const adminBot = new Telegraf(process.env.ADMIN_BOT_TOKEN);

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Secret used by Vercel Cron
const CRON_SECRET = process.env.CRON_SECRET;

// ============================================================
// SESSION
// ============================================================

bot.use(session());

// ============================================================
// TEMPORARY USER STORAGE
// ============================================================
//
// IMPORTANT:
// This works for testing, but on Vercel this is NOT permanent.
//
// For production, replace this with a database / Redis.
// I explain this after the code.
//
// ============================================================

const usuarios = new Map();


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
    periodo: 'por 3 meses',
    descricao: 'Acesso por 90 dias',
    link: 'https://whop.com/checkout/plan_zZx8KgPMb3ZDW'
  }

};


// ============================================================
// CONFIGURAÇÃO DAS NOTIFICAÇÕES
// ============================================================

const HORA_MANHA = 10;
const HORA_NOITE = 20;

// Brasil / São Paulo = UTC-3
// Portanto:
// 10:00 BRT = 13:00 UTC
// 20:00 BRT = 23:00 UTC


// ============================================================
// 40 DIAS × 2 NOTIFICAÇÕES
// ============================================================

const NOTIFICACOES = [

  // ==========================================================
  // DIA 1
  // ==========================================================

  {
    dia: 1,

    manha:
`☀️ *Bom dia, família PALPITE10!*

Mais um dia começando e já tem muito futebol para acompanhar. ⚽

📊 Análises
⚽ Futebol
🔥 Conteúdo diário

Fique de olho no PALPITE10 hoje.`,

    noite:
`🌙 *Fechando mais um dia de futebol!*

Se você ainda não conferiu o PALPITE10 hoje, dê uma olhada nas análises disponíveis.

Amanhã tem mais. ⚽🔥`
  },


  // ==========================================================
  // DIA 2
  // ==========================================================

  {
    dia: 2,

    manha:
`☀️ *Bom dia!*

Novo dia.
Novos jogos.
Novos cenários.

📊 Confira as análises disponíveis no PALPITE10 hoje.`,

    noite:
`🔥 *Mais um dia de futebol chegando ao fim.*

Quem acompanha futebol diariamente sabe:

Antes do jogo existe análise.
Depois do jogo existe resultado.

📊 Confira o PALPITE10 antes da próxima rodada.`
  },


  // ==========================================================
  // DIA 3
  // ==========================================================

  {
    dia: 3,

    manha:
`⚽ *DIA DE JOGO!*

Antes da bola rolar, informação.

📊 Forma recente
📊 Estatísticas
📊 Contexto

Confira o PALPITE10 hoje.`,

    noite:
`🌙 *Já conferiu o PALPITE10 hoje?*

Não deixe para procurar informação depois que os jogos começarem.

📊 Acompanhe as análises antes.`
  },


  // ==========================================================
  // DIA 4
  // ==========================================================

  {
    dia: 4,

    manha:
`☀️ *Bom dia, PALPITE10!*

O futebol não para.

E nossas análises também não. ⚽🔥

Confira o que está no radar hoje.`,

    noite:
`📊 *Mais um dia de análises concluído.*

Se você gosta de acompanhar futebol com mais informação e contexto, fique por aqui.

Amanhã continuamos. ⚽`
  },


  // ==========================================================
  // DIA 5
  // ==========================================================

  {
    dia: 5,

    manha:
`🔥 *BOM DIA!*

Mais uma rodada para acompanhar.

Não olhe apenas para o nome dos times.

📊 Forma
📊 Estatísticas
📊 Momento
📊 Contexto

Confira as análises de hoje.`,

    noite:
`⚽ *No futebol, informação antes do jogo é diferente de informação depois.*

As análises de hoje já estão disponíveis.

Confira quando puder. 🔥`
  },


  // ==========================================================
  // DIA 6
  // ==========================================================

  {
    dia: 6,

    manha:
`☀️ *Sábado começando!*

Dia cheio de futebol chegando. ⚽🔥

Se você acompanha vários campeonatos, hoje vale ficar atento às análises.`,

    noite:
`🔥 *Que dia de futebol!*

Se você acompanhou o PALPITE10 hoje, amanhã tem mais.

Se ainda não conferiu, dê uma olhada antes dos próximos jogos. ⚽`
  },


  // ==========================================================
  // DIA 7
  // ==========================================================

  {
    dia: 7,

    manha:
`📅 *1 SEMANA DE PALPITE10!*

Já são vários dias acompanhando futebol, estatísticas e análises juntos.

Obrigado por estar aqui. ❤️⚽

E ainda tem muita bola para rolar.`,

    noite:
`🌙 *Primeira semana concluída!*

Amanhã começa mais uma sequência de jogos e análises.

Continue acompanhando o PALPITE10. ⚽`
  },


  // ==========================================================
  // DIA 8
  // ==========================================================

  {
    dia: 8,

    manha:
`☀️ *Bom dia!*

Novo dia = novos jogos para estudar.

Antes de qualquer decisão, confira as análises disponíveis hoje. 📊⚽`,

    noite:
`🔥 *As análises de hoje já estão disponíveis.*

Reserve alguns minutos, veja os dados e acompanhe os jogos.

PALPITE10 ⚽📊`
  },


  // ==========================================================
  // DIA 9
  // ==========================================================

  {
    dia: 9,

    manha:
`⚽ *Mais um dia de futebol!*

Aqui não existe necessidade de correr.

Primeiro você analisa.
Depois decide.

📊 Confira o PALPITE10 hoje.`,

    noite:
`🌙 *Futebol de hoje praticamente encerrado.*

Amanhã tem uma nova rodada para analisar.

Fique de olho. 🔥⚽`
  },


  // ==========================================================
  // DIA 10
  // ==========================================================

  {
    dia: 10,

    manha:
`🔥 *10 DIAS DE PALPITE10!*

Se você chegou até aqui, já sabe:

Futebol é muito mais interessante quando você acompanha os dados por trás dos jogos.

📊 PALPITE10`,

    noite:
`🌙 *Mais um dia concluído.*

Amanhã tem novos jogos, novas análises e muito futebol.

Boa noite, família PALPITE10! ⚽❤️`
  },


  // ==========================================================
  // DIA 11
  // ==========================================================

  {
    dia: 11,

    manha:
`☀️ *Bom dia!*

Já conferiu os jogos de hoje?

Antes da bola rolar, confira as análises do PALPITE10. 📊⚽`,

    noite:
`🔥 *Hoje teve muito futebol!*

Se você gosta de acompanhar os jogos com uma visão mais analítica, continue no PALPITE10.`
  },


  // ==========================================================
  // DIA 12
  // ==========================================================

  {
    dia: 12,

    manha:
`⚽ *NOVO DIA!*

Não importa se você acompanha um jogo ou dez.

Uma boa análise começa antes da bola rolar.

📊 Confira o canal hoje.`,

    noite:
`🌙 *Encerrando mais um dia.*

Amanhã tem mais futebol para estudar.

Boa noite! ⚽🔥`
  },


  // ==========================================================
  // DIA 13
  // ==========================================================

  {
    dia: 13,

    manha:
`☀️ *Bom dia, PALPITE10!*

Hoje é dia de olhar além do placar.

Forma recente e estatísticas contam uma história.

📊 Veja as análises de hoje.`,

    noite:
`🔥 *Mais um dia de conteúdo no PALPITE10.*

Se você ainda não viu as análises de hoje, confira antes dos próximos jogos.`
  },


  // ==========================================================
  // DIA 14
  // ==========================================================

  {
    dia: 14,

    manha:
`📅 *2 SEMANAS!*

Duas semanas acompanhando futebol juntos. ⚽❤️

E a temporada continua cheia de jogos para analisar.

Vamos para mais um dia! 🔥`,

    noite:
`🌙 *Duas semanas completas!*

Obrigado por acompanhar o PALPITE10.

Amanhã tem mais. ⚽`
  },


  // ==========================================================
  // DIA 15
  // ==========================================================

  {
    dia: 15,

    manha:
`☀️ *Bom dia!*

O calendário está cheio hoje.

Escolha seus jogos, confira os dados e acompanhe as análises. 📊⚽`,

    noite:
`🔥 *O dia de futebol está chegando ao fim.*

Se você gosta de acompanhar as partidas com contexto e estatísticas, fique por aqui.

PALPITE10 ⚽`
  },


  // ==========================================================
  // DIA 16
  // ==========================================================

  {
    dia: 16,

    manha:
`⚽ *BOM DIA!*

Mais uma rodada para estudar.

Não é sobre adivinhar.

É sobre analisar o que os números e o contexto mostram. 📊`,

    noite:
`🌙 *Mais um dia concluído.*

Amanhã continuamos analisando os jogos.

Boa noite, PALPITE10! 🔥`
  },


  // ==========================================================
  // DIA 17
  // ==========================================================

  {
    dia: 17,

    manha:
`☀️ *Futebol começa muito antes do apito inicial.*

Confira as análises de hoje antes dos jogos começarem. ⚽📊`,

    noite:
`🔥 *Já viu as análises de hoje?*

Se ainda não, dê uma olhada no canal.

Amanhã tem mais.`
  },


  // ==========================================================
  // DIA 18
  // ==========================================================

  {
    dia: 18,

    manha:
`☀️ *Mais jogos.*
*Mais dados.*
*Mais futebol.*

📊 PALPITE10`,

    noite:
`🌙 *Dia encerrado!*

Obrigado por acompanhar o PALPITE10.

Nos vemos amanhã para mais futebol. ⚽`
  },


  // ==========================================================
  // DIA 19
  // ==========================================================

  {
    dia: 19,

    manha:
`🔥 *MAIS UM DIA!*

Cada rodada traz um novo cenário.

Confira as análises disponíveis hoje. 📊`,

    noite:
`⚽ *Mais uma rodada analisada.*

Amanhã tem novos jogos para estudar.

Fique ligado no PALPITE10. 🔥`
  },


  // ==========================================================
  // DIA 20
  // ==========================================================

  {
    dia: 20,

    manha:
`☀️ *20 DIAS DE PALPITE10!*

Continuamos acompanhando futebol todos os dias.

Confira o canal hoje. ⚽🔥`,

    noite:
`🌙 *20 dias!*

Obrigado por estar aqui.

A temporada continua — e nós também. ⚽🔥`
  },


  // ==========================================================
  // DIA 21
  // ==========================================================

  {
    dia: 21,

    manha:
`☀️ *NOVA RODADA!*

Os jogos de hoje já estão no radar.

📊 Confira as análises antes da bola rolar.`,

    noite:
`🔥 *Mais um dia de futebol concluído.*

Amanhã tem novos confrontos para acompanhar.

PALPITE10 ⚽`
  },


  // ==========================================================
  // DIA 22
  // ==========================================================

  {
    dia: 22,

    manha:
`⚽ *Bom dia!*

Nem todo jogo merece a mesma atenção.

Hoje, veja quais partidas estão sendo analisadas no PALPITE10. 📊`,

    noite:
`🌙 *Antes de dormir:*

Já conferiu os jogos de amanhã?

Deixe o PALPITE10 no radar. 🔥`
  },


  // ==========================================================
  // DIA 23
  // ==========================================================

  {
    dia: 23,

    manha:
`☀️ *DIA DE FUTEBOL!*

☕ Café
📱 PALPITE10
⚽ Jogos

Comece o dia conferindo as análises.`,

    noite:
`🔥 *O futebol de hoje trouxe muito movimento.*

Amanhã começamos novamente.

Boa noite! ⚽`
  },


  // ==========================================================
  // DIA 24
  // ==========================================================

  {
    dia: 24,

    manha:
`📊 *Bom dia!*

Os números contam uma história.

Nossa função é estudar essa história antes do jogo começar.

Confira o PALPITE10. ⚽`,

    noite:
`🌙 *Mais um dia analisado.*

Se você ainda está apenas acompanhando, continue observando as análises.

Amanhã tem mais.`
  },


  // ==========================================================
  // DIA 25
  // ==========================================================

  {
    dia: 25,

    manha:
`🔥 *25 DIAS!*

Já são cinco semanas acompanhando futebol juntos.

Obrigado por estar aqui. ⚽❤️`,

    noite:
`🌙 *Cinco semanas de PALPITE10.*

Amanhã tem mais análises e mais futebol.

Até amanhã!`
  },


  // ==========================================================
  // DIA 26
  // ==========================================================

  {
    dia: 26,

    manha:
`☀️ *Bom dia!*

Hoje tem novos jogos para acompanhar.

📊 Veja as análises disponíveis antes dos confrontos.`,

    noite:
`🔥 *Se você perdeu as análises de hoje,*

ainda pode conferir os próximos jogos.

Não deixe para depois. ⚽`
  },


  // ==========================================================
  // DIA 27
  // ==========================================================

  {
    dia: 27,

    manha:
`⚽ *NOVO DIA.*

Novos jogos.
Novos cenários.
Novas análises.

📊 PALPITE10`,

    noite:
`🌙 *O dia terminou.*

Agora é hora de preparar o próximo.

Amanhã tem mais futebol. 🔥`
  },


  // ==========================================================
  // DIA 28
  // ==========================================================

  {
    dia: 28,

    manha:
`☀️ *4 SEMANAS DE PALPITE10!*

Já são quatro semanas acompanhando futebol juntos. 🔥

Confira o canal hoje.`,

    noite:
`🌙 *4 semanas!*

Obrigado por estar com a gente.

O futebol continua amanhã. ⚽`
  },


  // ==========================================================
  // DIA 29
  // ==========================================================

  {
    dia: 29,

    manha:
`📊 *BOM DIA!*

Antes de olhar qualquer resultado, olhe os dados.

Confira as análises de hoje no PALPITE10. ⚽`,

    noite:
`🔥 *Mais um dia de futebol.*

Amanhã tem novos jogos para analisar.

Fique ligado.`
  },


  // ==========================================================
  // DIA 30
  // ==========================================================

  {
    dia: 30,

    manha:
`🚨 *30 DIAS!*

Um mês inteiro acompanhando futebol.

Se você ainda está pensando em acompanhar o VIP, confira os planos disponíveis. ⚽🔥`,

    noite:
`🌙 *Um mês de PALPITE10!*

Se você gosta de acompanhar futebol diariamente, o VIP continua disponível.

Confira os planos quando quiser. ⚽`
  },


  // ==========================================================
  // DIA 31
  // ==========================================================

  {
    dia: 31,

    manha:
`☀️ *NOVO MÊS!*

Novas rodadas.
Novos jogos.
Novas análises.

Comece o dia no PALPITE10. 📊⚽`,

    noite:
`🔥 *Mais um dia concluído.*

Amanhã tem novos jogos.

PALPITE10 continua acompanhando. ⚽`
  },


  // ==========================================================
  // DIA 32
  // ==========================================================

  {
    dia: 32,

    manha:
`⚽ *Bom dia!*

Você não precisa acompanhar todos os jogos.

Encontre os que chamam atenção e confira a análise. 📊`,

    noite:
`🌙 *Já escolheu os jogos de amanhã?*

Confira o PALPITE10 antes da bola rolar. 🔥`
  },


  // ==========================================================
  // DIA 33
  // ==========================================================

  {
    dia: 33,

    manha:
`☀️ *MAIS FUTEBOL!*

O calendário não para.

E nós também não.

📊 Confira as análises de hoje.`,

    noite:
`🔥 *Mais um dia de futebol encerrado.*

Amanhã começa tudo novamente.

Boa noite! ⚽`
  },


  // ==========================================================
  // DIA 34
  // ==========================================================

  {
    dia: 34,

    manha:
`📊 *Bom dia!*

Forma recente.
Estatísticas.
Contexto.

Tudo isso ajuda a entender melhor uma partida.

Confira o PALPITE10. ⚽`,

    noite:
`🌙 *Hoje já foi.*

Agora é hora de olhar para amanhã.

Fique de olho no PALPITE10. 🔥`
  },


  // ==========================================================
  // DIA 35
  // ==========================================================

  {
    dia: 35,

    manha:
`🔥 *35 DIAS!*

Já são cinco semanas acompanhando futebol.

Obrigado por estar aqui. ⚽❤️`,

    noite:
`🌙 *Cinco semanas completas.*

Amanhã tem mais análises e mais futebol.

Até amanhã!`
  },


  // ==========================================================
  // DIA 36
  // ==========================================================

  {
    dia: 36,

    manha:
`☀️ *Bom dia!*

Não espere o jogo começar para procurar informação.

Confira as análises antes. 📊⚽`,

    noite:
`🔥 *Mais um dia de análises.*

Se você ainda não conferiu, veja os próximos jogos disponíveis.`
  },


  // ==========================================================
  // DIA 37
  // ==========================================================

  {
    dia: 37,

    manha:
`⚽ *DIA DE JOGO!*

Abra o PALPITE10 antes da bola rolar.

📊 Informação primeiro.`,

    noite:
`🌙 *O futebol de hoje acabou.*

Amanhã tem uma nova rodada para acompanhar.

PALPITE10 ⚽🔥`
  },


  // ==========================================================
  // DIA 38
  // ==========================================================

  {
    dia: 38,

    manha:
`☀️ *Bom dia!*

Mais uma manhã.
Mais uma rodada.
Mais análises.

📊 PALPITE10`,

    noite:
`🔥 *Se você gosta de acompanhar futebol todos os dias, continue com a gente.*

Amanhã tem mais. ⚽`
  },


  // ==========================================================
  // DIA 39
  // ==========================================================

  {
    dia: 39,

    manha:
`📊 *QUASE 40 DIAS!*

Amanhã completamos 40 dias juntos.

Hoje ainda temos futebol para acompanhar.

Confira as análises. ⚽🔥`,

    noite:
`🌙 *Último dia antes dos 40 dias.*

Amanhã temos uma mensagem especial. ❤️⚽`
  },


  // ==========================================================
  // DIA 40
  // ==========================================================

  {
    dia: 40,

    manha:
`🎉 *40 DIAS DE PALPITE10!*

Você chegou até aqui.

Foram 40 dias acompanhando futebol, análises e muito conteúdo.

Obrigado por estar com a gente. ❤️⚽

🔥 Se você ainda não conhece o VIP, confira os planos.`,

    noite:
`🏆 *40 DIAS COMPLETOS!*

Obrigado por acompanhar o PALPITE10.

Se você quer continuar acompanhando nossas análises diariamente:

👇 Confira os planos VIP.

⚽🔥 *PALPITE10*`
  }

];


// ============================================================
// MENSAGENS COM SOCIAL PROOF REAL
// ============================================================
//
// NÃO coloque números inventados aqui.
//
// Quando você tiver números reais, altere:
// PESSOAS
// TAXA
//
// Exemplo:
// PESSOAS = 348
// TAXA = "82%"
//
// ============================================================

const SOCIAL_PROOF = {

  pessoas: 348,

  taxa: 85%

};


function gerarSocialProof() {

  if (
    SOCIAL_PROOF.pessoas &&
    SOCIAL_PROOF.taxa
  ) {

    return `🔥 *RESULTADO DO PALPITE10*

Ontem, *${SOCIAL_PROOF.pessoas} membros* acompanharam nossas análises.

📊 Taxa registrada: *${SOCIAL_PROOF.taxa}*

Confira as próximas análises no PALPITE10. ⚽`;

  }

  return `🔥 *MAIS UM DIA DE FUTEBOL!*

A comunidade PALPITE10 continua acompanhando as análises diariamente.

📊 Confira os próximos jogos no canal.

⚽ PALPITE10`;
}


// ============================================================
// REGISTRAR USUÁRIO
// ============================================================

function registrarUsuario(ctx) {

  if (!ctx.from?.id) return;

  const id = String(ctx.from.id);

  const atual = usuarios.get(id);

  if (!atual) {

    usuarios.set(id, {

      id,

      firstName: ctx.from.first_name || '',

      username: ctx.from.username || '',

      criadoEm: new Date(),

      notificacoes: true,

      vip: false,

      diaInicio: new Date()

    });

    return;

  }

  // Atualiza dados básicos

  atual.firstName =
    ctx.from.first_name || atual.firstName;

  atual.username =
    ctx.from.username || atual.username;
}


// ============================================================
// REGISTRAR TODAS AS INTERAÇÕES
// ============================================================

bot.use(async (ctx, next) => {

  try {

    registrarUsuario(ctx);

  } catch (error) {

    console.error(
      'Erro ao registrar usuário:',
      error
    );

  }

  await next();

});


// ============================================================
// HELPERS
// ============================================================

function nomeUsuario(ctx) {

  return ctx.from?.first_name || 'amigo';

}


function menuPrincipal() {

  return Markup.inlineKeyboard([

    [
      Markup.button.callback(
        '⚽ Como funciona',
        'como_funciona'
      )
    ],

    [
      Markup.button.callback(
        '🔥 Ver planos VIP',
        'ver_planos'
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
        '💬 Falar com suporte',
        'suporte'
      )
    ]

  ]);

}


function botaoPlanos() {

  return Markup.inlineKeyboard([

    [
      Markup.button.callback(
        '🔥 Ver planos VIP',
        'ver_planos'
      )
    ],

    [
      Markup.button.callback(
        '⬅️ Voltar',
        'menu'
      )
    ]

  ]);

}


async function editarMensagem(
  ctx,
  texto,
  teclado = null
) {

  try {

    return await ctx.editMessageText(
      texto,
      {
        parse_mode: 'Markdown',
        ...(teclado || {})
      }
    );

  } catch (error) {

    if (
      error.description?.includes(
        'message is not modified'
      )
    ) {

      return;

    }

    console.error(
      'Erro ao editar mensagem:',
      error.description || error
    );

    return ctx.reply(
      texto,
      {
        parse_mode: 'Markdown',
        ...(teclado || {})
      }
    );

  }

}


// ============================================================
// /START
// ============================================================

bot.start(async (ctx) => {

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

bot.action(
  'como_funciona',
  async (ctx) => {

    await ctx.answerCbQuery();

    await editarMensagem(

      ctx,

`⚽ *COMO FUNCIONA?*

É simples:

*1️⃣ Escolha um plano*

Selecione o período de acesso.

*2️⃣ Faça o pagamento*

Você será direcionado para o checkout.

*3️⃣ Confirme*

Depois do pagamento, volte para o Telegram e clique em *"Já fiz o pagamento"*.

*4️⃣ Acesso VIP*

Nossa equipe verifica o pagamento e libera seu acesso.

👇 Escolha uma opção:`,

      Markup.inlineKeyboard([

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

  }
);


// ============================================================
// PLANOS
// ============================================================

bot.action(
  'ver_planos',
  async (ctx) => {

    await ctx.answerCbQuery();

    await enviarPlanos(ctx);

  }
);


bot.command(
  'pacotes',
  async (ctx) => {

    await enviarPlanos(ctx);

  }
);


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

  const teclado =
    Markup.inlineKeyboard([

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
// PLANOS INDIVIDUAIS
// ============================================================

bot.action(
  'plano_semanal',
  async (ctx) => {

    await ctx.answerCbQuery();

    await mostrarPlano(
      ctx,
      PACOTES.semanal
    );

  }
);


bot.action(
  'plano_mensal',
  async (ctx) => {

    await ctx.answerCbQuery();

    await mostrarPlano(
      ctx,
      PACOTES.mensal
    );

  }
);


bot.action(
  'plano_trimestral',
  async (ctx) => {

    await ctx.answerCbQuery();

    await mostrarPlano(
      ctx,
      PACOTES.trimestral
    );

  }
);


async function mostrarPlano(
  ctx,
  pacote
) {

  ctx.session.pacoteEscolhido =
    pacote.id;

  let destaque = '';

  if (
    pacote.id === 'mensal'
  ) {

    destaque =
      '\n⭐ *Uma das opções mais escolhidas*';

  }

  if (
    pacote.id === 'trimestral'
  ) {

    destaque =
      '\n💰 *Maior período de acesso*';

  }

  const mensagem =
`🔥 *${pacote.nome}*

💰 *${pacote.preco} ${pacote.periodo}*

${pacote.descricao}
${destaque}

Você terá acesso ao conteúdo VIP durante o período contratado.

👇 *Deseja continuar?*`;

  const teclado =
    Markup.inlineKeyboard([

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
// CONFIRMAR PAGAMENTO
// ============================================================

bot.action(
  'confirmar_pagamento',
  async (ctx) => {

    await ctx.answerCbQuery();

    const pacoteId =
      ctx.session?.pacoteEscolhido;

    if (
      !pacoteId ||
      !PACOTES[pacoteId]
    ) {

      return editarMensagem(

        ctx,

`⚠️ *Plano não identificado*

Por favor, escolha seu plano novamente.`,

        botaoPlanos()

      );

    }

    const pacote =
      PACOTES[pacoteId];

    const user =
      ctx.from;

    const dataHora =
      new Date().toLocaleString(
        'pt-BR',
        {
          timeZone:
            'America/Sao_Paulo'
        }
      );

    const mensagemAdmin =
`🔔 *NOVA SOLICITAÇÃO DE VERIFICAÇÃO*

━━━━━━━━━━━━━━━━━━

👤 *Nome:* ${
      user.first_name || 'N/A'
    }

📛 *Sobrenome:* ${
      user.last_name || 'N/A'
    }

🔗 *Username:* ${
      user.username
        ? '@' + user.username
        : 'Sem username'
    }

🆔 *Chat ID:* \`${user.id}\`

📦 *Plano:* ${pacote.nome}

💰 *Preço:* ${
      pacote.preco
    } ${pacote.periodo}

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

  }
);


// ============================================================
// DÚVIDAS SOBRE PAGAMENTO
// ============================================================

bot.action(
  'duvidas_pagamento',
  async (ctx) => {

    await ctx.answerCbQuery();

    await editarMensagem(

      ctx,

`❓ *DÚVIDAS SOBRE O PAGAMENTO*

*O pagamento é seguro?*

O checkout é realizado através da plataforma indicada no botão.

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

  }
);


// ============================================================
// FAQ
// ============================================================

bot.action(
  'duvidas',
  async (ctx) => {

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

  }
);


// ============================================================
// SUPORTE
// ============================================================

bot.action(
  'suporte',
  async (ctx) => {

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

  }
);


// ============================================================
// PARAR NOTIFICAÇÕES
// ============================================================

bot.command(
  'parar',
  async (ctx) => {

    const user =
      usuarios.get(
        String(ctx.from.id)
      );

    if (user) {

      user.notificacoes = false;

    }

    await ctx.reply(
`🔕 *Notificações pausadas.*

Você não receberá mais as mensagens automáticas do PALPITE10.

Se mudar de ideia, use:

/reativar`,

      {
        parse_mode: 'Markdown'
      }
    );

  }
);


// ============================================================
// REATIVAR NOTIFICAÇÕES
// ============================================================

bot.command(
  'reativar',
  async (ctx) => {

    const user =
      usuarios.get(
        String(ctx.from.id)
      );

    if (user) {

      user.notificacoes = true;

    }

    await ctx.reply(
`🔔 *Notificações reativadas!*

Você voltará a receber as novidades do PALPITE10. ⚽🔥`,

      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '🔥 Ver planos VIP',
              'ver_planos'
            )
          ]
        ])
      }
    );

  }
);


// ============================================================
// COMANDOS
// ============================================================

bot.help(
  async (ctx) => {

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

  }
);


bot.command(
  'menu',
  async (ctx) => {

    const nome =
      nomeUsuario(ctx);

    await ctx.reply(

`⚽ *PALPITE10 VIP*

Olá, *${nome}*! 👋

O que você gostaria de fazer?`,

      {
        parse_mode: 'Markdown',
        ...menuPrincipal()
      }

    );

  }
);


// ============================================================
// ADMIN — APROVAR PAGAMENTO
// ============================================================

adminBot.action(
  /^aprovar_(\d+)_(semanal|mensal|trimestral)$/,

  async (ctx) => {

    await ctx.answerCbQuery();

    const userId =
      ctx.match[1];

    const planoId =
      ctx.match[2];

    const pacote =
      PACOTES[planoId];

    if (!pacote) {

      return ctx.reply(
        'Plano inválido.'
      );

    }

    try {

      const cliente =
        usuarios.get(
          String(userId)
        );

      if (cliente) {

        cliente.vip = true;

        cliente.notificacoes = false;

      }

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

🔕 Notificações promocionais pausadas.

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
// SISTEMA DE NOTIFICAÇÕES
// ============================================================

function calcularDiaDaSequencia(
  usuario
) {

  if (!usuario?.diaInicio) {

    return 1;

  }

  const agora =
    new Date();

  const inicio =
    new Date(
      usuario.diaInicio
    );

  const diferenca =
    agora.getTime() -
    inicio.getTime();

  const dias =
    Math.floor(
      diferenca /
      (1000 * 60 * 60 * 24)
    );

  return Math.min(
    dias + 1,
    40
  );

}


// ============================================================
// PEGAR NOTIFICAÇÃO
// ============================================================

function obterNotificacao(
  dia,
  periodo
) {

  const item =
    NOTIFICACOES.find(
      n => n.dia === dia
    );

  if (!item) return null;

  return periodo === 'manha'
    ? item.manha
    : item.noite;

}


// ============================================================
// ENVIAR NOTIFICAÇÃO
// ============================================================

async function enviarNotificacoes(
  periodo
) {

  let enviados = 0;
  let erros = 0;

  for (
    const [id, usuario]
    of usuarios
  ) {

    // Usuário optou por parar
    if (
      !usuario.notificacoes
    ) {
      continue;
    }

    // Cliente VIP não recebe
    // sequência promocional
    if (
      usuario.vip
    ) {
      continue;
    }

    const dia =
      calcularDiaDaSequencia(
        usuario
      );

    let mensagem =
      obterNotificacao(
        dia,
        periodo
      );

    if (!mensagem) {
      continue;
    }

    // ========================================================
    // A cada alguns dias, adicionamos social proof.
    // ========================================================

    if (
      dia === 4 &&
      periodo === 'noite'
    ) {

      mensagem =
        gerarSocialProof();

    }

    if (
      dia === 12 &&
      periodo === 'noite'
    ) {

      mensagem =
        gerarSocialProof();

    }

    if (
      dia === 21 &&
      periodo === 'noite'
    ) {

      mensagem =
        gerarSocialProof();

    }

    if (
      dia === 29 &&
      periodo === 'noite'
    ) {

      mensagem =
        gerarSocialProof();

    }

    // ========================================================
    // BOTÃO
    // ========================================================

    const teclado =
      Markup.inlineKeyboard([

        [
          Markup.button.callback(
            '🔥 Ver planos VIP',
            'ver_planos'
          )
        ],

        [
          Markup.button.callback(
            '⚽ Menu',
            'menu'
          )
        ]

      ]);

    try {

      await bot.telegram.sendMessage(

        id,

        mensagem,

        {
          parse_mode: 'Markdown',
          ...teclado
        }

      );

      enviados++;

    } catch (error) {

      erros++;

      console.error(
        `Erro ao enviar para ${id}:`,
        error.description ||
        error.message
      );

      // Usuário bloqueou o bot
      if (
        error.response?.error_code === 403
      ) {

        usuarios.delete(id);

      }

    }

  }

  return {
    enviados,
    erros
  };

}


// ============================================================
// VERCEL CRON
// ============================================================
//
// O Vercel chama esta função duas vezes por dia.
//
// 13:00 UTC = 10:00 Brasil
// 23:00 UTC = 20:00 Brasil
//
// ============================================================

async function processarCron(
  req,
  res
) {

  const authorization =
    req.headers.authorization;

  if (
    !CRON_SECRET ||
    authorization !==
      `Bearer ${CRON_SECRET}`
  ) {

    return res
      .status(401)
      .json({
        error: 'Unauthorized'
      });

  }

  const horaUTC =
    new Date()
      .getUTCHours();

  let periodo;

  if (
    horaUTC === 13
  ) {

    periodo = 'manha';

  } else if (
    horaUTC === 23
  ) {

    periodo = 'noite';

  } else {

    return res
      .status(200)
      .json({
        message:
          'Nenhum horário de envio agora.'
      });

  }

  const resultado =
    await enviarNotificacoes(
      periodo
    );

  console.log(
    'Cron notifications:',
    resultado
  );

  return res
    .status(200)
    .json({
      success: true,
      periodo,
      ...resultado
    });

}


// ============================================================
// ERROR HANDLER
// ============================================================

bot.catch(
  (err, ctx) => {

    console.error(
      `Erro no update ${ctx.updateType}:`,
      err
    );

  }
);


// ============================================================
// VERCEL WEBHOOK
// ============================================================

module.exports = async (
  req,
  res
) => {

  // ==========================================================
  // CRON
  // ==========================================================

  if (
    req.method === 'GET' &&
    req.query?.cron === '1'
  ) {

    return processarCron(
      req,
      res
    );

  }

  // ==========================================================
  // TELEGRAM WEBHOOK
  // ==========================================================

  if (
    req.method === 'POST'
  ) {

    try {

      await bot.handleUpdate(
        req.body
      );

      return res
        .status(200)
        .send('OK');

    } catch (err) {

      console.error(
        'Erro no webhook:',
        err
      );

      return res
        .status(200)
        .send('OK');

    }

  }

  return res
    .status(200)
    .send('PALPITE10 BOT OK');

};
