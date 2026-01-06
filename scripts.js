document.addEventListener("DOMContentLoaded", () => {
  // Inject Background Layer first
  const bgLayer = document.createElement("div");
  bgLayer.className = "page-bg";
  document.body.prepend(bgLayer);

  // Page Transition: Fade In
  document.body.classList.add('visible');

  // --- 1. Navigation & Theme Logic ---

  // Theme Toggle
  const themeBtn = document.querySelector(".toggle-theme");
  function updateThemeBtn() {
    if (document.body.classList.contains("light")) {
      themeBtn.textContent = "☀️ Light Mode";
    } else {
      themeBtn.textContent = "🌙 Dark Mode";
    }
  }
  if (themeBtn) {
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light");
    }
    updateThemeBtn();
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("light");
      localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
      updateThemeBtn();
    });
  }

  // Mobile Menu Injection & Logic
  const nav = document.querySelector("nav");
  if (nav) {
    let hamburger = nav.querySelector(".hamburger");
    if (!hamburger) {
      hamburger = document.createElement("button");
      hamburger.className = "hamburger";
      hamburger.innerHTML = "☰";
      hamburger.setAttribute("aria-label", "Toggle Menu");
      const ul = nav.querySelector("ul");
      if (ul) nav.insertBefore(hamburger, ul);
    }

    const hamburgerBtn = nav.querySelector(".hamburger");
    const ul = nav.querySelector("ul");

    if (hamburgerBtn && ul) {
      hamburgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        ul.classList.toggle("show-menu");
        const isOpen = ul.classList.contains("show-menu");
        hamburgerBtn.innerHTML = isOpen ? "✕" : "☰";
        document.body.style.overflow = isOpen ? "hidden" : "";
      });

      document.addEventListener("click", (e) => {
        if (ul.classList.contains("show-menu") && !ul.contains(e.target) && !hamburgerBtn.contains(e.target)) {
          ul.classList.remove("show-menu");
          hamburgerBtn.innerHTML = "☰";
          document.body.style.overflow = "";
        }
      });

      ul.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
          ul.classList.remove("show-menu");
          hamburgerBtn.innerHTML = "☰";
          document.body.style.overflow = "";
        });
      });
    }
  }

  // --- 2. Advanced Interactivity ---

  // Magnetic Buttons Effect
  document.querySelectorAll('.cta, .secondary, .source-code-link, .app-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const position = btn.getBoundingClientRect();
      const x = e.pageX - position.left - window.scrollX;
      const y = e.pageY - position.top - window.scrollY;
      const centerX = position.width / 2;
      const centerY = position.height / 2;
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      btn.style.transform = `translate(${deltaX * 0.3}px, ${deltaY * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // 3D Parallax Tilt for Cards
  document.querySelectorAll('.project-card, .tutorial-card, .app-card, .info-card, .now-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      const tiltX = (y - 0.5) * 10;
      const tiltY = (x - 0.5) * -10;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Typewriter Effect for Hero Sub-headers
  const typeTarget = document.querySelector('.hero-content p.slide-in-text');
  if (typeTarget) {
    const originalText = typeTarget.textContent;
    typeTarget.textContent = '';
    let i = 0;
    function type() {
      if (i < originalText.length) {
        typeTarget.textContent += originalText.charAt(i);
        i++;
        setTimeout(type, 30);
      }
    }
    setTimeout(type, 800);
  }

  // Reading Progress Bar
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress-bar';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });

  // Scroll-to-Top
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.className = 'scroll-top-btn';
  scrollTopBtn.innerHTML = '↑';
  document.body.appendChild(scrollTopBtn);

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) scrollTopBtn.classList.add('visible');
    else scrollTopBtn.classList.remove('visible');
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Developer Console Credits
  console.log(
    "%c FDJTS %c Professional Portfolio %c v2.0 ",
    "color: #fff; background: #000; padding: 5px 10px; border-radius: 5px 0 0 5px; font-weight: bold;",
    "color: #000; background: #fff; padding: 5px 10px; font-weight: bold;",
    "color: #fff; background: #4a90e2; padding: 5px 10px; border-radius: 0 5px 5px 0; font-weight: bold;"
  );

  // --- 3. Background & Animations ---

  // Multi-Sphere Moving Background
  const spheres = [];
  const sphereCount = 3;
  for (let i = 1; i <= sphereCount; i++) {
    const s = document.createElement("div");
    s.className = `moving-sphere sphere-${i}`;
    document.body.appendChild(s);
    spheres.push({
      el: s,
      x: 0, y: 0,
      targetX: 0, targetY: 0,
      ease: 0.05 + (i * 0.02)
    });
  }

  let mX = 0, mY = 0;
  document.addEventListener("mousemove", (e) => {
    mX = e.clientX;
    mY = e.clientY;
    spheres.forEach(s => s.el.style.opacity = "1");
  });

  function animateSpheres() {
    spheres.forEach((s, i) => {
      const time = Date.now() * 0.001;
      const offsetX = Math.sin(time + i) * 50;
      const offsetY = Math.cos(time + i) * 50;

      s.targetX = mX + offsetX;
      s.targetY = mY + offsetY;

      s.x += (s.targetX - s.x) * s.ease;
      s.y += (s.targetY - s.y) * s.ease;

      s.el.style.transform = `translate(${s.x}px, ${s.y}px) translate(-50%, -50%)`;
    });
    requestAnimationFrame(animateSpheres);
  }
  animateSpheres();

  // Scroll Animation Observer
  const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.projects-grid, .hero-btns, section > div[style*="flex"]').forEach(container => {
    container.querySelectorAll('.project-card, .info-card, .social-link, a, .comment-box').forEach((child, index) => {
      child.classList.add(`stagger-${(index % 5) + 1}`);
      observer.observe(child);
    });
  });

  document.querySelectorAll('section, h1, h2, .hero-content > *, [class*="stagger-"]').forEach(el => observer.observe(el));

  if (document.getElementById("github-projects")) loadGitHubProjects();

  // Home Page Fade
  if (document.body.classList.contains('home-page')) {
    setTimeout(() => document.body.classList.add('visible'), 100);
  }
});

async function loadGitHubProjects() {
  const container = document.getElementById("github-projects");
  if (!container) return;
  container.innerHTML = `<div style="text-align:center;color:var(--main);">Loading projects...  </div>`;
  try {
    const res = await fetch("https://api.github.com/users/FDJTS/repos?sort=updated");
    const repos = await res.json();
    if (!Array.isArray(repos)) throw new Error();
    container.innerHTML = `<div class="projects-grid"></div>`;
    const grid = container.querySelector(".projects-grid");
    repos.slice(0, 6).forEach((repo) => {
      grid.innerHTML += `
        <div class="project-card">
          <h3>${repo.name}</h3>
          <p>${repo.description || "Project description not available."}</p>
          <a href="${repo.html_url}" target="_blank" rel="noopener">Watch on GitHub</a>
        </div>
      `;
    });
    grid.querySelectorAll('.project-card').forEach((card, index) => {
      card.classList.add(`stagger-${(index % 5) + 1}`);
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      });
      obs.observe(card);
    });
  } catch {
    container.innerHTML = `<p style="color:#ffaa00;">Failed to load projects from GitHub.</p>`;
  }
}

function validateEmail(email) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

function copyCode(btn) {
  const codeBox = btn.closest('.code-box');
  const code = codeBox.querySelector('code').innerText.trim();

  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.innerHTML;
    const isArabic = document.documentElement.lang === 'ar';

    btn.innerHTML = isArabic ? "✓ تم النسخ!" : "✓ Copied!";
    btn.classList.add('copied');

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Global exposure for inline onclicks
window.copyCode = copyCode;

