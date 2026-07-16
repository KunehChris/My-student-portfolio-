    // Initialize Lucide icons
    function initIcons() {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    // Mobile menu functionality
    function initMobileMenu() {
      const menuBtn = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      let menuOpen = false;

      if (!menuBtn || !mobileMenu) return;

      menuBtn.addEventListener('click', () => {
        menuOpen = !menuOpen;
        
        if (menuOpen) {
          mobileMenu.classList.remove('hidden');
          mobileMenu.classList.add('mobile-menu');
          menuBtn.innerHTML = '<i data-lucide="x" class="w-5 h-5">&#10005;</i>';
        } else {
          mobileMenu.classList.add('hidden');
          mobileMenu.classList.remove('mobile-menu');
          menuBtn.innerHTML = '<i data-lucide="menu" class="w-5 h-5">&#9776;</i>';
        }
        
        initIcons();
      });

      document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
          menuBtn.innerHTML = '<i data-lucide="menu" class="w-5 h-5">&#9776;</i>';
          menuOpen = false;
          initIcons();
        });
      });
    }

    // Blog search and filter functionality
    let searchTimeout = null;

    function initBlogSearch() {
      const searchInput = document.getElementById('search-input');
      const clearBtn = document.getElementById('clear-search');
      const blogGrid = document.getElementById('blog-grid');
      const noResults = document.getElementById('no-results');
      
      if (!searchInput || !blogGrid) return;

      const blogCards = Array.from(blogGrid.querySelectorAll('.blog-card'));

      function filterAndHighlight() {
        const filter = searchInput.value.toLowerCase().trim();
        
        let visibleCount = 0;

        blogCards.forEach(card => {
          const title = (card.dataset.title || '').toLowerCase();
          const desc = (card.dataset.desc || '').toLowerCase();
          const content = title + ' ' + desc;
          
          resetHighlights(card);

          if (!filter) {
            card.style.display = '';
            visibleCount++;
            return;
          }

          if (content.includes(filter)) {
            card.style.display = '';
            visibleCount++;
            highlightTextInElement(card, filter);
          } else {
            card.style.display = 'none';
          }
        });

        if (visibleCount === 0 && filter) {
          noResults.classList.remove('hidden');
          blogGrid.classList.add('hidden');
        } else {
          noResults.classList.add('hidden');
          blogGrid.classList.remove('hidden');
        }

        if (filter) {
          clearBtn.classList.remove('hidden');
          clearBtn.classList.add('flex');
        } else {
          clearBtn.classList.add('hidden');
          clearBtn.classList.remove('flex');
        }
      }

      function highlightTextInElement(element, filter) {
        const textNodes = getTextNodes(element);
        
        textNodes.forEach(node => {
          const text = node.nodeValue;
          if (!text) return;
          
          const lowerText = text.toLowerCase();
          let lastIndex = 0;
          const parent = node.parentNode;
          const fragment = document.createDocumentFragment();
          
          let matchIndex;
          while ((matchIndex = lowerText.indexOf(filter, lastIndex)) !== -1) {
            if (matchIndex > lastIndex) {
              fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
            }
            
            const span = document.createElement('span');
            span.className = 'highlight';
            span.textContent = text.substring(matchIndex, matchIndex + filter.length);
            fragment.appendChild(span);
            
            lastIndex = matchIndex + filter.length;
          }
          
          if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
          }
          
          if (fragment.childNodes.length > 0) {
            parent.replaceChild(fragment, node);
          }
        });
      }

      function getTextNodes(node) {
        const nodes = [];
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
        let currentNode;
        while ((currentNode = walker.nextNode())) {
          if (currentNode.nodeValue.trim() !== '') {
            nodes.push(currentNode);
          }
        }
        return nodes;
      }

      function resetHighlights(element) {
        element.querySelectorAll('.highlight').forEach(el => {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
          }
        });
      }

      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterAndHighlight, 120);
      });

      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterAndHighlight();
        searchInput.focus();
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          filterAndHighlight();
        }
      });

      clearBtn.classList.add('hidden');
    }

    function clearSearch() {
      const searchInput = document.getElementById('search-input');
      const noResults = document.getElementById('no-results');
      const blogGrid = document.getElementById('blog-grid');
      
      if (searchInput) searchInput.value = '';
      
      document.querySelectorAll('#blog-grid .blog-card').forEach(card => {
        card.style.display = '';
        card.querySelectorAll('.highlight').forEach(el => {
          const parent = el.parentNode;
          parent.replaceChild(document.createTextNode(el.textContent), el);
          parent.normalize();
        });
      });
      
      noResults.classList.add('hidden');
      blogGrid.classList.remove('hidden');
      
      const clearBtn = document.getElementById('clear-search');
      if (clearBtn) {
        clearBtn.classList.add('hidden');
        clearBtn.classList.remove('flex');
      }
    }

    // Contact form validation + mailto handoff
    function initContactForm() {
      const form = document.getElementById('contact-form');
      if (!form) return;

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const phoneInput = document.getElementById('contact-phone');
      const messageInput = document.getElementById('contact-message');
      const successMsg = document.getElementById('contact-success');

      function showError(input, message) {
        const errorEl = input.parentElement.querySelector('.field-error');
        input.classList.add('border-red-400/70');
        if (errorEl) {
          errorEl.textContent = message;
          errorEl.classList.remove('hidden');
        }
      }

      function clearError(input) {
        const errorEl = input.parentElement.querySelector('.field-error');
        input.classList.remove('border-red-400/70');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.add('hidden');
        }
      }

      [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
        if (!input) return;
        input.addEventListener('input', () => clearError(input));
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        successMsg.classList.add('hidden');

        let valid = true;

        if (!nameInput.value.trim()) {
          showError(nameInput, 'Please enter your name.');
          valid = false;
        } else {
          clearError(nameInput);
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
          showError(emailInput, 'Please enter your email.');
          valid = false;
        } else if (!emailPattern.test(emailInput.value.trim())) {
          showError(emailInput, 'Please enter a valid email address.');
          valid = false;
        } else {
          clearError(emailInput);
        }

        const digitsOnly = phoneInput.value.trim().replace(/[\s-]/g, '').replace(/^\+/, '');
        if (!phoneInput.value.trim()) {
          showError(phoneInput, 'Please enter your phone number.');
          valid = false;
        } else if (!/^\d{7,15}$/.test(digitsOnly)) {
          showError(phoneInput, 'Phone number should contain digits only.');
          valid = false;
        } else {
          clearError(phoneInput);
        }

        if (!messageInput.value.trim()) {
          showError(messageInput, 'Please enter a message.');
          valid = false;
        } else {
          clearError(messageInput);
        }

        if (!valid) return;

        const subject = encodeURIComponent('Portfolio contact from ' + nameInput.value.trim());
        const body = encodeURIComponent(
          messageInput.value.trim() +
          '\n\n---\nName: ' + nameInput.value.trim() +
          '\nEmail: ' + emailInput.value.trim() +
          '\nPhone: ' + phoneInput.value.trim()
        );
        window.location.href = `mailto:mvibe607@gmail.com?subject=${subject}&body=${body}`;

        successMsg.classList.remove('hidden');
        form.reset();
      });
    }

    // Highlight the current page in the nav
    function initActiveNav() {
      const current = (window.location.pathname.split('/').pop() || 'index.html');
      document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === current || (current === '' && href === 'index.html')) {
          link.classList.add('nav-active');
        }
      });
    }

    // Fade sections in as they scroll into view
    function initScrollReveal() {
      const targets = document.querySelectorAll('main > section');
      if (!targets.length || typeof IntersectionObserver === 'undefined') return;

      targets.forEach(el => el.classList.add('reveal'));

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

      targets.forEach(el => observer.observe(el));
    }

    // Back-to-top button
    function initBackToTop() {
      const btn = document.getElementById('back-to-top');
      if (!btn) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
          btn.classList.add('show');
        } else {
          btn.classList.remove('show');
        }
      });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Smooth scroll
    function initSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }

    // Main initialization
    function init() {
      initIcons();
      initMobileMenu();
      initBlogSearch();
      initSmoothScroll();
      initContactForm();
      initActiveNav();
      initScrollReveal();
      initBackToTop();
      
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName === 'BODY') {
          e.preventDefault();
          const search = document.getElementById('search-input');
          if (search) search.focus();
        }
      });

      console.log('%c[Deborah Christopher Portfolio] Personalized portfolio ready. Press "/" to focus search.', 'color:#8a857d');
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

