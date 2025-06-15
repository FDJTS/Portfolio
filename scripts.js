// زر الوضع الليلي/الفاتح نصي
document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.querySelector(".toggle-theme");
  function updateThemeBtn() {
    if (document.body.classList.contains("light")) {
      themeBtn.textContent = "تفعيل الوضع الليلي";
    } else {
      themeBtn.textContent = "تفعيل الوضع الفاتح";
    }
  }
  if (themeBtn) {
    // استرجاع الوضع من localStorage
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

  // تحميل مشاريع GitHub تلقائياً (تغيير اسم المستخدم حسب حسابك)
  if (document.getElementById("github-projects")) {
    loadGitHubProjects();
  }

  // أنيميشن عند ظهور العناصر بالتمرير
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll("section, .project-card, .tutorial-card, .comment-box").forEach(el => {
    observer.observe(el);
  });

  // معالجة فورم التواصل إذا لم يعمل PHP
  const contactForm = document.querySelector('.contact-form');
  if (contactForm && contactForm.action.endsWith('contact.php')) {
    contactForm.addEventListener('submit', function(e) {
      // إذا كان الموقع على file:// أو لم يعمل PHP
      if (location.protocol === 'file:' || location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
        e.preventDefault();
        alert("تم إرسال رسالتك بنجاح (وهمي - PHP غير مفعل)!");
        contactForm.reset();
      }
    });
  }
});

// جلب مشاريع GitHub وعرضها كبطاقات
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
      // صور عشوائية لكل مشروع
      const imgUrl = `https://picsum.photos/seed/zyad${i+1}/400/180`;
      grid.innerHTML += `
        <div class="project-card">
          <img src="${imgUrl}" alt="Project image">
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