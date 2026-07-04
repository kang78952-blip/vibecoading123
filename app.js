const state = {
  search: "",
  area: "전체",
  category: "전체",
  mood: "전체",
  sort: "rating"
};

const CATEGORY_META = {
  "전체": {
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80",
    tint: "linear-gradient(160deg, rgba(20,20,28,0.15), rgba(20,20,28,0.55))"
  },
  "한식": {
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80",
    tint: "linear-gradient(160deg, rgba(90,55,20,0.1), rgba(90,55,20,0.6))"
  },
  "양식": {
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=400&q=80",
    tint: "linear-gradient(160deg, rgba(40,20,10,0.1), rgba(40,20,10,0.55))"
  },
  "일식": {
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=80",
    tint: "linear-gradient(160deg, rgba(10,30,40,0.1), rgba(10,30,40,0.55))"
  },
  "중식": {
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80",
    tint: "linear-gradient(160deg, rgba(80,30,10,0.1), rgba(80,30,10,0.55))"
  },
  "아시안": {
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
    tint: "linear-gradient(160deg, rgba(60,40,10,0.1), rgba(60,40,10,0.55))"
  },
  "카페": {
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
    tint: "linear-gradient(160deg, rgba(30,20,10,0.1), rgba(30,20,10,0.5))"
  },
  "치킨": {
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&h=400&q=80",
    tint: "linear-gradient(160deg, rgba(70,40,10,0.1), rgba(70,40,10,0.55))"
  },
  "분식": {
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=400&q=80",
    tint: "linear-gradient(160deg, rgba(90,20,30,0.1), rgba(90,20,30,0.55))"
  }
};

const areas = ["전체", ...new Set(RESTAURANTS.map(r => r.area))];
const categories = ["전체", ...new Set(RESTAURANTS.map(r => r.category))];
const moods = ["전체", ...new Set(RESTAURANTS.flatMap(r => r.mood))];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function getCategoryCount(category) {
  if (category === "전체") return RESTAURANTS.length;
  return RESTAURANTS.filter(r => r.category === category).length;
}

function filterRestaurants() {
  return RESTAURANTS.filter(r => {
    const q = state.search.toLowerCase();
    const matchSearch = !q ||
      r.name.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.menu.some(m => m.toLowerCase().includes(q));

    const matchArea = state.area === "전체" || r.area === state.area;
    const matchCategory = state.category === "전체" || r.category === state.category;
    const matchMood = state.mood === "전체" || r.mood.includes(state.mood);

    return matchSearch && matchArea && matchCategory && matchMood;
  });
}

function sortRestaurants(list) {
  const sorted = [...list];
  switch (state.sort) {
    case "reviews":
      sorted.sort((a, b) => b.reviews - a.reviews);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
      break;
    default:
      sorted.sort((a, b) => b.rating - a.rating);
  }
  return sorted;
}

