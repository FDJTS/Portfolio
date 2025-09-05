// تحسينات JavaScript للموقع
document.addEventListener("DOMContentLoaded", () => {
  // إعداد الوضع الليلي/الفاتح
  initThemeToggle();
  
  // إعداد أنيميشن العناصر
  initScrollAnimations();
  
  // تحميل مشاريع GitHub
  if (document.getElementById("github-projects")) {
    loadGitHubProjects();
  }
  
  // إعداد تأثيرات إضافية
  initSmoothScrolling();
  initLoadingStates();
  initTooltips();
  
  // تسجيل Service Worker
  registerServiceWorker();
  
  // إعداد إشعارات PWA
  initPWAFeatures();
});

// إعداد الوضع الليلي/الفاتح مع تحسينات
function initThemeToggle() {
  const themeBtn = document.querySelector(".toggle-theme");
  if (!themeBtn) return;
  
  function updateThemeBtn() {
    const isLight = document.body.classList.contains("light");
    themeBtn.innerHTML = isLight ? 
      '🌙 تفعيل الوضع الليلي' : 
      '☀️ تفعيل الوضع الفاتح';
  }
  
  // تطبيق الوضع المحفوظ
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
  
  updateThemeBtn();
  
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const newTheme = document.body.classList.contains("light") ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    updateThemeBtn();
    
    // تأثير انتقال سلس
    document.body.style.transition = "all 0.3s ease";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 300);
  });
}

// إزالة الكود المكرر - تم دمجه في initThemeToggle

// أنيميشن العناصر عند التمرير
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        entry.target.classList.add("visible");
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });
  
  // إضافة أنيميشن للعناصر
  document.querySelectorAll("section, .project-card, .tutorial-card, .hero-content, .contact-form").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}

// تأثير ظهور العناصر عند التمرير
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

fadeEls.forEach(el => observer.observe(el));

// تمرير سلس
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// حالات التحميل
function initLoadingStates() {
  // إضافة تأثير تحميل للصور
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
      this.style.opacity = '1';
    });
    
    img.addEventListener('error', function() {
      this.style.display = 'none';
    });
    
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
  });
}

// تلميحات
function initTooltips() {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: var(--surface);
    color: var(--text);
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    border: 1px solid var(--surface2);
  `;
  document.body.appendChild(tooltip);
  
  document.querySelectorAll('[title]').forEach(el => {
    el.addEventListener('mouseenter', function(e) {
      tooltip.textContent = this.getAttribute('title');
      tooltip.style.left = e.pageX + 10 + 'px';
      tooltip.style.top = e.pageY - 30 + 'px';
      tooltip.style.opacity = '1';
      this.removeAttribute('title');
    });
    
    el.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
    });
  });
}

async function loadGitHubProjects() {
  const container = document.getElementById("github-projects");
  if (!container) return;
  container.innerHTML = `<div style="text-align:center;color:#00ffd5;">...جاري تحميل المشاريع...</div>`;
  try {
    const res = await fetch("https://api.github.com/users/FDJTS/repos?sort=updated");
    const repos = await res.json();
    if (!Array.isArray(repos)) throw new Error();
    container.innerHTML = `<div class="projects-grid"></div>`;
    const grid = container.querySelector(".projects-grid");
    repos.slice(0, 6).forEach((repo, i) => {
      const imgUrl = ``;
      grid.innerHTML += `
        <div class="project-card">
          <h3>${repo.name}</h3>
          <p>${repo.description || "مشروع برمجي بدون وصف."}</p>
          <a href="${repo.html_url}" target="_blank" rel="noopener">شاهد على GitHub</a>
        </div>
      `;
    });
  } catch {
    container.innerHTML = `<p style="color:#ffaa00;">تعذر تحميل المشاريع من GitHub.</p>`;
  }
}

function validateEmail(email) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

// تسجيل Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// مميزات PWA
function initPWAFeatures() {
  // إضافة زر تثبيت التطبيق
  let deferredPrompt;
  const installBtn = document.createElement('button');
  installBtn.innerHTML = '📱 تثبيت التطبيق';
  installBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 25px;
    padding: 12px 20px;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    display: none;
  `;
  
  document.body.appendChild(installBtn);
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
  });
  
  installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        installBtn.style.display = 'none';
      });
    }
  });
  
  // إخفاء الزر بعد التثبيت
  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
  });
}

