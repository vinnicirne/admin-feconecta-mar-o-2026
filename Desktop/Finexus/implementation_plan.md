# Projeto de Evolução FiNexus: Premium & Intelligence

Este plano detalha as melhorias propostas após a análise técnica e estética do sistema. O objetivo é elevar o FiNexus para um nível "Premium", com design de estado da arte e inteligência proativa.

## 🎨 Design System & UI/UX (Estética Premium)

### 1. Sistema de Cores e Gradients
Substituir cores sólidas por gradients dinâmicos e vibrantes para criar profundidade.
- **[MODIFY]** `src/index.css`: Definir tokens de gradient (Emerald-Teal, Rose-Pink, Blue-Indigo).
- **[MODIFY]** `src/features/dashboard/Dashboard.tsx`: Aplicar gradients nos `SummaryCard`.

### 2. Glassmorphism Avançado
Refinar o efeito de vidro em modais e sidebars.
- **[MODIFY]** `src/index.css`: Adicionar bordas sutis com brilho (`ring`) e reflexos especulares.

### 3. Micro-animações
Adicionar feedback visual em cada interação.
- **[NEW]** Adicionar `framer-motion` (opcional, ou usar Vanilla CSS) para transições de aba e hover em cards.

---

## 🚀 Performance & Arquitetura

### 1. Code-splitting (Lazy Loading)
Reduzir o tamanho do bundle inicial (~1MB) carregando as visões sob demanda.
- **[MODIFY]** `src/App.tsx`: Implementar `React.lazy` para `CDDView`, `CDPView`, `AIAnalysis`, etc.

### 2. Context API para Estado Global
Evitar prop drilling do `state` e handlers.
- **[NEW]** `src/context/FinanceContext.tsx`: Prover o estado do `useFinanceApp` para toda a árvore.

---

## 🤖 Inteligência Artificial (Nina 2.0)

### 1. Insights Proativos no Dashboard
A IA agora analisa os dados e exibe "balões de pensamento" da Nina com dicas de economia ou alertas de gastos estranhos.
- **[NEW]** Componente `NinaInsights.tsx` no Dashboard.

### 2. Sugestão de Categorização
Ao digitar no Modal, a IA (ou lógica de padrões) sugere a categoria Pessoal/Profissional.

---

## 📱 Mobile-First PWA

### 1. Bottom Navigation
Para melhor usabilidade em dispositivos móveis, adicionar uma barra inferior.
- **[NEW]** `src/components/layout/BottomNav.tsx`.

---

## Plano de Verificação

### Automated Tests
- Rodar `npm run build` e verificar a redução do arquivo JS principal via chunks.
- Validar caminhos de importação no novo Context.

### Manual Verification
- Testar a fluidez visual no Lighthouse (Performance/UX).
- Verificar se o compartilhamento de estado via Context funciona entre abas sem bugs.
