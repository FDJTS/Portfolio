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

// تشغيل التحسينات الإضافية
document.addEventListener('DOMContentLoaded', () => {
  optimizePerformance();
  initKeyboardShortcuts();
  initMobileOptimizations();
  
  // تشغيل التأثيرات الصوتية فقط إذا كان المستخدم يريدها
  if (localStorage.getItem('soundEnabled') === 'true') {
    initSoundEffects();
  }
});