function setCategory(category, scrollToList = false) {
  state.category = category;
  syncFilterUI();
  renderList();
  renderFeatured();

  if (scrollToList) {
    $("#list").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function syncFilterUI() {
  renderTopCategories();
  renderChips("#areaFilters", areas, "area");
  renderChips("#categoryFilters", categories, "category");
  renderChips("#moodFilters", moods, "mood");
  updateListTitle();
}

function updateListTitle() {
  const title = state.category === "전체"
    ? "전체 맛집"
    : `${state.category} 맛집`;
  $("#listTitle").textContent = title;
}

function renderTopCategories() {
  const container = $("#topCategoryNav");
  container.innerHTML = "";

  categories.forEach(cat => {
    const meta = CATEGORY_META[cat] || {
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
      tint: "linear-gradient(160deg, rgba(0,0,0,0.1), rgba(0,0,0,0.5))"
    };
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-card" + (state.category === cat ? " active" : "");
    btn.innerHTML = `
      <span class="category-card__visual">
        <img class="category-card__img" src="${meta.image}" alt="${cat}" loading="lazy">
        <span class="category-card__overlay" style="background:${meta.tint}"></span>
        <span class="category-card__count">${getCategoryCount(cat)}</span>
      </span>
      <span class="category-card__label">${cat}</span>
    `;
    btn.addEventListener("click", () => setCategory(cat, true));
    container.appendChild(btn);
  });
}

function createFeaturedCard(r) {
  const card = document.createElement("article");
  card.className = "featured-card fade-in";
  card.innerHTML = `
    <img src="${r.image}" alt="${r.name}" loading="lazy">
    <span class="featured-card__badge">에디터 추천</span>
    <div class="featured-card__overlay">
      <h3 class="featured-card__name">${r.name}</h3>
      <p class="featured-card__meta">${r.area} · ${r.category} · ★ ${r.rating}</p>
    </div>
  `;
  card.addEventListener("click", () => openModal(r.id));
  return card;
}

function createRestaurantCard(r) {
  const card = document.createElement("article");
  card.className = "restaurant-card fade-in";
  card.innerHTML = `
    <img class="restaurant-card__img" src="${r.image}" alt="${r.name}" loading="lazy">
    <div class="restaurant-card__body">
      <div class="restaurant-card__top">
        <h3 class="restaurant-card__name">${r.name}</h3>
        <span class="restaurant-card__rating">★ ${r.rating}</span>
      </div>
      <div class="restaurant-card__tags">
        <span class="tag">${r.category}</span>
        <span class="tag">${r.area}</span>
        ${r.mood.map(m => `<span class="tag">${m}</span>`).join("")}
      </div>
      <div class="restaurant-card__info">
        <span>${r.price} · ${r.hours}</span>
        <span>리뷰 ${r.reviews}개</span>
      </div>
    </div>
  `;
  card.addEventListener("click", () => openModal(r.id));
  return card;
}

function renderChips(containerId, items, filterKey) {
  const container = $(containerId);
  container.innerHTML = "";
  items.forEach(item => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (state[filterKey] === item ? " active" : "");
    btn.textContent = item;
    btn.addEventListener("click", () => {
      if (filterKey === "category") {
        setCategory(item);
      } else {
        state[filterKey] = item;
        syncFilterUI();
        renderList();
      }
    });
    container.appendChild(btn);
  });
}

function renderFeatured() {
  const grid = $("#featuredGrid");
  grid.innerHTML = "";
  const list = RESTAURANTS.filter(r => {
    const matchCategory = state.category === "전체" || r.category === state.category;
    return r.featured && matchCategory;
  });

  if (list.length === 0) {
    grid.closest(".section").hidden = true;
    return;
  }

  grid.closest(".section").hidden = false;
  list.forEach(r => grid.appendChild(createFeaturedCard(r)));
  initScrollAnimation();
}

function renderList() {
  const filtered = sortRestaurants(filterRestaurants());
  const grid = $("#restaurantGrid");
  const empty = $("#emptyState");

  $("#resultCount").textContent = `${filtered.length}개의 맛집`;
  grid.innerHTML = "";

  if (filtered.length === 0) {
    empty.hidden = false;
    grid.hidden = true;
  } else {
    empty.hidden = true;
    grid.hidden = false;
    filtered.forEach(r => grid.appendChild(createRestaurantCard(r)));
    initScrollAnimation();
  }
}

function renderStats() {
  $("#totalCount").textContent = RESTAURANTS.length;
  const avg = RESTAURANTS.reduce((s, r) => s + r.rating, 0) / RESTAURANTS.length;
  $("#avgRating").textContent = avg.toFixed(1);
  $("#categoryCount").textContent = categories.length - 1;
}

function openModal(id) {
  const r = RESTAURANTS.find(x => x.id === id);
  if (!r) return;

  $("#modalContent").innerHTML = `
    <img class="modal__hero" src="${r.image}" alt="${r.name}">
    <div class="modal__body">
      <h2 class="modal__title" id="modalTitle">${r.name}</h2>
      <div class="modal__rating-row">
        <strong>★ ${r.rating}</strong>
        <span>리뷰 ${r.reviews}개</span>
        <span>${r.area} · ${r.category}</span>
      </div>
      <p class="modal__desc">${r.desc}</p>
      <div class="modal__section">
        <h4>대표 메뉴</h4>
        <div class="modal__menu">${r.menu.map(m => `<span>${m}</span>`).join("")}</div>
      </div>
      <div class="modal__section">
        <h4>분위기</h4>
        <div class="modal__moods">${r.mood.map(m => `<span class="tag">${m}</span>`).join("")}</div>
      </div>
      <div class="modal__section">
        <h4>정보</h4>
        <p style="color:var(--text-muted);font-size:0.9rem;">
          가격대: ${r.price}<br>
          영업시간: ${r.hours}
        </p>
      </div>
    </div>
  `;

  const modal = $("#modal");
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = $("#modal");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function resetFilters() {
  state.search = "";
  state.area = "전체";
  state.category = "전체";
  state.mood = "전체";
  $("#searchInput").value = "";
  syncFilterUI();
  renderList();
  renderFeatured();
}

let scrollObserver = null;

function initScrollAnimation() {
  if (!scrollObserver) {
    scrollObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("appear");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
  }

  $$(".fade-in:not(.appear)").forEach(el => {
    if (!el.dataset.observed) {
      scrollObserver.observe(el);
      el.dataset.observed = "true";
    }
  });
}

function init() {
  renderStats();
  syncFilterUI();
  renderFeatured();
  renderList();
  initScrollAnimation();

  $("#searchInput").addEventListener("input", (e) => {
    state.search = e.target.value.trim();
    renderList();
  });

  $("#sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderList();
  });

  $("#resetFilters").addEventListener("click", resetFilters);
  $("#emptyReset").addEventListener("click", resetFilters);

  $$("[data-close]").forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

init();
