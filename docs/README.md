# Construtor de Questões - Documentação

## 📖 Visão Geral

**Construtor de Questões** é uma plataforma web completa para criar, organizar, estudar e avaliar questões acadêmicas. Desenvolvida com HTML5, CSS3 e JavaScript vanilla, oferece uma experiência responsiva em todos os dispositivos.

## 🚀 Características Principais

### 📚 Biblioteca de Questões
- Crie e organize questões de diferentes tipos (múltipla escolha, verdadeiro/falso, abertas, numéricas)
- Busca avançada por texto ou tags
- Classificação por dificuldade (fácil, médio, difícil)
- Marcação de dúvidas e questões incompletas
- Acesso rápido às suas questões mais importantes

### 🎯 Sistema de Quiz
- Gere quizzes personalizados aleatoriamente
- Opção de focar em dúvidas ou questões incompletas
- Barra de progresso em tempo real
- Pontuação automática e feedback detalhado
- Histórico de resultados

### 🎨 Sistema de Temas
- 6 temas premium inclusos:
  - Charcoal Gold (padrão)
  - Ocean
  - Annapurna
  - Crimson Dusk
  - White Cliffs (Frost)
  - Alpine Dusk
- Alternância de temas em um clique
- Preferências salvas automaticamente

### 📤 Importação/Exportação
- Suporte para JSON e CSV
- Backup automático da sua biblioteca
- Restauração fácil de dados

### 🤖 Integração com Gemini AI
- Avaliação inteligente de respostas
- Geração automática de questões por tópico
- Feedback personalizado

### 🎵 Recursos Adicionais
- Player de música ambiente (frequências de foco)
- Cronômetro integrado para timed tests
- Notificações em tempo real
- Modo responsivo (mobile, tablet, desktop)

## 📂 Estrutura do Projeto

```
SITE QUESTÕES/
├── index.html              # Arquivo principal
├── css/
│   ├── themes.css         # Definições de temas
│   ├── main.css           # Estilos base e animações
│   ├── mobile.css         # Responsivo mobile
│   ├── tablet.css         # Responsivo tablet
│   └── responsive.css     # Componentes desktop
├── js/
│   ├── state.js           # Gerenciamento de estado global
│   ├── audio.js           # Motor de áudio Web API
│   ├── notifications.js   # Sistema de notificações e modais
│   ├── ui-utils.js        # Helpers DOM e utilitários
│   ├── theme.js           # Gerenciador de temas
│   ├── storage.js         # Persistência localStorage
│   ├── parser.js          # Análise de formatos
│   ├── question-editor.js # CRUD de questões
│   ├── library.js         # Gerenciador de biblioteca
│   ├── quiz-engine.js     # Motor de quiz
│   ├── music-player.js    # Player de música
│   ├── chronometer.js     # Cronômetro
│   ├── gemini-evaluator.js# Integração IA
│   └── app.js             # Orquestrador principal
├── data/
│   └── exemplo.json       # Exemplo de questões
└── docs/
    ├── README.md          # Este arquivo
    ├── GUIA_RAPIDO.md     # Guia de uso
    └── ARCHITECTURE.md    # Arquitetura técnica
```

## 🎮 Como Usar

### Criar uma Questão
1. Clique em **"+ Nova"** na aba Biblioteca
2. Preencha os dados: tipo, pergunta, opções (se aplicável)
3. Adicione a resposta correta e explicação
4. Configure dificuldade e tags
5. Clique em **"Salvar"**

### Fazer um Quiz
1. Va para a aba **"Iniciar Quiz"**
2. Selecione as opções desejadas (apenas dúvidas, incompletas, etc)
3. Clique em **"Começar"**
4. Responda as questões
5. Veja seu score e feedback

### Importar Questões
1. Va para **"Ferramentas"** → Importar
2. Selecione um arquivo JSON ou CSV
3. Seus dados serão carregados automaticamente

### Exportar Dados
1. Va para **"Ferramentas"** → Exportar
2. Escolha o formato (JSON ou CSV)
3. Baixe seu arquivo

## ⌨️ Atalhos de Teclado

- `Ctrl + S` - Salvar/Auto-save
- `Esc` - Fechar modal
- `Tab` - Navegar entre abas
- `→` / `←` - Próxima/Anterior no quiz

## 🎨 Personalização de Temas

Os temas são definidos via CSS Variables no arquivo `/css/themes.css`. Cada tema possui:
- Cores de fundo (light, medium, dark)
- Cores de destaque (accent, gold)
- Cores semânticas (success, error, warning)
- Sombras e bordas

Para adicionar um novo tema, edite `themes.css` e siga o padrão existente.

## 💾 Auto-save

Seus dados são salvos automaticamente a cada 30 segundos em localStorage. Você nunca perderá seu trabalho!

## 📱 Responsividade

- **Mobile** (≤ 600px): Interface compacta com navigation inferior
- **Tablet** (601-1024px): Layout equilibrado
- **Desktop** (≥ 1025px): Layout completo com todos os recursos

## 🔐 Privacidade

- Todos os dados são armazenados **localmente** no seu navegador
- Nenhuma informação é enviada para servidores (exceto ao usar Gemini AI)
- Você tem total controle sobre seus dados

## 🐛 Troubleshooting

**P: Minhas questões desapareceram!**
R: Verifique o localStorage (Devtools → Storage). Se ainda não estiver lá, tente importar um backup JSON.

**P: Os temas não estão carregando**
R: Limpar cache do navegador (Ctrl+Shift+Del) e recarregar a página.

**P: Posso usar offline?**
R: Sim! A aplicação funciona offline. Seus dados são salvos localmente.

## 🤝 Contribuições

Encontrou um bug? Tem uma sugestão? Sinta-se livre para melhorar o projeto!

## 📄 Licença

Este projeto é de código aberto. Use, modifique e compartilhe livremente.

---

**Desenvolvido com ❤️ para educação**