// تحسينات إضافية للأداء
function optimizePerformance() {
  // Lazy loading للصور
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// إضافة تأثيرات صوتية (اختيارية)
function initSoundEffects() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  function playClickSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
  
  // إضافة الصوت للأزرار
  document.querySelectorAll('button, .cta').forEach(btn => {
    btn.addEventListener('click', playClickSound);
  });
}

// تحسينات للوحة المفاتيح
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K للبحث
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // يمكن إضافة وظيفة البحث هنا
      console.log('Search shortcut triggered');
    }
    
    // Escape لإغلاق النوافذ المنبثقة
    if (e.key === 'Escape') {
      // إغلاق أي نوافذ منبثقة مفتوحة
      document.querySelectorAll('.modal, .popup').forEach(el => {
        el.style.display = 'none';
      });
    }
  });
}

// تحسينات للشاشات الصغيرة
function initMobileOptimizations() {
  if (window.innerWidth <= 768) {
    // تحسينات خاصة للهواتف
    document.body.classList.add('mobile-optimized');
    
    // إضافة swipe gestures
    let startX, startY;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) {
          // Swipe left - يمكن إضافة وظيفة هنا
          console.log('Swipe left');
        } else if (diffX < -50) {
          // Swipe right - يمكن إضافة وظيفة هنا
          console.log('Swipe right');
        }
      }
      
      startX = null;
      startY = null;
    });
  }
}

// تحسين زر تغيير اللغة (تأكيد قبل التحويل)
document.querySelector('.toggle-lang')?.addEventListener('click', function(e) {
  if (!confirm('هل تريد التحويل للغة الإنجليزية؟')) {
    e.preventDefault();
  }
});

// تحسينات JS متقدمة:
// أنيميشن ظهور العناصر عند التمرير
function animateOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.project-card, .tutorial-card, .stat-card, .hero-content').forEach(el => {
    observer.observe(el);
  });
}
animateOnScroll();

// Tooltip ديناميكي
function dynamicTooltip() {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);
  document.querySelectorAll('[title]').forEach(el => {
    el.addEventListener('mouseenter', function(e) {
      tooltip.textContent = this.getAttribute('title');
      tooltip.style.left = e.pageX + 10 + 'px';
      tooltip.style.top = e.pageY - 30 + 'px';
      tooltip.style.opacity = '1';
      this.dataset._title = this.getAttribute('title');
      this.removeAttribute('title');
    });
    el.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
      if (this.dataset._title) this.setAttribute('title', this.dataset._title);
    });
  });
}
dynamicTooltip();

// زر تثبيت التطبيق (PWA)
function pwaInstallButton() {
  let deferredPrompt;
  const installBtn = document.createElement('button');
  installBtn.className = 'pwa-install-btn';
  installBtn.textContent = '📱 تثبيت التطبيق';
  document.body.appendChild(installBtn);
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
  });
  installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        installBtn.style.display = 'none';
      });
    }
  });
  window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
  });
}
pwaInstallButton();

// Loader ديناميكي
function showLoader(parent) {
  const loader = document.createElement('div');
  loader.className = 'loader';
  parent.appendChild(loader);
  return loader;
}

// Modal ديناميكي
function showModal(message) {
  let modal = document.querySelector('.modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `<div class="modal-content"></div>`;
    document.body.appendChild(modal);
  }
  modal.querySelector('.modal-content').innerHTML = message + `<br><button onclick="document.querySelector('.modal').classList.remove('active')">إغلاق</button>`;
  modal.classList.add('active');
}
window.showModal = showModal;

// اختصارات لوحة المفاتيح
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    showModal('اختصار البحث جاهز! يمكنك إضافة وظيفة البحث هنا.');
  }
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(el => el.classList.remove('active'));
  }
});

// تحسينات للهواتف (Swipe)
if (window.innerWidth <= 768) {
  let startX, startY;
  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });
  document.addEventListener('touchend', (e) => {
    if (!startX || !startY) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = startX - endX;
    const diffY = startY - endY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 50) showModal('سحبت لليسار!');
      else if (diffX < -50) showModal('سحبت لليمين!');
    }
    startX = null; startY = null;
  });
}

