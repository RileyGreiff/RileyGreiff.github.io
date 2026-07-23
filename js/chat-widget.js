/*
 * Portfolio Chat Widget
 * A floating assistant that answers questions about Riley's work via the RAG backend.
 * Self-contained: builds its own DOM, streams responses, renders cited sources.
 *
 * SETUP: set BACKEND_URL to your deployed Vercel app's origin (no trailing slash).
 */
(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  // After deploying the rag-portfolio app to Vercel, put its URL here, e.g.
  // 'https://rag-portfolio-riley.vercel.app'. Until then the widget shows a
  // friendly "not configured yet" message instead of erroring.
  var BACKEND_URL = 'https://rag-portfolio-mu.vercel.app';

  var STARTERS = [
    'What has Riley built with LLMs?',
    "What's Riley's ML infrastructure experience?",
    'Tell me about the interpretability research',
    'What did Riley do before ML?'
  ];

  var MAX_INPUT = 2000;
  var configured = BACKEND_URL.indexOf('REPLACE-WITH') === -1;

  // ── State ─────────────────────────────────────────────────────────────────
  var messages = []; // { role, content, sources? }
  var busy = false;

  // ── DOM refs (assigned in build) ──────────────────────────────────────────
  var fab, panel, messagesEl, input, sendBtn, errorEl;

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function build() {
    // Floating action button
    fab = el('button', 'cw-fab');
    fab.setAttribute('aria-label', 'Ask AI about Riley');
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '<span>Ask AI</span>';
    fab.addEventListener('click', open);

    // Panel shell
    panel = el('div', 'cw-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Portfolio assistant');

    var header = el('div', 'cw-header');
    var titleWrap = el('div');
    titleWrap.appendChild(el('div', 'cw-header__title', 'Ask about Riley'));
    titleWrap.appendChild(
      el('div', 'cw-header__subtitle', 'Grounded in his projects & resume')
    );
    var closeBtn = el('button', 'cw-close');
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', close);
    header.appendChild(titleWrap);
    header.appendChild(closeBtn);

    messagesEl = el('div', 'cw-messages');

    var form = el('form', 'cw-form');
    input = el('input', 'cw-input');
    input.type = 'text';
    input.placeholder = 'e.g. What did the KV-cache research find?';
    input.maxLength = MAX_INPUT;
    sendBtn = el('button', 'cw-send', 'Ask');
    sendBtn.type = 'submit';
    form.appendChild(input);
    form.appendChild(sendBtn);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send(input.value);
    });

    panel.appendChild(header);
    panel.appendChild(messagesEl);
    panel.appendChild(form);

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    renderMessages();
  }

  function open() {
    panel.classList.add('cw-open');
    fab.classList.add('cw-hidden');
    input.focus();
  }

  function close() {
    panel.classList.remove('cw-open');
    fab.classList.remove('cw-hidden');
  }

  function renderMessages() {
    messagesEl.innerHTML = '';

    if (messages.length === 0) {
      var wrap = el('div', 'cw-starters');
      STARTERS.forEach(function (s) {
        var b = el('button', 'cw-starter', s);
        b.type = 'button';
        b.addEventListener('click', function () {
          send(s);
        });
        wrap.appendChild(b);
      });
      messagesEl.appendChild(wrap);
    }

    messages.forEach(function (m) {
      var bubble = el(
        'div',
        'cw-msg ' + (m.role === 'user' ? 'cw-msg--user' : 'cw-msg--assistant')
      );
      bubble.textContent = m.content || (busy ? '…' : '');

      if (m.role === 'assistant' && m.content && m.sources && m.sources.length) {
        var src = el('div', 'cw-sources');
        m.sources.forEach(function (s) {
          var a = el('a', 'cw-source', s.title);
          a.href = s.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          src.appendChild(a);
        });
        bubble.appendChild(src);
      }
      messagesEl.appendChild(bubble);
    });

    if (errorEl) {
      messagesEl.appendChild(errorEl);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showError(text) {
    errorEl = el('div', 'cw-error', '');
    errorEl.textContent = text;
    renderMessages();
  }

  async function send(question) {
    var text = (question || '').trim();
    if (!text || busy) return;

    if (!configured) {
      messages.push({ role: 'user', content: text });
      messages.push({
        role: 'assistant',
        content:
          "This assistant isn't connected to its backend yet. Once the RAG API is " +
          'deployed, set BACKEND_URL in js/chat-widget.js and it will answer from ' +
          "Riley's projects and resume."
      });
      renderMessages();
      input.value = '';
      return;
    }

    errorEl = null;
    busy = true;
    input.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = 'Thinking…';

    var history = messages.concat([{ role: 'user', content: text }]);
    messages = history.concat([{ role: 'assistant', content: '' }]);
    renderMessages();

    try {
      var res = await fetch(BACKEND_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(-10).map(function (m) {
            return { role: m.role, content: m.content };
          })
        })
      });

      if (!res.ok || !res.body) {
        var detail = await res.json().catch(function () {
          return null;
        });
        throw new Error((detail && detail.error) || 'Request failed (' + res.status + ')');
      }

      var sources = [];
      try {
        sources = JSON.parse(decodeURIComponent(res.headers.get('X-Sources') || '%5B%5D'));
      } catch (e) {
        sources = [];
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var answer = '';
      for (;;) {
        var chunk = await reader.read();
        if (chunk.done) break;
        answer += decoder.decode(chunk.value, { stream: true });
        messages[messages.length - 1] = {
          role: 'assistant',
          content: answer,
          sources: sources
        };
        renderMessages();
      }
    } catch (err) {
      messages = history; // drop the empty assistant bubble
      showError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      busy = false;
      sendBtn.disabled = false;
      sendBtn.textContent = 'Ask';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
