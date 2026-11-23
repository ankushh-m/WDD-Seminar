/* =====================================================
   SETTINGS
   Put the email address that should receive contact-form
   messages between the quotes below.
   ===================================================== */
const CONTACT_EMAIL = "";

/* =====================================================
   1. TYPING EFFECT IN THE HERO HEADING (home page only)
   ===================================================== */
const typedEl = document.getElementById("typed");
if (typedEl) {
  const phrases = ["look great.", "work everywhere.", "feel alive."];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeLoop = () => {
    const current = phrases[phraseIndex];
    charIndex += isDeleting ? -1 : 1;
    typedEl.textContent = current.slice(0, charIndex);

    let delay = isDeleting ? 40 : 90;
    if (!isDeleting && charIndex === current.length) {
      isDeleting = true;
      delay = 1500;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }
    setTimeout(typeLoop, delay);
  };
  typeLoop();
}

/* =====================================================
   2. LIGHT / DARK THEME TOGGLE (saved across pages)
   ===================================================== */
const themeBtn = document.getElementById("themeToggle");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeBtn) themeBtn.textContent = theme === "dark" ? "Light" : "Dark";
  try { localStorage.setItem("theme", theme); } catch (e) { /* storage blocked */ }
}

let savedTheme = "light";
try { savedTheme = localStorage.getItem("theme") || "light"; } catch (e) { /* storage blocked */ }
applyTheme(savedTheme);

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
}

/* =====================================================
   3. MOBILE MENU
   ===================================================== */
const menuBtn = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", isOpen);
  });
}

/* =====================================================
   4. IMAGES: fall back to initials/letter tile if a picture can't load
   ===================================================== */
document.querySelectorAll(".avatar img, .card-media img").forEach((img) => {
  const fail = () => {
    // try the local copy once (if there is one), otherwise show the letter tile
    if (img.dataset.fallback && img.getAttribute("src") !== img.dataset.fallback) {
      img.src = img.dataset.fallback;
    } else {
      img.remove();
    }
  };
  img.addEventListener("error", fail);
  if (img.complete && img.naturalWidth === 0) fail();
});

/* =====================================================
   5. PROJECT FILTER (projects page)
   ===================================================== */
const filterButtons = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll("#cards .card");
const emptyMsg = document.getElementById("filterEmpty");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    const chosen = button.dataset.filter;
    let shown = 0;
    projectCards.forEach((card) => {
      const matches = chosen === "all" || card.dataset.category === chosen;
      card.classList.toggle("hidden", !matches);
      if (matches) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  });
});

/* =====================================================
   6. CONTACT FORM (contact page)
   ===================================================== */
const form = document.getElementById("contactForm");
const successMsg = document.getElementById("formSuccess");

function setError(fieldId, message) {
  document.getElementById(fieldId + "Error").textContent = message;
  document.getElementById(fieldId).classList.toggle("invalid", message !== "");
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setError("name", name === "" ? "Please enter your name." : "");
    setError("email", emailPattern.test(email) ? "" : "Please enter a valid email address.");
    setError("message", message.length < 10 ? "Please write at least 10 characters." : "");

    if (form.querySelector(".invalid")) {
      successMsg.textContent = "";
      return;
    }

    const subject = "Message from " + name + " via the team site";
    const body = message + "\n\n" + name + "\n" + email;

    if (CONTACT_EMAIL) {
      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      successMsg.textContent = "Thanks " + name + ", your email app should open with the message ready to send.";
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(subject + "\n\n" + body).then(() => {
        successMsg.textContent = "Thanks " + name + ", your message is copied. Send it through any link on this page.";
      }).catch(() => {
        successMsg.textContent = "Thanks " + name + ". Please reach us through the links on this page.";
      });
    } else {
      successMsg.textContent = "Thanks " + name + ". Please reach us through the links on this page.";
    }
    form.reset();
  });
}