// صوت للأزرار
function playClickSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 600;
  gain.gain.value = 0.07;
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}
document.querySelectorAll('button, .cta').forEach(btn => {
  btn.addEventListener('click', playClickSound);
});

// Lazy loading للصور
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.addEventListener('load', function() {
    this.style.opacity = '1';
  });
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.4s';
});

// ===== وظائف متقدمة للمشاريع =====

// إعداد البحث والفلترة للمشاريع
function initProjectSearchAndFilter() {
  const searchInput = document.getElementById('projectSearch');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (!searchInput) return;
  
  // البحث في المشاريع
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterProjects(searchTerm, getActiveFilter());
  });
  
  // فلترة المشاريع
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // إزالة active من جميع الأزرار
      filterButtons.forEach(b => b.classList.remove('active'));
      // إضافة active للزر المحدد
      this.classList.add('active');
      
      const searchTerm = searchInput.value.toLowerCase();
      filterProjects(searchTerm, this.dataset.filter);
    });
  });
  
  function getActiveFilter() {
    const activeBtn = document.querySelector('.filter-btn.active');
    return activeBtn ? activeBtn.dataset.filter : 'all';
  }
  
  function filterProjects(searchTerm, category) {
    projectCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const description = card.querySelector('p').textContent.toLowerCase();
      const tech = card.dataset.tech ? card.dataset.tech.toLowerCase() : '';
      const cardCategory = card.dataset.category;
      
      const matchesSearch = !searchTerm || 
        title.includes(searchTerm) || 
        description.includes(searchTerm) || 
        tech.includes(searchTerm);
      
      const matchesCategory = category === 'all' || cardCategory === category;
      
      if (matchesSearch && matchesCategory) {
        card.style.display = 'block';
        card.style.animation = 'fadeInUp 0.5s ease';
      } else {
        card.style.display = 'none';
      }
    });
    
    updateProjectStats();
  }
}

// تحديث إحصائيات المشاريع
function updateProjectStats() {
  const visibleProjects = document.querySelectorAll('.project-card[style*="block"], .project-card:not([style*="none"])');
  const totalProjects = visibleProjects.length;
  
  let totalStars = 0;
  let totalForks = 0;
  const languages = new Set();
  
  visibleProjects.forEach(card => {
    const stats = card.querySelectorAll('.stat');
    if (stats.length >= 3) {
      totalStars += parseInt(stats[0].textContent.match(/\d+/)[0]) || 0;
      totalForks += parseInt(stats[1].textContent.match(/\d+/)[0]) || 0;
    }
    
    const techTags = card.querySelectorAll('.tech-tag');
    techTags.forEach(tag => languages.add(tag.textContent));
  });
  
  // تحديث الأرقام مع أنيميشن
  animateNumber('totalProjects', totalProjects);
  animateNumber('totalStars', totalStars);
  animateNumber('totalForks', totalForks);
  animateNumber('totalLanguages', languages.size);
}

// أنيميشن الأرقام
function animateNumber(elementId, targetNumber) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const startNumber = parseInt(element.textContent) || 0;
  const duration = 1000;
  const startTime = performance.now();
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * progress);
    element.textContent = currentNumber;
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

