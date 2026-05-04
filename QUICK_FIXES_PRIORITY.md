# ⚡ Quick Fixes - Prioridade Imediata

## 🔴 HOJE - 30 minutos (Crítico)

### Fix #1: Contraste de Cores
**Arquivo:** `styles.css`

Substituir:
```css
/* ANTES */
--text-quiet:   #8a6820;
--text-soft:    #6a4820;

/* DEPOIS */
--text-quiet:   #5a4820;  /* mais escuro */
--text-soft:    #4a3a0e;  /* mais escuro */
```

**Por quê:** Usuários com deficiência visual ou em celular ao sol não conseguem ler.

---

### Fix #2: Feedback Visual ao Carregar
**Arquivo:** `app.js` - Função `askJesus()`

Adicionar após `showLoading(true);`:
```javascript
function showLoading(show) {
  loadingEl.hidden = !show;
  if (show) {
    askBtn.disabled = true;
    const label = askBtn.querySelector('span:last-child');
    label.textContent = 'Buscando…';
    askBtn.style.opacity = '0.6';
  } else {
    askBtn.disabled = false;
    askBtn.style.opacity = '1';
    const label = askBtn.querySelector('span:last-child');
    label.textContent = 'Buscar Sabedoria';
  }
  // ... resto
}
```

**Por quê:** Usuário não sabe se está "esperando" ou "erro".

---

### Fix #3: Confirmação ao Deletar
**Arquivo:** `app.js` - Linha 639

Mudar de:
```javascript
li.querySelector('.delete-btn').addEventListener('click', () => {
  prayers = prayers.filter(x => x !== p);
```

Para:
```javascript
li.querySelector('.delete-btn').addEventListener('click', () => {
  if (!confirm('Deletar esta oração?')) return;
  prayers = prayers.filter(x => x !== p);
```

**Por quê:** Evitar deletar por acidente.

---

## 🟡 SEMANA 1 - 2 horas (Alto Impacto)

### Fix #4: Step Indicator (Aba Sabedoria)
Mostrar visualmente: "Passo 1 de 2" → melhora compreensão do fluxo.

**Arquivos:** `index.html` + `styles.css`

[Vide UX_DESIGN_RECOMMENDATIONS.md seção #4]

---

### Fix #5: Visual de Oração Respondida
```css
.prayer-item.answered {
  background: rgba(76, 175, 80, 0.08);
  border-left: 4px solid #4CAF50;
}
.prayer-item.answered .prayer-text {
  opacity: 0.7;
  text-decoration: line-through;
}
```

---

### Fix #6: Layout Desktop
```css
@media (min-width: 768px) {
  .tabs-header { max-width: 640px; }
  .tab-content { max-width: 680px; }
  .card { padding: 28px 32px; }
}
```

---

## 📈 Ordem Recomendada de Implementação

```
┌─────────────────────────────────┐
│ FIX #1: Contraste (5 min)       │ ← FAÇA PRIMEIRO
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ FIX #2: Feedback Loading (10 min)│
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ FIX #3: Confirmação (5 min)      │
└──────────────┬──────────────────┘
               ↓
       ✅ HOJE TERMINADO (20 min)
               ↓
┌─────────────────────────────────┐
│ FIX #4-6: Polimento (2h mais)   │
└─────────────────────────────────┘
```

---

## 🧪 Como Testar Suas Mudanças

### Testar Contraste
```bash
# Lighthouse no Chrome DevTools
F12 → Lighthouse → Accessibility
# Procure por "Color and contrast"
```

### Testar Acessibilidade
```
F12 → Accessibility Tree
- Tab: todos os botões devem ser navegáveis
- Enter: botões devem funcionar
- Screen reader: https://nvaccess.org/
```

### Testar Mobile
```
F12 → Toggle device toolbar (Ctrl+Shift+M)
- iPhone 12 (390x844)
- Pixel 5 (393x851)
- iPad (768x1024)
```

---

## 💾 Antes de Commitar

- [ ] Contraste verificado (Lighthouse)
- [ ] Testado em mobile
- [ ] Testado com teclado
- [ ] Nenhuma mensagem de erro no console
- [ ] Funcionou no navegador (Chrome, Safari, Firefox, Edge)

```bash
# Verificar antes de git push
npm run test  # ou seu test script
# Testar localmente: vercel dev
```

---

## 📊 Impacto Esperado

| Fix | Impacto | Esforço | ROI |
|-----|---------|---------|-----|
| #1 Contraste | 📈 Legibilidade +70% | 5 min | Muito Alto |
| #2 Feedback | 📈 Confiança UX | 10 min | Alto |
| #3 Confirm | 📈 Reduz erros | 5 min | Médio |
| #4 Steps | 📈 Novos usuários | 45 min | Alto |
| #5 Visual | 📈 Clareza | 20 min | Médio |
| #6 Desktop | 📈 Responsive | 30 min | Médio |

**Tempo total:** ~1.5 horas → **Melhoria de 40-50% em UX**

