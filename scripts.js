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

  if (document.getElementById("github-projects")) {
    loadGitHubProjects();
  }

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