// Modal للمشاريع
function showProjectModal(projectId) {
  const modal = document.createElement('div');
  modal.className = 'project-modal active';
  
  const projectData = getProjectData(projectId);
  
  modal.innerHTML = `
    <div class="project-modal-content">
      <button class="project-modal-close" onclick="closeProjectModal()">&times;</button>
      <h2>${projectData.title}</h2>
      <div class="project-modal-image">
        <img src="${projectData.image}" alt="${projectData.title}" style="width: 100%; border-radius: 10px; margin: 20px 0;">
      </div>
      <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">${projectData.description}</p>
      
      <div class="project-modal-tech">
        <h3>التقنيات المستخدمة:</h3>
        <div class="tech-tags">
          ${projectData.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
      </div>
      
      <div class="project-modal-features">
        <h3>المميزات:</h3>
        <ul>
          ${projectData.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
      
      <div class="project-modal-links">
        ${projectData.links.map(link => `<a href="${link.url}" target="_blank" class="project-link ${link.type}">${link.text}</a>`).join('')}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // إغلاق عند النقر خارج Modal
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeProjectModal();
    }
  });
  
  // إغلاق بـ Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeProjectModal();
    }
  });
}

function closeProjectModal() {
  const modal = document.querySelector('.project-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// بيانات المشاريع الحقيقية من GitHub
function getProjectData(projectId) {
  const projects = {
    'escape-runner': {
      title: 'Escape-Runner',
      image: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/javascript.svg',
      description: 'لعبة منصات مثيرة ومتحدية مع ميكانيكيات حركة متقدمة وتحديات متنوعة. مشروع JavaScript متكامل مع رسوميات جميلة وتأثيرات بصرية مذهلة.',
      technologies: ['JavaScript', 'HTML5', 'CSS3', 'Game Development', 'Canvas'],
      features: [
        'ميكانيكيات حركة متقدمة ومرنة',
        'تحديات متنوعة ومتدرجة الصعوبة',
        'رسوميات جميلة وتأثيرات بصرية',
        'نظام نقاط وإنجازات',
        'تحكم سلس ومتجاوب'
      ],
      links: [
        { url: 'https://github.com/FDJTS/Escape-Runner', text: 'GitHub Repository', type: 'primary' },
        { url: 'https://fdjts.netlify.app/', text: 'عرض الموقع', type: 'secondary' }
      ]
    },
    'spaceships': {
      title: 'Legendary Spaceships Game',
      image: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/html5.svg',
      description: 'لعبة مركبات فضائية أسطورية مع رسوميات متطورة وتأثيرات بصرية مذهلة. مشروع HTML5 مع JavaScript متقدم و Canvas API.',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'Game Design'],
      features: [
        'رسوميات متطورة وتأثيرات بصرية',
        'نظام قتال فضائي متقدم',
        'مركبات فضائية متنوعة',
        'مستويات متدرجة الصعوبة',
        'تأثيرات صوتية ومرئية'
      ],
      links: [
        { url: 'https://github.com/FDJTS/Spaceships.', text: 'GitHub Repository', type: 'primary' },
        { url: '#', text: 'Demo', type: 'secondary' }
      ]
    },
    'portfolio': {
      title: 'Portfolio Website',
      image: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/html5.svg',
      description: 'موقع شخصي متقدم مع تصميم responsive وتأثيرات بصرية متطورة. يتضمن نظام PWA، أنيميشن متقدم، وتصميم متجاوب لجميع الأجهزة.',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'PWA', 'Responsive Design'],
      features: [
        'تصميم متجاوب لجميع الأجهزة',
        'تأثيرات بصرية متطورة',
        'نظام PWA للتثبيت',
        'أنيميشن متقدم',
        'تحسين SEO'
      ],
      links: [
        { url: 'https://github.com/FDJTS/Portfolio', text: 'GitHub Repository', type: 'primary' },
        { url: 'https://fdjts.netlify.app/', text: 'عرض الموقع', type: 'secondary' }
      ]
    },
    'infiniware': {
      title: 'Infiniware',
      image: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bootstrap.svg',
      description: 'موقع تجريبي لبيع مكونات أجهزة الكمبيوتر مع تصميم احترافي وواجهة مستخدم متطورة. يستخدم Bootstrap لتصميم responsive ومتجاوب.',
      technologies: ['HTML5', 'CSS3', 'Bootstrap', 'E-commerce', 'Responsive Design'],
      features: [
        'تصميم احترافي ومتجاوب',
        'واجهة مستخدم متطورة',
        'نظام عرض المنتجات',
        'تصميم Bootstrap متقدم',
        'تحسين تجربة المستخدم'
      ],
      links: [
        { url: 'https://github.com/FDJTS/Infiniware', text: 'GitHub Repository', type: 'primary' },
        { url: '#', text: 'Demo', type: 'secondary' }
      ]
    },
    'arch-tutorial': {
      title: 'Arch Linux Tutorial',
      image: 'Archlinux-logo-standard-version.png',
      description: 'شروحات مفصلة وتفصيلية لتثبيت وإعداد Arch Linux مع نصائح وحيل متقدمة للمطورين والمستخدمين المتقدمين. يتضمن شروحات فيديو وأكواد.',
      technologies: ['Bash', 'Arch Linux', 'System Administration', 'Shell Scripting', 'Tutorial'],
      features: [
        'شروحات مفصلة خطوة بخطوة',
        'نصائح وحيل متقدمة',
        'أكواد وتكوينات جاهزة',
        'دعم للمطورين والمستخدمين المتقدمين',
        'شروحات فيديو على YouTube'
      ],
      links: [
        { url: 'tutorials-archlinux.html', text: 'شاهد الشرح الكامل', type: 'primary' },
        { url: 'https://www.youtube.com/@FDJTS', text: 'YouTube Channel', type: 'secondary' }
      ]
    },
    'godot-development': {
      title: 'Godot Game Development',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Godot_icon.svg',
      description: 'مشاريع تطوير ألعاب باستخدام Godot Engine مع شروحات مفصلة وتقنيات متقدمة في البرمجة والتصميم. يتضمن مشاريع متنوعة من 2D إلى 3D.',
      technologies: ['Godot Engine', 'GDScript', 'C++', 'Game Design', '3D Graphics'],
      features: [
        'شروحات تطوير ألعاب متقدمة',
        'تقنيات برمجة متطورة',
        'تصميم ألعاب 2D و 3D',
        'فيزياء ورسوميات متقدمة',
        'شروحات فيديو تفصيلية'
      ],
      links: [
        { url: 'tutorials-godot.html', text: 'شاهد الشرح الكامل', type: 'primary' },
        { url: 'https://www.youtube.com/@FDJTS', text: 'YouTube Channel', type: 'secondary' }
      ]
    }
  };
  
  return projects[projectId] || projects['portfolio'];
}

// تحميل إحصائيات GitHub الحقيقية
async function loadGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/users/FDJTS');
    const userData = await response.json();
    
    // تحديث إحصائيات المستخدم
    if (userData.public_repos) {
      animateNumber('totalProjects', userData.public_repos);
    }
    
    // تحميل إحصائيات المستودعات
    const reposResponse = await fetch('https://api.github.com/users/FDJTS/repos');
    const repos = await reposResponse.json();
    
    let totalStars = 0;
    let totalForks = 0;
    
    repos.forEach(repo => {
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
    });
    
    animateNumber('totalStars', totalStars);
    animateNumber('totalForks', totalForks);
    
  } catch (error) {
    console.log('تعذر تحميل إحصائيات GitHub:', error);
  }
}

// إعداد جميع الوظائف عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // إعداد البحث والفلترة
  initProjectSearchAndFilter();
  
  // تحميل إحصائيات GitHub
  loadGitHubStats();
  
  // تحديث الإحصائيات الأولية
  updateProjectStats();
  
  // إضافة أنيميشن للبطاقات
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-in');
  });
  
  // إعداد الإحصائيات المتقدمة للصفحة الرئيسية
  initAdvancedStats();
  
  // إعداد أنيميشن المهارات
  initSkillsAnimation();
});

// إضافة CSS للأنيميشن
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .project-modal {
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 15px 0;
  }
  
  .project-modal-features ul {
    list-style: none;
    padding: 0;
  }
  
  .project-modal-features li {
    padding: 8px 0;
    border-bottom: 1px solid var(--surface2);
  }
  
  .project-modal-features li:before {
    content: "✓ ";
    color: var(--main);
    font-weight: bold;
  }
  
  .project-modal-links {
    display: flex;
    gap: 15px;
    margin-top: 20px;
  }
`;
document.head.appendChild(style);

// ===== وظائف الإحصائيات المتقدمة =====

// إعداد الإحصائيات المتقدمة للصفحة الرئيسية
function initAdvancedStats() {
  const statsData = {
    homeTotalProjects: 15,
    homeTotalTutorials: 8,
    homeExperience: 3,
    homeSatisfaction: 100,
    homeFollowers: 250,
    homeSuccessRate: 95
  };
  
  // أنيميشن الأرقام مع تأخير
  Object.keys(statsData).forEach((key, index) => {
    setTimeout(() => {
      animateNumber(key, statsData[key]);
    }, index * 200);
  });
}

// إعداد أنيميشن المهارات
function initSkillsAnimation() {
  const skillBars = document.querySelectorAll('.skill-fill');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const skillFill = entry.target;
        const level = skillFill.dataset.level;
        
        // تأخير بسيط للأنيميشن
        setTimeout(() => {
          skillFill.style.width = level + '%';
          skillFill.style.setProperty('--target-width', level + '%');
        }, 100);
        
        observer.unobserve(skillFill);
      }
    });
  }, { threshold: 0.5 });
  
  skillBars.forEach(bar => {
    observer.observe(bar);
  });
}

