const storageKey = 'lfnyc-acquisition-ad-choices-20260909';
let saved = [];
try { const value = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(value)) saved = [...new Set(value.filter(id => /^(0[1-9]|1[0-9]|20)$/.test(id)))]; } catch { /* Optional local preferences. */ }
let onlySaved = false;
function update() {
 document.querySelectorAll('[data-save]').forEach(button => { const yes = saved.includes(button.dataset.save); button.setAttribute('aria-pressed', String(yes)); button.textContent = yes ? 'Saved choice' : 'Save choice'; });
 document.querySelectorAll('article[data-id]').forEach(card => { card.hidden = onlySaved && !saved.includes(card.dataset.id); });
 const count = document.querySelector('#choice-count'); if (count) count.textContent = saved.length + ' saved';
 const visible = document.querySelector('#visible-count'); if (visible) visible.textContent = (onlySaved ? saved.length : 20) + ' designs';
 const empty = document.querySelector('#empty'); if (empty) empty.hidden = !(onlySaved && saved.length === 0);
}
document.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => { const id = button.dataset.save; saved = saved.includes(id) ? saved.filter(x => x !== id) : saved.concat(id); try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* Choices still work for this visit. */ } update(); }));
document.querySelectorAll('[data-show]').forEach(button => button.addEventListener('click', () => { onlySaved = button.dataset.show === 'saved'; document.querySelectorAll('[data-show]').forEach(x => x.setAttribute('aria-pressed', String(x === button))); update(); }));
document.querySelectorAll('.copy').forEach(button => button.addEventListener('click', async () => {
 const target = document.getElementById(button.dataset.copy);
 try { await navigator.clipboard.writeText(target.textContent); button.textContent = 'Copied'; document.querySelector('#copy-status').textContent = 'Copied to clipboard.'; }
 catch { const range = document.createRange(); range.selectNodeContents(target); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); button.textContent = 'Text selected'; document.querySelector('#copy-status').textContent = 'Text selected. Use your device’s copy command.'; }
}));
update();
