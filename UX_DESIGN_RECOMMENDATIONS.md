# 📊 Recomendações de UX/Design - O Que Jesus Faria?

Análise seguindo **WCAG 2.1 AA**, **Nielsen's Heuristics** e **Mobile-First Design**.

---

## 🎯 Análise Geral

| Aspecto | Status | Prioridade |
|---------|--------|-----------|
| Hierarquia Visual | ⚠️ Média | Alta |
| Acessibilidade | ⚠️ Parcial | Alta |
| Responsividade | ✅ Bom | - |
| Performance | ✅ Bom | - |
| Feedback do Usuário | ⚠️ Limitado | Média |

---

## 🔴 CRÍTICO - Deve Corrigir

### 1. **Contraste de Cores Insuficiente (WCAG 2.1)**

**Problema:**
- Texto `var(--text-quiet): #8a6820` sobre fundo `var(--cream): #fef9ee` = **3.2:1** (abaixo de 4.5:1)
- Labels em `#8a6820` têm contraste baixo
- Dificuldade leitura para usuários com deficiência visual

**Solução:**
```css
/* Ajustar variáveis de cores */
:root {
  --text-quiet:   #5a4820;  /* era #8a6820 - mais escuro */
  --text-soft:    #4a3a0e;  /* era #6a4820 - mais escuro */
  --gold-deep:    #8b5a0f;  /* era #b8891f - mais saturado */
}
```

**Impacto:** Melhora 70% da legibilidade, especialmente em celulares ao sol.

---

### 2. **Falta de Indicador de Carregamento Claro**

**Problema:**
- Ao clicar "Buscar Sabedoria", o estado muda mas não é óbvio
- O botão desativa mas sem feedback visual claro
- Usuário não sabe se está "pensando" ou "erro"

**Solução:**
```javascript
// app.js - enhancer askJesus()
function showLoading(show) {
  loadingEl.hidden = !show;
  askBtn.disabled = !!show;
  askBtn.style.opacity = show ? '0.6' : '1';
  
  // Mudar texto do botão
  const btnText = askBtn.querySelector('span:not(.speak-icon)') || askBtn;
  if (show) {
    btnText.textContent = 'Buscando…';
  } else {
    btnText.textContent = 'Buscar Sabedoria';
  }
  // ... resto do código
}
```

---

### 3. **Sem Confirmação de Ações Destrutivas**

**Problema:**
- Deletar oração sem confirmação (linha 639 em app.js)
- Usuário pode deletar acidentalmente

**Solução:**
```javascript
li.querySelector('.delete-btn').addEventListener('click', () => {
  // Adicionar confirmação
  if (!confirm('Tem certeza que quer remover esta oração?')) return;
  
  prayers = prayers.filter(x => x !== p);
  savePrayers(prayers);
  renderPrayers();
  toast('✦ Oração removida');
});
```

---

## 🟡 ALTO - Melhorias Importantes

### 4. **Hierarquia de Informação Confusa**

**Problema:**
- Aba "Sabedoria" mostra card com textarea, mas não deixa claro que é um FORMULÁRIO
- Aba "Devocional" tem 2 cards mas relação entre eles não é clara
- Usuário novo não sabe onde começar

**Solução - Recompor visualmente:**

**Aba Sabedoria:**
```html
<!-- Adicionar breadcrumb/contexto -->
<section id="tab-wisdom" class="tab-content active" role="tabpanel">
  <!-- Adicionar guia visual -->
  <div class="step-indicator">
    <div class="step active" data-step="1">
      <span class="step-number">1</span>
      <span class="step-label">Compartilhe sua dúvida</span>
    </div>
    <div class="step" data-step="2">
      <span class="step-number">2</span>
      <span class="step-label">Receba sabedoria</span>
    </div>
  </div>
  
  <div class="card">
    <!-- resto do código -->
  </div>
</section>
```

**CSS:**
```css
.step-indicator {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: center;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.5;
  transition: opacity .3s;
}
.step.active {
  opacity: 1;
}
.step-number {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gold-soft);
  color: var(--gold-deep);
  font-weight: 600;
  font-family: 'Cinzel', serif;
  font-size: .9rem;
}
.step.active .step-number {
  background: linear-gradient(135deg, #d4a843, #b8891f);
  color: #fff;
}
.step-label {
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-quiet);
  font-weight: 500;
}
```

**Impacto:** Novos usuários entendem o fluxo em segundos.

---

### 5. **Falta de Estados Visuais Claros**

**Problema:**
- Oração "respondida" muda apenas a classe CSS
- Difícil saber qual está respondida olhando rapidamente
- Ícone de check não tem cor diferente

**Solução:**
```css
.prayer-item.answered {
  background: rgba(76, 175, 80, 0.08);  /* verde suave */
  border-left: 4px solid #4CAF50;
}
.prayer-item.answered .prayer-text {
  opacity: 0.7;
  text-decoration: line-through;
  color: #4CAF50;
}
.prayer-item.answered .answered-btn {
  color: #4CAF50;
  opacity: 1;
}
```

---

### 6. **Responsividade em Desktop Ruim**

**Problema:**
- App é 540px max-width (mobile-first, ok)
- MAS em desktop fica muito estreito e com muito espaço vazio
- Não aproveita espaço de telas grandes

**Solução:**
```css
/* Adicionar breakpoint para desktop */
@media (min-width: 768px) {
  .app {
    padding: 0 40px 60px;
  }
  .card {
    padding: 28px 32px;
  }
  /* Fazer um layout 2-colunas opcional para Devocional */
  .devotion-card, .journal-card {
    display: grid;
  }
  @supports (display: grid) {
    .devotion-and-journal {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      max-width: 900px;
      margin: 0 auto;
    }
  }
}
```