// تحسين نموذج التواصل
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const formMsg = document.getElementById('formMsg');
    const formData = new FormData(this);
    
    // إظهار حالة التحميل
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loader"></span> جاري الإرسال...';
    formMsg.style.display = 'none';
    
    try {
      // محاكاة إرسال الرسالة (يمكن استبدالها بخدمة حقيقية)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // إظهار رسالة النجاح
      formMsg.className = 'form-msg success';
      formMsg.textContent = 'تم إرسال رسالتك بنجاح! سأقوم بالرد عليك قريباً.';
      formMsg.style.display = 'block';
      
      // إعادة تعيين النموذج
      this.reset();
      
      // إضافة تأثير بصري
      formMsg.style.animation = 'fadeInUp 0.5s ease';
      
    } catch (error) {
      // إظهار رسالة الخطأ
      formMsg.className = 'form-msg error';
      formMsg.textContent = 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.';
      formMsg.style.display = 'block';
      formMsg.style.animation = 'fadeInUp 0.5s ease';
    } finally {
      // إعادة تفعيل الزر
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'إرسال الرسالة';
    }
  });
}

// تحسين الأداء مع Lazy Loading متقدم
function initAdvancedLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // إضافة تأثير fade-in للصورة
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';
        
        img.onload = function() {
          this.style.opacity = '1';
        };
        
        // تحميل الصورة
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px' });
  
  images.forEach(img => imageObserver.observe(img));
}

