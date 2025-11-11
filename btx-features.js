

(() => {
  
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const debounce = (fn, t = 150) => {
    let h;
    return (...args) => {
      clearTimeout(h);
      h = setTimeout(() => fn.apply(null, args), t);
    };
  };

  
  
  
  
  const BTX_DEFAULT_COLOURS = [
    '#D76666', '#E07D70', '#E2956F', '#E5B56E', '#E2BC85',
    '#D6DB7D', '#B3DD7C', '#9AE27D', '#90E27D', '#86E27D'
  ];

  
  function extractTrackRating(row) {
    if (!row) return NaN;
    
    const trEl = row.querySelector('.trackRating');
    if (trEl) {
      const val = parseFloat((trEl.textContent || '').trim());
      if (!Number.isNaN(val) && val >= 0 && val <= 100) return val;
    }
    
    const anchors = row.querySelectorAll('a[title]');
    for (const a of anchors) {
      const title = a.getAttribute('title');
      if (title) {
        const v = parseFloat(title);
        if (!Number.isNaN(v) && v >= 0 && v <= 100) return v;
      }
    }
    
    const scoreEls = row.querySelectorAll('.rating, .score, .trackScore, .songScore, .userScore, .criticScore, .albumUserScore, .albumCriticScore');
    for (const el of scoreEls) {
      const txt = (el.textContent || '').trim();
      const v = parseFloat(txt);
      if (!Number.isNaN(v) && v >= 0 && v <= 100) return v;
    }
    
    const bar = row.querySelector('.ratingBar div');
    if (bar && bar.style && bar.style.width) {
      const w = parseFloat(bar.style.width);
      if (!Number.isNaN(w) && w >= 0 && w <= 100) return w;
    }
    
    const text = (row.textContent || '').trim();
    const re = /\b(\d{2,3})\b/g;
    let match;
    while ((match = re.exec(text))) {
      const numStr = match[1];
      const num = parseInt(numStr, 10);
      
      if (num <= 10 || num > 100) continue;
      const start = match.index;
      const end = start + numStr.length;
      const before = text[start - 1];
      const after = text[end];
      
      if (before === ':' || after === ':') continue;
      return num;
    }
    return NaN;
  }

  
  function boot() {
    
    
    
    
    if (isFeatureEnabled('reveal')) {
      setupScrollReveal();
    }
    if (isFeatureEnabled('tooltip')) {
      setupScoreTooltips();
    }
    if (isFeatureEnabled('compare')) {
      setupQuickCompare();
    }
    if (isFeatureEnabled('profile')) {
      setupMiniProfileCards();
    }

    
    
    
    
    
    applyUnroundedScores(isFeatureEnabled('unrounded'));

    
    
    applyBestTracksHighlight(isFeatureEnabled('besttracks'));

    
    
    
    
    if (isFeatureEnabled('artistavg')) {
      setupArtistAverage();
    }

    
    
    
    if (isFeatureEnabled('tracksort')) {
      setupTrackSorter();
    }

    
    
    
    
    applyRatingColours(isFeatureEnabled('colors'));
    
    
    styleActionButtons();
    
    setupUnderline();
    
    setupTilt();

    
    
    
    
    
    
    applyHideRatings();

    
    
    
    
    
    
    setupTrackAverage();
    
    ensureSettingsUI();

    
    
    
    
    
    
    setupSpotifyStats();

    
    
    
    
    
    try {
      const done = localStorage.getItem('btx-onboarding-done');
      if (!done) {
        showOnboarding();
      }
    } catch (err) {
      
      showOnboarding();
    }
  }

  
  function isFeatureEnabled(key) {
    try {
      const value = localStorage.getItem('btx-feature-' + key);
      if (value === null) return true;
      return value === 'true';
    } catch (err) {
      return true;
    }
  }

  
  function applyPageEnter() {
    document.body.classList.add('btx-enter');
    setTimeout(() => {
      document.body.classList.remove('btx-enter');
    }, 400);
  }

  
  function setupScrollReveal() {
    
    const candidates = $$('section, .albumBlock, .releaseBlock, .gridItem, .albumRow, .albumRowLarge, .rightBox, .albumReviewRow').filter(
      el => !el.classList.contains('btx-reveal')
    );
    candidates.forEach(el => el.classList.add('btx-reveal'));

    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('btx-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '48px', threshold: 0.12 });

    candidates.forEach(el => observer.observe(el));
  }

  
  let tooltipEl;
  function setupScoreTooltips() {
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'btx-tip';
      tooltipEl.style.display = 'none';
      document.body.appendChild(tooltipEl);
    }
    
    
    
    
    
    
    const nodes = $$(
      '.criticScore, .userScore, .ratingText, [class*="score" i]'
    ).filter(node => {
      
      const txt = (node.textContent || '').trim();
      if (node.dataset.btxScore) return false;
      
      if (/^[0-9]{1,3}$/.test(txt) || txt.length <= 6) return true;
      return false;
    });
    nodes.forEach(node => {
      node.dataset.btxScore = 'true';
      on(node, 'mouseenter', e => {
        const text = node.textContent.trim();
        
        
        const parent = node.closest(
          '.albumTopBox, .albumBlock, .releaseBlock, .albumRow, .albumRowLarge, body'
        );
        const bodyText = parent ? parent.textContent : document.body.textContent;
        const match = (bodyText.match(/Based on\s+([\d,]+)\s+(ratings|reviews)/i) || []);
        const count = match[1];
        
        
        tooltipEl.innerHTML = `<strong>${text}</strong>${count ? `<div>${count} ratings</div>` : ''}`;
        tooltipEl.style.display = 'block';
        moveTip(e);
      });
      on(node, 'mousemove', moveTip);
      on(node, 'mouseleave', () => {
        tooltipEl.style.display = 'none';
      });
    });
    function moveTip(e) {
      tooltipEl.style.left = `${e.clientX}px`;
      tooltipEl.style.top = `${e.clientY - 12}px`;
    }
  }

  
  const compareCache = new Map();
  function setupQuickCompare() {
    const cards = $$(
      '.albumBlock, .releaseBlock, .gridItem, .albumRow, .albumRowLarge'
    ).filter(el => !el.dataset.btxCompare);
    cards.forEach(card => {
      card.dataset.btxCompare = 'true';
      on(card, 'mouseenter', async () => {
        
        if (card.querySelector('.btx-compare')) return;
        const year = inferYear(card) || new Date().getFullYear();
        const top = await getTopUserScore(year);
        const userScore = extractUserScore(card);
        if (!top || typeof userScore !== 'number') return;
        const delta = Math.round((userScore - top.score) * 10) / 10;
        const badge = document.createElement('div');
        badge.className = 'btx-compare ' + (delta >= 0 ? 'up' : 'down');
        badge.textContent = `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)} vs #1 ${year}`;
        card.style.position = 'relative';
        card.appendChild(badge);
      });
      on(card, 'mouseleave', () => {
        const badge = card.querySelector('.btx-compare');
        if (badge) badge.remove();
      });
    });

    function inferYear(el) {
      
      const container = el.closest('section, .fullWidth, body');
      const text = container ? container.textContent : '';
      const match = text.match(/\b(20[0-4]\d)\b/);
      return match ? +match[1] : null;
    }
    function extractUserScore(card) {
      const text = card.textContent;
      const m = text.match(/user\s*score[^0-9]*([0-9]{1,3})/i) || text.match(/\b([0-9]{2,3})\b/);
      const n = m ? +m[1] : null;
      return n && n <= 100 ? n : null;
    }
    async function getTopUserScore(year) {
      if (compareCache.has(year)) return compareCache.get(year);
      try {
        const res = await fetch(
          `https://www.albumoftheyear.org/ratings/user-highest-rated/${year}/`,
          { credentials: 'include' }
        );
        const html = await res.text();
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const first = dom.querySelector(
          '.albumBlock, .releaseBlock, .albumRow, .albumRowLarge'
        );
        if (!first) return null;
        const t = first.textContent;
        const m = t.match(/user\s*score[^0-9]*([0-9]{1,3})/i) || t.match(/\b([0-9]{2,3})\b/);
        const s = m ? +m[1] : null;
        const score = s && s <= 100 ? s : null;
        const out = score !== null ? { score } : null;
        compareCache.set(year, out);
        return out;
      } catch (err) {
        return null;
      }
    }
  }

  
  let profileCard;
  let profileAbort;
  function setupMiniProfileCards() {
    if (!profileCard) {
      profileCard = document.createElement('div');
      profileCard.className = 'btx-pcard';
      profileCard.style.display = 'none';
      document.body.appendChild(profileCard);
    }
    const links = $$(
      'a[href*="/user/"], a[href*="/profile/"]'
    ).filter(link => !link.dataset.btxProfile && link.textContent.trim());
    links.forEach(link => {
      link.dataset.btxProfile = 'true';
      on(link, 'mouseenter', async e => {
        positionCard(e);
        profileCard.style.display = 'grid';
        profileCard.innerHTML = '<div style="grid-column:1/-1;color:#9aa0a6">Loading…</div>';
        
        if (profileAbort) profileAbort.abort();
        profileAbort = new AbortController();
        try {
          const res = await fetch(link.href, { signal: profileAbort.signal });
          const html = await res.text();
          const dom = new DOMParser().parseFromString(html, 'text/html');
          const avatar = dom.querySelector('.profilePic img, img[src*="avatar"]');
          const ratings = (dom.body.textContent.match(/(\d+)\s+ratings/i) || [])[1] || '—';
          const reviews = (dom.body.textContent.match(/(\d+)\s+reviews/i) || [])[1] || '—';
          profileCard.innerHTML = `
            <img src="${avatar ? avatar.src : ''}" alt="">
            <div>
              <div class="btx-pname">${link.textContent.trim()}</div>
              <div class="btx-pmeta">${ratings} ratings • ${reviews} reviews</div>
              <div class="btx-pmeta">View profile →</div>
            </div>
          `;
        } catch (err) {
          
        }
      });
      on(link, 'mousemove', positionCard);
      on(link, 'mouseleave', () => {
        if (profileAbort) profileAbort.abort();
        profileCard.style.display = 'none';
      });
    });
    function positionCard(e) {
      profileCard.style.left = `${e.clientX + 16}px`;
      profileCard.style.top = `${e.clientY + 16}px`;
    }
  }

  
  function setupViewToggle() {
    
    if (document.querySelector('.btx-toolbar')) return;
    
    
    const anchor = document.querySelector('[data-current="albums"]')?.closest('div') ||
      document.querySelector('.fullWidth') ||
      document.querySelector('h1, h2') ||
      document.getElementById('content') || document.body;
    const bar = document.createElement('div');
    bar.className = 'btx-toolbar';
    bar.innerHTML = `
      <button class="btx-btn" data-view="grid" aria-pressed="${!document.body.classList.contains('btx-compact')}">Grid</button>
      <button class="btx-btn" data-view="compact" aria-pressed="${document.body.classList.contains('btx-compact')}">Compact</button>
    `;
    
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    const [gridBtn, compactBtn] = bar.querySelectorAll('.btx-btn');
    on(bar, 'click', e => {
      const btn = e.target.closest('.btx-btn');
      if (!btn) return;
      const compact = btn.dataset.view === 'compact';
      document.body.classList.toggle('btx-compact', compact);
      gridBtn.setAttribute('aria-pressed', String(!compact));
      compactBtn.setAttribute('aria-pressed', String(compact));
      
      setupScrollReveal();
    });
  }

  
  function styleActionButtons() {
    ['rate', 'post'].forEach(id => {
      const inner = document.getElementById(id);
      if (!inner) return;
      const parent = inner.closest('button');
      if (!parent) return;
      if (parent.dataset.btxStyled) return;
      parent.dataset.btxStyled = 'true';
      parent.classList.add('smallButton');
      parent.classList.add('btx-pill');
      parent.textContent = inner.textContent.trim();
      inner.style.display = 'none';
      
      
      parent.style.color = '#808080';
      parent.addEventListener('mouseenter', () => parent.style.color = '#ffffff');
      parent.addEventListener('mouseleave', () => parent.style.color = '#808080');
    });
  }

  
  function setupUnderline() {
    
    
    const navLinks = $$('#nav a, .nav a, .navBlock a').filter(a => {
      
      if (a.dataset.btxUnderline) return false;
      
      if (a.closest('.navBlock.profile')) return false;
      const href = a.getAttribute('href') || '';
      
      if (/\/user\
      return true;
    });
    navLinks.forEach(a => {
      a.dataset.btxUnderline = 'true';
      a.classList.add('btx-underline');
    });
  }

  
  function setupTilt() {
    
    
    
    document.body.classList.remove('btx-tilt-enabled');
  }

  
  function applyHideRatings() {
    try {
      
      
      
      const value = localStorage.getItem('btx-feature-hide-ratings');
      const enabled = value === 'true';
      document.body.classList.toggle('btx-hide-ratings', enabled);
    } catch (err) {
      
      document.body.classList.remove('btx-hide-ratings');
    }
  }

  
  function setupTrackAverage() {
    
    if (document.querySelector('.btx-track-average')) return;
    
    
    
    
    
    const allInputs = $$('input');
    const ratingInputs = allInputs.filter(inp => {
      const type = (inp.getAttribute('type') || '').toLowerCase();
      const maxAttr = inp.getAttribute('max');
      const max = maxAttr ? parseFloat(maxAttr) : NaN;
      const placeholder = inp.getAttribute('placeholder') || '';
      const maxOk = (type === 'number' && !Number.isNaN(max) && Math.abs(max - 10) < 0.01);
      const phOk = /0\s*[-–]\s*10/.test(placeholder);
      return maxOk || phOk;
    });
    
    
    if (ratingInputs.length < 3) return;
    
    const avgEl = document.createElement('div');
    avgEl.className = 'btx-track-average';
    avgEl.textContent = 'Average: —';
    
    
    const lastInput = ratingInputs[ratingInputs.length - 1];
    const parent = lastInput.parentElement || document.body;
    parent.appendChild(avgEl);
    
    function compute() {
      let sum = 0;
      let count = 0;
      ratingInputs.forEach(inp => {
        const val = parseFloat(inp.value);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      const avg = count ? (sum / count).toFixed(2) : '—';
      avgEl.textContent = `Average: ${avg}`;
    }
    
    ratingInputs.forEach(inp => {
      on(inp, 'input', compute);
      on(inp, 'change', compute);
    });
    
    compute();
  }

  
  function applyUnroundedScores(enabled) {
    
    
    
    const selectors = [
      '.criticScore', '.userScore', '.ratingText',
      '.scoreBox', '.albumRating',
      '.userScoreBox .score', '.criticScoreBox .score'
    ];
    const nodes = $$(selectors.join(','));
    
    const anchors = $$('a[title]');
    anchors.forEach(a => {
      const parent = a.closest('.albumUserScore, .albumCriticScore, .userScore, .criticScore, .albumUserScoreBox, .albumCriticScoreBox');
      if (parent) nodes.push(a);
    });
    nodes.forEach(node => {
      const currentText = (node.textContent || '').trim();
      if (enabled) {
        if (!node.dataset.btxOriginalScore) {
          node.dataset.btxOriginalScore = currentText;
        }
        let dec = null;
        
        const titleAttr = node.getAttribute('title') || node.getAttribute('aria-label') || '';
        let m = titleAttr.match(/([0-9]{1,3}\.[0-9])/);
        if (m) {
          dec = m[1];
        }
        
        if (!dec) {
          let p = node.parentElement;
          while (p && p !== document && !dec) {
            const t = p.getAttribute && p.getAttribute('title');
            if (t) {
              const mm = t.match(/([0-9]{1,3}\.[0-9])/);
              if (mm) dec = mm[1];
            }
            p = p.parentElement;
          }
        }
        
        if (!dec) {
          const dt = node.dataset.tip || node.dataset.tooltip || '';
          const mm2 = dt.match(/([0-9]{1,3}\.[0-9])/);
          if (mm2) dec = mm2[1];
        }
        
        if (!dec && /^\d+$/.test(currentText)) {
          dec = currentText + '.0';
        }
        if (dec && currentText !== dec) {
          
          
          node.textContent = dec + '\u00A0';
          
          
          
          node.classList.add('btx-unrounded-score');
          
          
          
          
          const container = node.closest('.albumUserScore, .albumCriticScore, .userScore, .criticScore');
          if (container && container.parentElement) {
            const sibs = Array.from(container.parentElement.children);
            sibs.forEach(sib => {
              if (sib.classList && sib.classList.contains('text')) {
                if (sib.classList.contains('numReviews') || sib.classList.contains('gray')) {
                  if (sib.dataset.btxOrigMarginLeft === undefined) {
                    const style = window.getComputedStyle(sib);
                    sib.dataset.btxOrigMarginLeft = style && style.marginLeft ? style.marginLeft : '';
                  }
                  sib.style.marginLeft = '6px';
                }
              }
            });
          }
        }
      } else {
        const orig = node.dataset.btxOriginalScore;
        if (orig) {
          node.textContent = orig;
        }
        
        node.classList.remove('btx-unrounded-score');
        
        const container = node.closest('.albumUserScore, .albumCriticScore, .userScore, .criticScore');
        if (container && container.parentElement) {
          const sibs = Array.from(container.parentElement.children);
          sibs.forEach(sib => {
            if (sib.classList && sib.classList.contains('text')) {
              if (sib.classList.contains('numReviews') || sib.classList.contains('gray')) {
                if (sib.dataset.btxOrigMarginLeft !== undefined) {
                  sib.style.marginLeft = sib.dataset.btxOrigMarginLeft;
                }
              }
            }
          });
        }
      }
    });

    
    
    
    
    
    
    
    const reviewEls = $$('.text.numReviews, .text.gray');
    reviewEls.forEach(el => {
      if (enabled) {
        if (el.dataset.btxOrigMarginLeftGlobal === undefined) {
          const style = window.getComputedStyle(el);
          el.dataset.btxOrigMarginLeftGlobal = style && style.marginLeft ? style.marginLeft : '';
        }
        
        
        el.style.marginLeft = '8px';
      } else {
        if (el.dataset.btxOrigMarginLeftGlobal !== undefined) {
          el.style.marginLeft = el.dataset.btxOrigMarginLeftGlobal;
          delete el.dataset.btxOrigMarginLeftGlobal;
        }
      }
    });
  }

  
  function getBestTrackThresholds() {
    let score = parseFloat(localStorage.getItem('btx-best-score'));
    let count = parseInt(localStorage.getItem('btx-best-count'), 10);
    if (Number.isNaN(score)) score = 80;
    if (Number.isNaN(count)) count = 10;
    return { score, count };
  }

  
  function applyBestTracksHighlight(enabled) {
    
    
    
    const rows = $$('tr, .trackRow, .songRow, .albumSongRow, .track');
    if (rows.length === 0) return;
    const { score: threshScore, count: threshCount } = getBestTrackThresholds();
    rows.forEach(row => {
      
      const rating = extractTrackRating(row);
      
      let count = 0;
      const countMatch = (row.textContent || '').match(/([\d,]+)\s*(ratings|reviews|votes)/i);
      if (countMatch) {
        count = parseInt(countMatch[1].replace(/,/g, ''), 10);
      }
      if (enabled && !Number.isNaN(rating) && rating >= threshScore && (count >= threshCount || !countMatch)) {
        row.classList.add('btx-best-track');
      } else {
        row.classList.remove('btx-best-track');
      }
    });
  }

  
  function setupArtistAverage() {
    
    if (document.querySelector('.btx-artist-avg')) return;
    const path = location.pathname || '';
    if (!/\/artist\
    
    const releaseBlocks = $$('.albumBlock, .releaseBlock, .albumRow, .albumRowLarge, .albumItem, .artistAlbum, .album, .release, .releaseRow');
    let userSum = 0, userCount = 0;
    let criticSum = 0, criticCount = 0;
    releaseBlocks.forEach(block => {
      
      
      
      
      const userSelectors = [
        '.albumUserScore a[title]',
        '.userScore a[title]',
        '.albumUserScore',
        '.userScore',
        '.userScoreBox .score',
        '.userScoreBox'
      ];
      let foundUser;
      for (const sel of userSelectors) {
        const el = block.querySelector(sel);
        if (el) {
          if (el.matches('a[title]')) {
            const v = parseFloat(el.getAttribute('title'));
            if (!Number.isNaN(v)) {
              foundUser = v;
              break;
            }
          }
          const v = parseFloat((el.textContent || '').trim());
          if (!Number.isNaN(v)) {
            foundUser = v;
            break;
          }
        }
      }
      if (foundUser !== undefined) {
        userSum += foundUser;
        userCount++;
      }
      
      const criticSelectors = [
        '.albumCriticScore a[title]',
        '.criticScore a[title]',
        '.albumCriticScore',
        '.criticScore',
        '.criticScoreBox .score',
        '.criticScoreBox'
      ];
      let foundCritic;
      for (const sel of criticSelectors) {
        const el = block.querySelector(sel);
        if (el) {
          if (el.matches('a[title]')) {
            const v = parseFloat(el.getAttribute('title'));
            if (!Number.isNaN(v)) {
              foundCritic = v;
              break;
            }
          }
          const v = parseFloat((el.textContent || '').trim());
          if (!Number.isNaN(v)) {
            foundCritic = v;
            break;
          }
        }
      }
      if (foundCritic !== undefined) {
        criticSum += foundCritic;
        criticCount++;
      }
    });
    if (userCount === 0 && criticCount === 0) return;
    const avgUser = userCount ? (userSum / userCount).toFixed(1) : null;
    const avgCritic = criticCount ? (criticSum / criticCount).toFixed(1) : null;
    const avgEl = document.createElement('div');
    avgEl.className = 'btx-artist-avg';
    let html = '';
    if (avgUser) html += `<span>User avg: ${avgUser}</span>`;
    if (avgCritic) {
      if (html) html += ' | ';
      html += `<span>Critic avg: ${avgCritic}</span>`;
    }
    avgEl.innerHTML = html;
    
    
    const header = document.querySelector('.artistHeader, .header, h1, .artist-title');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(avgEl, header.nextSibling);
    } else {
      document.body.insertBefore(avgEl, document.body.firstChild);
    }
  }

  
  function setupTrackSorter() {
    
    
    
    
    
    return;
  }

  
  function getRatingColour(score) {
    let idx;
    if (score < 10) idx = 0;
    else if (score >= 90) idx = 9;
    else idx = Math.floor(score / 10);
    const key = 'btx-col-' + idx;
    let col = localStorage.getItem(key);
    if (!col) col = BTX_DEFAULT_COLOURS[idx] || '#ffffff';
    return col;
  }

  
  function applyRatingColours(enabled) {
    
    
    
    
    
    const barEls = $$('.ratingBar div');
    barEls.forEach(bar => {
      
      let val;
      const widthStr = bar.style && bar.style.width;
      if (widthStr && widthStr.includes('%')) {
        const perc = parseFloat(widthStr);
        if (!Number.isNaN(perc)) val = perc;
      }
      
      if (val === undefined) {
        let p = bar.closest('.albumUserScore, .albumCriticScore, .userScore, .criticScore, .trackRow, .songRow, .albumSongRow, .track');
        if (p) {
          const anchor = p.querySelector('a[title]');
          if (anchor) {
            const v = parseFloat(anchor.getAttribute('title'));
            if (!Number.isNaN(v)) val = v;
          }
          if (val === undefined) {
            
            const txt = (p.textContent || '').trim();
            const m = txt.match(/\b(\d{2,3})\b/);
            if (m) {
              const n = parseInt(m[1], 10);
              if (!Number.isNaN(n)) val = n;
            }
          }
        }
      }
      if (Number.isNaN(val) || val === undefined) return;
      if (enabled) {
          if (bar.dataset.btxOrigBg === undefined) {
            const style = window.getComputedStyle(bar);
            bar.dataset.btxOrigBg = style && style.backgroundColor ? style.backgroundColor : '';
          }
          const col = getRatingColour(val);
          bar.style.backgroundColor = col;
      } else {
          if (bar.dataset.btxOrigBg !== undefined) {
            bar.style.backgroundColor = bar.dataset.btxOrigBg;
          }
      }
    });

    
    
    
    
    const textSelectors = [
      '.trackRow .rating', '.songRow .rating', '.albumSongRow .rating', '.track .rating',
      '.trackRow .score', '.songRow .score', '.albumSongRow .score', '.track .score',
      '.trackRow .trackScore', '.songRow .trackScore', '.albumSongRow .trackScore', '.track .trackScore',
      '.trackRow .songScore', '.songRow .songScore', '.albumSongRow .songScore', '.track .songScore',
      '.trackRow .userScore', '.songRow .userScore', '.albumSongRow .userScore', '.track .userScore',
      '.trackRow .criticScore', '.songRow .criticScore', '.albumSongRow .criticScore', '.track .criticScore',
      '.trackRow .albumUserScore', '.songRow .albumUserScore', '.albumSongRow .albumUserScore', '.track .albumUserScore',
      '.trackRow .albumCriticScore', '.songRow .albumCriticScore', '.albumSongRow .albumCriticScore', '.track .albumCriticScore',
      '.trackRow a[title]', '.songRow a[title]', '.albumSongRow a[title]', '.track a[title]'
    ];
    const textEls = $$(textSelectors.join(','));
    textEls.forEach(el => {
      let val;
      if (el.matches('a[title]')) {
        val = parseFloat(el.getAttribute('title'));
      }
      if (val === undefined || Number.isNaN(val)) {
        const txt = (el.textContent || '').trim();
        
        const cleaned = txt.replace(/[^0-9\.]/g, '');
        val = parseFloat(cleaned);
      }
      if (Number.isNaN(val)) return;
      
      if (enabled) {
        if (el.dataset.btxOrigColour === undefined) {
          const style = window.getComputedStyle(el);
          el.dataset.btxOrigColour = style && style.color ? style.color : '';
        }
        const col = getRatingColour(val);
        el.style.color = col;
      } else {
        if (el.dataset.btxOrigColour !== undefined) {
          el.style.color = el.dataset.btxOrigColour;
        }
      }
    });

    
    
    
    const trackRatingEls = $$('.trackRating');
    trackRatingEls.forEach(el => {
      
      
      
      
      
      const val = parseFloat((el.textContent || '').trim());
      if (Number.isNaN(val)) return;
      const target = el.querySelector('span') || el;
      if (enabled) {
        if (target.dataset.btxOrigColour === undefined) {
          const style = window.getComputedStyle(target);
          target.dataset.btxOrigColour = style && style.color ? style.color : '';
        }
        const col = getRatingColour(val);
        
        target.style.setProperty('color', col, 'important');
      } else {
        if (target.dataset.btxOrigColour !== undefined) {
          target.style.setProperty('color', target.dataset.btxOrigColour, 'important');
          delete target.dataset.btxOrigColour;
        }
      }
    });

    
    
    
    if (!enabled) {
      
      const toRemove = $$('.btx-track-col');
      toRemove.forEach(sp => {
        const parent = sp.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(sp.textContent), sp);
          parent.normalize();
        }
      });
    }
  }

  
  async function computeTopArtists() {
    const listEl = document.getElementById('btx-top-artists-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    const rows = Array.from(document.querySelectorAll('.albumRow, .albumRowLarge, .albumBlock, .releaseBlock, .gridItem, tr'));
    const map = new Map();
    rows.forEach(row => {
      
      
      
      
      
      
      
      let rating;
      const scoreSelectors = [
        '.userScore',
        '.criticScore',
        '.albumRating',
        '.scoreBox',
        '.userScoreBox',
        '.criticScoreBox',
        '.ratingText'
      ];
      for (const sel of scoreSelectors) {
        const el = row.querySelector(sel);
        if (el) {
          const val = parseFloat(el.textContent);
          if (!Number.isNaN(val)) {
            rating = val;
            break;
          }
        }
      }
      if (rating === undefined) {
        
        
        
        const bar = row.querySelector('.ratingBar, .ratingbar, .rating-bar, .scoreBar');
        let widthStr;
        if (bar) {
          
          widthStr = bar.style && bar.style.width;
          
          if ((!widthStr || !widthStr.includes('%')) && bar.firstElementChild) {
            widthStr = bar.firstElementChild.style && bar.firstElementChild.style.width;
          }
        }
        if (widthStr && widthStr.includes('%')) {
          const percent = parseFloat(widthStr);
          if (!Number.isNaN(percent)) {
            rating = percent;
          }
        }
      }
      if (rating === undefined) return;
      
      
      let artistEl = row.querySelector('a[href*="/artist/"]');
      if (!artistEl) artistEl = row.querySelector('a');
      if (!artistEl) return;
      const artistName = (artistEl.textContent || '').trim();
      if (!artistName) return;
      if (!map.has(artistName)) {
        map.set(artistName, []);
      }
      map.get(artistName).push(rating);
    });
    
    const averages = [];
    map.forEach((vals, artist) => {
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = sum / vals.length;
      averages.push({ artist, avg });
    });
    if (averages.length === 0) {
      listEl.textContent = 'No ratings found on this page.';
      return;
    }
    averages.sort((a, b) => b.avg - a.avg);
    const top = averages.slice(0, 5);
    top.forEach(item => {
      const div = document.createElement('div');
      
      div.textContent = `${item.artist}: ${item.avg.toFixed(1)}`;
      listEl.appendChild(div);
    });
  }

  
  function setupSpotifyStats() {
    try {
      
      
      
      
      
      
      
      
      const body = document.body;
      if (body.dataset.btxSpotifyAttempted === 'true') return;

      
      
      
      const scoreEl = document.querySelector(
        '.albumCriticScoreBox, .albumUserScoreBox, .criticScoreBox, .userScoreBox'
      );
      if (!scoreEl) return;

      
      
      
      
      
      
      body.dataset.btxSpotifyAttempted = 'true';

      
      
      
      
      const anchors = Array.from(document.querySelectorAll('a[href*="open.spotify.com"]'));
      let spotifyUrl = null;
      for (const a of anchors) {
        const href = a.href;
        if (/open\.spotify\.com\/album\
          spotifyUrl = href;
          break;
        }
      }
      if (!spotifyUrl && anchors.length) spotifyUrl = anchors[0].href;
      if (!spotifyUrl) return;

      
      
      
      
      const container = scoreEl.parentElement || scoreEl;
      const statsEl = document.createElement('div');
      statsEl.className = 'btx-spotify-stats';
      statsEl.innerHTML = `
        <div class="btx-spotify-header">Spotify Stats</div>
        <div class="btx-spotify-body">Loading…</div>
      `;
      container.appendChild(statsEl);

      
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(spotifyUrl);
      fetch(proxyUrl)
        .then(res => res.text())
        .then(html => {
          const text = html.replace(/\s+/g, ' ');
          
          
          
          
          const match = text.match(/(?:^|\b)((?:19|20)\d{2})\b.*?(\d+)\s+(?:songs?|tracks?).*?(\d+)\s+min(?:\s+(\d+)\s+sec)?/i);
          const bodyEl = statsEl.querySelector('.btx-spotify-body');
          if (!bodyEl) return;
          if (match) {
            const [, year, tracks, mins, secs] = match;
            const parts = [];
            if (year) parts.push(`Year: ${year}`);
            if (tracks) parts.push(`Tracks: ${tracks}`);
            if (mins) {
              const lengthStr = secs ? `${mins}m ${secs}s` : `${mins}m`;
              parts.push(`Length: ${lengthStr}`);
            }
            bodyEl.textContent = parts.join(' • ');
          } else {
            bodyEl.textContent = 'Not available';
          }
        })
        .catch(() => {
          
          const bodyEl = statsEl.querySelector('.btx-spotify-body');
          if (bodyEl) bodyEl.textContent = 'Not available';
        });
    } catch (err) {
      
    }
  }

  
  function ensureSettingsUI() {
    if (document.getElementById('btx-settings-button')) return;
    
    const btn = document.createElement('div');
    btn.id = 'btx-settings-button';
    btn.innerHTML = `<svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M487.4 315.7l-42.6-24.6c2.9-13 4.5-26.4 4.5-40.3s-1.6-27.3-4.5-40.3l42.6-24.6c5.6-3.2 8.2-10 6.3-16.2c-8.7-28.2-23-54.4-41.3-77.3c-3.9-5-10.8-6.4-16.5-3.9l-42.5 17.9c-21.1-19.5-46.4-34-74.2-42.2l-6.5-44.6C312.4 7.1 306.3 0 298.2 0h-84.3c-8.2 0-14.2 7.1-13.1 15.1l6.5 44.6c-27.8 8.2-53.1 22.7-74.2 42.2l-42.5-17.9c-5.8-2.4-12.6-1.1-16.5 3.9c-18.3 22.9-32.6 49.1-41.3 77.3c-1.9 6.2 .7 13 6.3 16.2l42.6 24.6C26.2 223.7 24.6 237.1 24.6 251s1.6 27.3 4.5 40.3L-13.4 315.7c-5.6 3.2-8.2 10-6.3 16.2c8.7 28.2 23 54.4 41.3 77.3c3.9 5 10.8 6.4 16.5 3.9l42.5-17.9c21.1 19.5 46.4 34 74.2 42.2l6.5 44.6c1.1 8 7.2 15.1 15.4 15.1h84.3c8.2 0 14.2-7.1 13.1-15.1l-6.5-44.6c27.8-8.2 53.1-22.7 74.2-42.2l42.5 17.9c5.8 2.4 12.6 1.1 16.5-3.9c18.3-22.9 32.6-49.1 41.3-77.3c1.9-6.2-.7-13-6.3-16.2zM256 336c-47.7 0-86-38.3-86-86s38.3-86 86-86s86 38.3 86 86s-38.3 86-86 86z"></path></svg>`;
    document.body.appendChild(btn);
    
    const panel = document.createElement('div');
    panel.id = 'btx-settings-panel';
    panel.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px;">Settings</div>
      <div class="btx-option" id="btx-theme-toggle">Toggle Light/Dark</div>
      <div class="btx-option" style="margin-top:4px;">Accent colour:</div>
      <div class="btx-swatches" style="margin-bottom:8px;"></div>
      <div class="btx-toggle-group">
        <label class="btx-toggle">
          <input type="checkbox" id="btx-toggle-reveal" />
          <span>Scroll reveal animations</span>
        </label>
        <label class="btx-toggle">
          <input type="checkbox" id="btx-toggle-tooltip" />
          <span>Score tooltips</span>
        </label>
        <label class="btx-toggle">
          <input type="checkbox" id="btx-toggle-compare" />
          <span>Quick compare mode</span>
        </label>
        <label class="btx-toggle">
          <input type="checkbox" id="btx-toggle-profile" />
          <span>Mini profile cards</span>
        </label>
      </div>
    `;
    document.body.appendChild(panel);
    
    const colours = ['#8ee36a', '#ffc658', '#6fa8dc', '#e88bff', '#ff6f61'];
    const swatchContainer = panel.querySelector('.btx-swatches');
    colours.forEach(col => {
      const sw = document.createElement('div');
      sw.className = 'btx-swatch';
      sw.style.backgroundColor = col;
      sw.dataset.colour = col;
      swatchContainer.appendChild(sw);
    });
    
    let open = false;
    btn.addEventListener('click', () => {
      open = !open;
      panel.style.display = open ? 'block' : 'none';
    });
    
    swatchContainer.addEventListener('click', e => {
      const sw = e.target.closest('.btx-swatch');
      if (!sw) return;
      const col = sw.dataset.colour;
      applyAccent(col);
      localStorage.setItem('btx-accent', col);
      
      swatchContainer.querySelectorAll('.btx-swatch').forEach(el => el.classList.toggle('active', el === sw));
    });
    
    panel.querySelector('#btx-theme-toggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-btx-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('btx-theme', next);
    });
    
    const currentAccent = getComputedStyle(document.documentElement).getPropertyValue('--btx-accent').trim();
    swatchContainer.querySelectorAll('.btx-swatch').forEach(el => {
      el.classList.toggle('active', el.dataset.colour.toLowerCase() === currentAccent.toLowerCase());
    });

    
    const revealChk = panel.querySelector('#btx-toggle-reveal');
    const tooltipChk = panel.querySelector('#btx-toggle-tooltip');
    const compareChk = panel.querySelector('#btx-toggle-compare');
    const profileChk = panel.querySelector('#btx-toggle-profile');
    const tiltChk = panel.querySelector('#btx-toggle-tilt');
    if (revealChk) revealChk.checked = isFeatureEnabled('reveal');
    if (tooltipChk) tooltipChk.checked = isFeatureEnabled('tooltip');
    if (compareChk) compareChk.checked = isFeatureEnabled('compare');
    if (profileChk) profileChk.checked = isFeatureEnabled('profile');
    if (tiltChk) tiltChk.checked = isFeatureEnabled('tilt');
    
    
    
    
    
    const toggleGroup = panel.querySelector('.btx-toggle-group');
    if (toggleGroup && !panel.querySelector('#btx-toggle-hide-ratings')) {
      const hideLabel = document.createElement('label');
      hideLabel.className = 'btx-toggle';
      hideLabel.innerHTML = `
        <input type="checkbox" id="btx-toggle-hide-ratings" />
        <span>Hide ratings</span>
      `;
      toggleGroup.appendChild(hideLabel);
    }
    
    const hideChk = panel.querySelector('#btx-toggle-hide-ratings');
    if (hideChk) {
      try {
        const val = localStorage.getItem('btx-feature-hide-ratings');
        hideChk.checked = val === 'true';
      } catch (err) {
        hideChk.checked = false;
      }
    }

    
    
    
    
    
    if (toggleGroup) {
      const featureDefinitions = [
        { key: 'unrounded', label: 'Show unrounded scores' },
        { key: 'besttracks', label: 'Highlight best tracks' },
        { key: 'artistavg', label: 'Average artist rating' },
        { key: 'tracksort', label: 'Tracklist sorter' },
        { key: 'colors', label: 'Better rating colours' }
      ];
      featureDefinitions.forEach(({ key, label }) => {
        if (!panel.querySelector('#btx-toggle-' + key)) {
          const lbl = document.createElement('label');
          lbl.className = 'btx-toggle';
          lbl.innerHTML = `\n            <input type="checkbox" id="btx-toggle-${key}" />\n            <span>${label}</span>\n          `;
          toggleGroup.appendChild(lbl);
        }
      });
      
      const unChk = panel.querySelector('#btx-toggle-unrounded');
      if (unChk) unChk.checked = isFeatureEnabled('unrounded');
      const bestChk = panel.querySelector('#btx-toggle-besttracks');
      if (bestChk) bestChk.checked = isFeatureEnabled('besttracks');
      const artChk = panel.querySelector('#btx-toggle-artistavg');
      if (artChk) artChk.checked = isFeatureEnabled('artistavg');
      const sortChk = panel.querySelector('#btx-toggle-tracksort');
      if (sortChk) sortChk.checked = isFeatureEnabled('tracksort');
      const colChk = panel.querySelector('#btx-toggle-colors');
      if (colChk) colChk.checked = isFeatureEnabled('colors');
    }

    
    
    if (!panel.querySelector('#btx-best-settings')) {
      const bestGroup = document.createElement('div');
      bestGroup.id = 'btx-best-settings';
      bestGroup.className = 'btx-option-group';
      bestGroup.innerHTML = `
        <div style="font-size:12px;margin-top:8px;">
          Highlight tracks with score ≥
          <input type="number" id="btx-best-score" min="0" max="100" step="1" style="width:50px;">
          and ratings ≥
          <input type="number" id="btx-best-count" min="0" step="1" style="width:50px;">
        </div>
      `;
      panel.appendChild(bestGroup);
      const bestScoreInput = bestGroup.querySelector('#btx-best-score');
      const bestCountInput = bestGroup.querySelector('#btx-best-count');
      const storedBestScore = parseFloat(localStorage.getItem('btx-best-score'));
      const storedBestCount = parseInt(localStorage.getItem('btx-best-count'), 10);
      bestScoreInput.value = !Number.isNaN(storedBestScore) ? storedBestScore : 80;
      bestCountInput.value = !Number.isNaN(storedBestCount) ? storedBestCount : 10;
      bestScoreInput.addEventListener('change', () => {
        localStorage.setItem('btx-best-score', bestScoreInput.value);
        applyBestTracksHighlight(isFeatureEnabled('besttracks'));
      });
      bestCountInput.addEventListener('change', () => {
        localStorage.setItem('btx-best-count', bestCountInput.value);
        applyBestTracksHighlight(isFeatureEnabled('besttracks'));
      });
    }

    
    if (!panel.querySelector('#btx-colour-settings')) {
      const colourGroup = document.createElement('div');
      colourGroup.id = 'btx-colour-settings';
      colourGroup.className = 'btx-option-group';
      const ranges = ['1–9','10–19','20–29','30–39','40–49','50–59','60–69','70–79','80–89','90–100'];
      let colourHtml = '<div style="font-size:12px;margin-top:8px;">Rating colours:</div>';
      for (let i = 0; i < ranges.length; i++) {
        colourHtml += `
          <label style="display:flex;align-items:center;font-size:12px;margin-top:4px;">
            <span style="flex:1;">${ranges[i]}</span>
            <input type="color" id="btx-col-${i}" style="width:32px;height:20px;border:none;padding:0;margin-left:4px;">
          </label>
        `;
      }
      colourGroup.innerHTML = colourHtml;
      panel.appendChild(colourGroup);
      for (let i = 0; i < ranges.length; i++) {
        const inp = colourGroup.querySelector('#btx-col-' + i);
        const stored = localStorage.getItem('btx-col-' + i);
        inp.value = stored || BTX_DEFAULT_COLOURS[i];
        inp.addEventListener('change', () => {
          localStorage.setItem('btx-col-' + i, inp.value);
          applyRatingColours(isFeatureEnabled('colors'));
        });
      }

      
      
      
      if (!panel.querySelector('#btx-reset-colours')) {
        const reset = document.createElement('div');
        reset.id = 'btx-reset-colours';
        reset.className = 'btx-option';
        reset.style.marginTop = '8px';
        reset.textContent = 'Reset rating colours';
        reset.addEventListener('click', () => {
          
          for (let i = 0; i < 10; i++) {
            localStorage.removeItem('btx-col-' + i);
          }
          
          for (let i = 0; i < 10; i++) {
            const input = panel.querySelector('#btx-col-' + i);
            if (input) input.value = BTX_DEFAULT_COLOURS[i];
          }
          
          applyRatingColours(isFeatureEnabled('colors'));
        });
        colourGroup.appendChild(reset);
      }
    }

    
    panel.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.id.replace('btx-toggle-', '');
        localStorage.setItem('btx-feature-' + id, input.checked ? 'true' : 'false');
        
        setTimeout(() => boot(), 100);
      });
    });

    
    
    
    
    const guideLink = document.createElement('div');
    guideLink.className = 'btx-option';
    guideLink.textContent = 'Show welcome guide';
    guideLink.addEventListener('click', () => {
      showOnboarding(true);
    });
    panel.appendChild(guideLink);

    
    
    
  }

  
  function applyAccent(col) {
    document.documentElement.style.setProperty('--btx-accent', col);
  }

  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-btx-theme', theme);
  }

  
  function createLoadingOverlay() {
    if (document.getElementById('btx-loading')) return;
    const overlay = document.createElement('div');
    overlay.id = 'btx-loading';
    overlay.className = 'btx-loading';
    overlay.innerHTML = '<div class="btx-spinner"></div>';
    document.body.appendChild(overlay);
    
    function hide() {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 800);
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(hide, 500);
    } else {
      window.addEventListener('DOMContentLoaded', () => setTimeout(hide, 500));
    }
  }

  
  function showOnboarding(force = false) {
    
    if (document.getElementById('btx-onboard-overlay')) return;
    
    try {
      if (!force && localStorage.getItem('btx-onboarding-done')) return;
    } catch (err) {
      
    }
    
    document.body.classList.add('btx-onboard-open');
    
    const overlay = document.createElement('div');
    overlay.id = 'btx-onboard-overlay';
    overlay.className = 'btx-onboard-overlay';
    const modal = document.createElement('div');
    modal.className = 'btx-onboard-modal';
    overlay.appendChild(modal);
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'btx-onboard-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', () => {
      finishOnboarding();
    });
    modal.appendChild(closeBtn);
    
    const img = document.createElement('img');
    img.className = 'btx-onboard-image';
    
    
    img.src = chrome.runtime.getURL('onboard-logo.png');
    modal.appendChild(img);
    
    const titleEl = document.createElement('div');
    titleEl.className = 'btx-onboard-title';
    modal.appendChild(titleEl);
    
    const textEl = document.createElement('div');
    textEl.className = 'btx-onboard-text';
    modal.appendChild(textEl);
    
    const customEl = document.createElement('div');
    customEl.className = 'btx-onboard-custom';
    modal.appendChild(customEl);
    
    const indicator = document.createElement('div');
    indicator.className = 'btx-onboard-step-indicator';
    modal.appendChild(indicator);
    
    const buttons = document.createElement('div');
    buttons.className = 'btx-onboard-buttons';
    modal.appendChild(buttons);
    
    
    
    
    const reviewUrl = 'https://chromewebstore.google.com/detail/better-aoty/cpopgbebjedbfdhfibekppbnkfmgbnne?hl=en&auth';
    const steps = [
      {
        title: 'Welcome to Better AOTY',
        desc: 'Thanks for installing Better AOTY!\nThis extension enhances your Album of The Year experience with helpful features and a fresh look.',
        build() {
          
        },
      },
      {
        title: 'Customize your features',
        desc: 'Select which features you want enabled:',
        build() {
          customEl.innerHTML = '';
          const group = document.createElement('div');
          group.className = 'btx-toggle-group';
          const features = [
            { key: 'reveal', label: 'Scroll reveal animations' },
            { key: 'tooltip', label: 'Score tooltips' },
            { key: 'compare', label: 'Yearly score comparison' },
            { key: 'profile', label: 'Mini profile cards' },
            { key: 'hide-ratings', label: 'Hide critic/user ratings' },
          ];
          features.forEach(({ key, label }) => {
            const wrapper = document.createElement('label');
            wrapper.className = 'btx-toggle';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = `btx-onboard-${key}`;
            
            let stored;
            try {
              stored = localStorage.getItem('btx-feature-' + key);
            } catch (err) {}
            if (stored === 'false') {
              cb.checked = false;
            } else if (stored === 'true') {
              cb.checked = true;
            } else {
              
              cb.checked = key !== 'hide-ratings';
            }
            cb.addEventListener('change', () => {
              try {
                localStorage.setItem('btx-feature-' + key, cb.checked ? 'true' : 'false');
              } catch (err) {}
              
              setTimeout(() => boot(), 50);
            });
            const span = document.createElement('span');
            span.textContent = label;
            wrapper.appendChild(cb);
            wrapper.appendChild(span);
            group.appendChild(wrapper);
          });
          customEl.appendChild(group);
        },
      },
      {
        title: 'Thanks for using Better AOTY',
        desc: 'If you enjoy using this extension, please consider leaving a review on the Chrome Web Store. Your feedback helps us improve!',
        build() {
          customEl.innerHTML = '';
          const reviewBtn = document.createElement('div');
          reviewBtn.className = 'btx-onboard-button btx-onboard-review';
          reviewBtn.textContent = 'Leave a review';
          reviewBtn.addEventListener('click', () => {
            window.open(reviewUrl, '_blank');
            finishOnboarding();
          });
          customEl.appendChild(reviewBtn);
        },
      },
    ];
    
    indicator.innerHTML = '';
    steps.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = 'btx-onboard-step-dot';
      indicator.appendChild(dot);
    });
    let current = 0;
    function render() {
      
      const step = steps[current];
      titleEl.textContent = step.title;
      
      textEl.innerHTML = '';
      step.desc.split('\n').forEach((line, i) => {
        const div = document.createElement('div');
        div.textContent = line;
        textEl.appendChild(div);
      });
      
      if (step.build) step.build();
      
      Array.from(indicator.children).forEach((dot, idx) => {
        dot.classList.toggle('active', idx === current);
      });
      
      buttons.innerHTML = '';
      
      const skipBtn = document.createElement('div');
      skipBtn.className = 'btx-onboard-button secondary';
      skipBtn.textContent = current === steps.length - 1 ? 'Maybe later' : 'Skip';
      skipBtn.addEventListener('click', () => {
        finishOnboarding();
      });
      buttons.appendChild(skipBtn);
      
      const nextBtn = document.createElement('div');
      nextBtn.className = 'btx-onboard-button primary';
      if (current === steps.length - 1) {
        nextBtn.textContent = 'Done';
        nextBtn.addEventListener('click', () => {
          finishOnboarding();
        });
      } else {
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => {
          current++;
          render();
        });
      }
      buttons.appendChild(nextBtn);
    }
    function finishOnboarding() {
      
      try {
        localStorage.setItem('btx-onboarding-done', 'true');
      } catch (err) {}
      document.body.classList.remove('btx-onboard-open');
      overlay.remove();
    }
    document.body.appendChild(overlay);
    
    render();
  }

  
  
  
  
  
  
  
  const observer = new MutationObserver(debounce(() => boot(), 500));
  observer.observe(document.documentElement, { childList: true, subtree: true });

  
  
  createLoadingOverlay();
  
  const storedAccent = localStorage.getItem('btx-accent');
  if (storedAccent) applyAccent(storedAccent);
  const storedTheme = localStorage.getItem('btx-theme');
  if (storedTheme) applyTheme(storedTheme);
  
  applyPageEnter();
  boot();
})();