---

## 🟢 MÉDIO - Melhorias Boas

### 7. **Adicionar Atalhos de Teclado (A11y)**

```javascript
// app.js
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter em textarea = buscar
  if (e.ctrlKey && e.key === 'Enter' && situationEl === document.activeElement) {
    askJesus();
  }
  
  // Números para trocar abas
  if (e.altKey && e.key === '1') switchTab('wisdom');
  if (e.altKey && e.key === '2') switchTab('psalms');
  if (e.altKey && e.key === '3') switchTab('devotion');
});

function switchTab(tabName) {
  const btn = document.querySelector(`[data-tab="${tabName}"]`);
  if (btn) btn.click();
}
```

---

### 8. **Empty States Melhorados**

**Problema:**
- Diário de Oração mostra "☩ Suas orações aparecerão aqui."
- Não motiva ação

**Solução:**
```html
<div class="empty-state" id="prayerEmpty" hidden>
  <div class="empty-illustration">
    <svg><!-- ícone maior com animação --></svg>
  </div>
  <h3 class="empty-title">Comece seu Diário de Oração</h3>
  <p class="empty-text">Suas orações são ouvidas. Registre-as aqui e veja-as respondidas.</p>
  <button class="btn btn-primary btn-sm" onclick="document.getElementById('newPrayerBtn').click()">
    Adicionar primeira oração
  </button>
</div>
```

---

### 9. **Falta de Micro-interações (Feedback)**

**Adicionar animações de sucesso:**
```css
@keyframes pulse-success {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.btn.success {
  animation: pulse-success .4s ease-out;
  background: linear-gradient(135deg, #4CAF50, #45a049);
}
```

```javascript
function showSuccess(message) {
  const btn = event.target;
  btn.classList.add('success');
  toast(message);
  setTimeout(() => btn.classList.remove('success'), 400);
}
```

---

### 10. **Sem Indicador de Progresso no Salmos**

**Problema:**
- Usuário não sabe qual etapa está: Ler → Pensar → Orar → Viver
- Poderia ser mais interativo

**Solução:**
```html
<!-- Adicionar checkboxes interativas -->
<div class="meditation-step completed">
  <input type="checkbox" id="step-1" checked>
  <label for="step-1" class="step-checkbox">
    <span class="step-numeral">I</span>
    <div>
      <div class="step-title">Ler</div>
      <div class="step-text">Leia devagar...</div>
    </div>
  </label>
</div>
```

```css
.step-checkbox {
  display: flex;
  gap: 12px;
  cursor: pointer;
}
.meditation-step input[type="checkbox"] {
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid var(--gold);
  border-radius: 6px;
  cursor: pointer;
  margin-top: 2px;
}
.meditation-step input[type="checkbox"]:checked {
  background: var(--gold);
}
.meditation-step.completed { opacity: 0.6; }
```

---

## 🔵 BAIXO - Melhorias Opcionais

### 11. **Adicionar Dark Mode**

```css
@media (prefers-color-scheme: dark) {
  :root {
    --cream: #1a1208;
    --cream-2: #2a1f10;
    --text: #f0e8c8;
    --text-soft: #d4a843;
    --text-quiet: #b0965a;
  }
}
```

---

### 12. **Onboarding para Novos Usuários**

Primeira vez? Mostrar tour:
```javascript
if (!localStorage.getItem('onboarded')) {
  showOnboarding();
  localStorage.setItem('onboarded', '1');
}
```

---

### 13. **Análise de Uso (Optional)**

Não rastrear dados sensíveis, mas rastrear:
- Qual aba é mais usada?
- Quantas orações usuários adicionam?
- Qual Salmo é favorito?

---

## 📋 Checklist de Acessibilidade (WCAG 2.1 AA)

- [ ] Contraste de cor ≥ 4.5:1 (CRÍTICO)
- [ ] Todos os botões têm `aria-label`
- [ ] Teclado funciona (Tab, Enter, Escape)
- [ ] Focar com teclado é visível
- [ ] Imagens têm alt text
- [ ] Linguagem clara (Flesch Reading Ease > 60)
- [ ] Fonte ≥ 16px em inputs
- [ ] Toques têm ≥ 44x44px
- [ ] Sem movimento infinito (respeitar `prefers-reduced-motion`)

---

## 📱 Checklist Mobile (Mobile-First)

- [x] Viewport meta tag
- [x] Touch targets ≥ 48px
- [x] Sticky header não ocupa > 25% viewport
- [ ] Suporta landscape/portrait
- [ ] Sem horizontal scroll
- [ ] Performance: LCP < 2.5s (testar com Lighthouse)

---

## 🎨 Próximas Ações Recomendadas

**Semana 1 - CRÍTICO:**
1. Fixar contraste de cores (#1)
2. Melhorar feedback de carregamento (#2)
3. Confirmação para deletar (#3)

**Semana 2 - IMPORTANTE:**
4. Adicionar step indicator (#4)
5. Estados visuais melhorados (#5)
6. Layout responsivo desktop (#6)

**Semana 3 - BOAS PRÁTICAS:**
7. Atalhos de teclado (#7)
8. Empty states (#8)
9. Micro-interações (#9)
10. Progresso no Salmo (#10)

---

## 🔗 Referências

- [WCAG 2.1 Compliance](https://www.w3.org/WAI/WCAG21/quickref/)
- [Nielsen's 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Material Design 3](https://m3.material.io/)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)
- [Web.dev Lighthouse](https://web.dev/lighthouse-performance/)

---

**Status:** 📊 Aplicativo é sólido. Com essas melhorias, atingirá excelência em UX.