// تحسين التمرير السلس
function initSmoothScrollingEnhanced() {
  // إضافة تأثير parallax خفيف
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-header .hero-img img');
    
    parallaxElements.forEach(element => {
      const speed = 0.5;
      element.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
  
  // تحسين التمرير السلس
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// إضافة تأثيرات صوتية متقدمة
function initAdvancedSoundEffects() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  function playHoverSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
  
  function playClickSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
  
  // إضافة الصوت للأزرار والروابط
  document.querySelectorAll('button, .cta, .project-link').forEach(btn => {
    btn.addEventListener('mouseenter', playHoverSound);
    btn.addEventListener('click', playClickSound);
  });
}

// تحسينات للهواتف المحمولة
function initMobileEnhancements() {
  if (window.innerWidth <= 768) {
    // تحسين اللمس
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // تحسين الأداء على الهواتف
    const heavyAnimations = document.querySelectorAll('.floating-animation, .pulse-animation');
    heavyAnimations.forEach(el => {
      el.style.animation = 'none';
    });
    
    // تحسين التمرير
    let isScrolling = false;
    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          // تحديث المواضع
          isScrolling = false;
        });
        isScrolling = true;
      }
    }, { passive: true });
  }
}

// إضافة جميع التحسينات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // التحسينات الأساسية
  initContactForm();
  initAdvancedLazyLoading();
  initSmoothScrollingEnhanced();
  initMobileEnhancements();
  
  // التحسينات المتقدمة (اختيارية)
  if (localStorage.getItem('soundEnabled') === 'true') {
    initAdvancedSoundEffects();
  }
  
  // إضافة زر تفعيل/إلغاء الصوت
  const soundToggle = document.createElement('button');
  soundToggle.innerHTML = '🔊';
  soundToggle.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: var(--surface2);
    color: var(--main);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  `;
  
  soundToggle.addEventListener('click', function() {
    const isEnabled = localStorage.getItem('soundEnabled') === 'true';
    localStorage.setItem('soundEnabled', !isEnabled);
    this.innerHTML = !isEnabled ? '🔊' : '🔇';
    
    if (!isEnabled) {
      initAdvancedSoundEffects();
    }
  });
  
  document.body.appendChild(soundToggle);
});

