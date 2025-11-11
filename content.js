








(() => {
  
  
  
  const fontLink = document.createElement('link');
  fontLink.href =
    'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  
  function enhanceHearts(root = document) {
    const icons = Array.from(
      root.querySelectorAll("svg[data-icon='heart'], .fa-heart")
    );
    icons.forEach(icon => {
      if (icon.dataset.heartEnhanced === 'true') return;
      icon.dataset.heartEnhanced = 'true';
      icon.style.transition = icon.style.transition
        ? `${icon.style.transition}, transform 0.3s ease`
        : 'transform 0.3s ease';
      icon.addEventListener('click', () => {
        icon.classList.add('heart-bounce');
        setTimeout(() => {
          icon.classList.remove('heart-bounce');
        }, 300);
      });
    });
  }
  
  enhanceHearts();
  const heartObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          enhanceHearts(node);
        }
      });
    });
  });
  heartObserver.observe(document.body, { childList: true, subtree: true });

  
  function enhanceThumbs(root = document) {
    const icons = Array.from(
      root.querySelectorAll("svg[data-icon='thumbs-up'], .fa-thumbs-up")
    );
    icons.forEach(icon => {
      if (icon.dataset.thumbEnhanced === 'true') return;
      icon.dataset.thumbEnhanced = 'true';
      
      icon.style.transition = icon.style.transition
        ? `${icon.style.transition}, transform 0.3s ease`
        : 'transform 0.3s ease';
      icon.addEventListener('click', () => {
        icon.classList.add('thumb-bounce');
        setTimeout(() => {
          icon.classList.remove('thumb-bounce');
        }, 300);
      });
    });
  }
  
  enhanceThumbs();
  
  const thumbObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          enhanceThumbs(node);
        }
      });
    });
  });
  thumbObserver.observe(document.body, { childList: true, subtree: true });

  
  function adjustScoreSpacing(root = document) {
    const divs = root.querySelectorAll('div');
    divs.forEach(el => {
      const text = (el.textContent || '').trim().toUpperCase();
      if (text.startsWith('USER SCORE')) {
        const prev = el.previousElementSibling;
        if (prev && prev.nodeName === el.nodeName) {
          el.style.marginTop = '-8px';
        }
      }
    });
  }
  adjustScoreSpacing();
  const scoreObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          adjustScoreSpacing(node);
        }
      });
    });
  });
  scoreObserver.observe(document.body, { childList: true, subtree: true });

  
  function styleReviewEditors(root = document) {
    const divs = root.querySelectorAll('div');
    divs.forEach(el => {
      const txt = (el.textContent || '').toUpperCase();
      if (txt.includes('LISTENED') && txt.includes('LIKE')) {
        const prefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        let surface;
        if (prefersDark) {
          surface =
            getComputedStyle(document.documentElement).getPropertyValue(
              '--bg-surface'
            ).trim() || '#181818';
        } else {
          surface = '#f3f3f3';
        }
        el.style.backgroundColor = surface;
        el.style.borderRadius = '12px';
        el.style.padding = '12px';
      }
    });
  }
  styleReviewEditors();
  const reviewObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          styleReviewEditors(node);
        }
      });
    });
  });
  reviewObserver.observe(document.body, { childList: true, subtree: true });

  
  const flameSVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="14" height="14" style="vertical-align:middle; margin-right:4px; fill:#50fa75;"><path d="M159.3 5.4c7.8-7.3 19.9-7.2 27.7 .1c27.6 25.9 53.5 53.8 77.7 84c11-14.4 23.5-30.1 37-42.9c7.9-7.4 20.1-7.4 28 .1c34.6 33 63.9 76.6 84.5 118c20.3 40.8 33.8 82.5 33.8 111.9C448 404.2 348.2 512 224 512C98.4 512 0 404.1 0 276.5c0-38.4 17.8-85.3 45.4-131.7C73.3 97.7 112.7 48.6 159.3 5.4zM225.7 416c25.3 0 47.7-7 68.8-21c42.1-29.4 53.4-88.2 28.1-134.4c-4.5-9-16-9.6-22.5-2l-25.2 29.3c-6.6 7.6-18.5 7.4-24.7-.5c-16.5-21-46-58.5-62.8-79.8c-6.3-8-18.3-8.1-24.7-.1c-33.8 42.5-50.8 69.3-50.8 99.4C112 375.4 162.6 416 225.7 416z"/></svg>';
  function insertFlameIcon(root = document) {
    const headings = root.querySelectorAll('h2, h3, h4, h5');
    headings.forEach(h => {
      if (/HIGHLY ANTICIPATED/.test(h.textContent.toUpperCase())) {
        if (h.dataset.flameInserted === 'true') return;
        h.dataset.flameInserted = 'true';
        const span = document.createElement('span');
        span.innerHTML = flameSVG;
        h.prepend(span);
      }
    });
  }
  insertFlameIcon();
  const flameObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          insertFlameIcon(node);
        }
      });
    });
  });
  flameObserver.observe(document.body, { childList: true, subtree: true });

  
  const sectionIcons = {
    'NEW RELEASES':
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="14" height="14" style="vertical-align:middle; margin-right:4px; fill:#50fa75;"><path d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z"/></svg>',
    'POPULAR NOW':
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="14" height="14" style="vertical-align:middle; margin-right:4px; fill:#ff9f43;"><path d="M159.3 5.4c7.8-7.3 19.9-7.2 27.7 .1c27.6 25.9 53.5 53.8 77.7 84c11-14.4 23.5-30.1 37-42.9c7.9-7.4 20.1-7.4 28 .1c34.6 33 63.9 76.6 84.5 118c20.3 40.8 33.8 82.5 33.8 111.9C448 404.2 348.2 512 224 512C98.4 512 0 404.1 0 276.5c0-38.4 17.8-85.3 45.4-131.7C73.3 97.7 112.7 48.6 159.3 5.4zM225.7 416c25.3 0 47.7-7 68.8-21c42.1-29.4 53.4-88.2 28.1-134.4c-4.5-9-16-9.6-22.5-2l-25.2 29.3c-6.6 7.6-18.5 7.4-24.7-.5c-16.5-21-46-58.5-62.8-79.8c-6.3-8-18.3-8.1-24.7-.1c-33.8 42.5-50.8 69.3-50.8 99.4C112 375.4 162.6 416 225.7 416z"/></svg>',
    'NEWSWORTHY':
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" style="vertical-align:middle; margin-right:4px; fill:#61affe;"><path d="M96 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L80 480c-44.2 0-80-35.8-80-80L0 128c0-17.7 14.3-32 32-32s32 14.3 32 32l0 272c0 8.8 7.2 16 16 16s16-7.2 16-16L96 96zm64 24l0 80c0 13.3 10.7 24 24 24l112 0c13.3 0 24-10.7 24-24l0-80c0-13.3-10.7-24-24-24L184 96c-13.3 0-24 10.7-24 24zm208-8c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16zM160 304c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0c-8.8 0-16 7.2-16 16z"/></svg>'
  };
  function insertSectionIcons(root = document) {
    const headings = root.querySelectorAll('h2, h3, h4, h5');
    headings.forEach(h => {
      const txt = h.textContent.trim().toUpperCase();
      Object.keys(sectionIcons).forEach(key => {
        if (txt.startsWith(key) && !h.dataset.sectionIconInserted) {
          h.dataset.sectionIconInserted = 'true';
          const span = document.createElement('span');
          span.innerHTML = sectionIcons[key];
          h.prepend(span);
        }
      });
    });
  }
  insertSectionIcons();
  const sectionObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          insertSectionIcons(node);
        }
      });
    });
  });
  sectionObserver.observe(document.body, { childList: true, subtree: true });

  
  function fixRatePostButtons(root = document) {
    ['rate', 'post'].forEach(id => {
      
      
      
      let inner;
      if (typeof root.getElementById === 'function') {
        inner = root.getElementById(id);
      } else {
        inner = root.querySelector('#' + id);
      }
      if (inner && inner.classList.contains('smallButton')) {
        const parentBtn = inner.closest('button');
        if (parentBtn && !parentBtn.classList.contains('smallButton')) {
          parentBtn.classList.add('smallButton');
          parentBtn.textContent = inner.textContent.trim();
          inner.style.display = 'none';
        }
      }
    });
  }
  
  fixRatePostButtons();
  
  const ratePostObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          fixRatePostButtons(node);
        }
      });
    });
  });
  ratePostObserver.observe(document.body, { childList: true, subtree: true });
})();