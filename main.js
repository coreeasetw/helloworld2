const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');
const sortSelect = document.getElementById('sort');
const template = document.getElementById('card-template');
let shops = [];
let filtered = [];

async function loadData() {
  const res = await fetch('shops.json');
  shops = await res.json();
  populateCategories();
  applyFilters();
}

function populateCategories() {
  const categories = Array.from(new Set(shops.map((s) => s.category).filter(Boolean)));
  categories.sort();
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.append(option);
  });
}

function createCard(shop) {
  const node = template.content.firstElementChild.cloneNode(true);
  const image = node.querySelector('.card__image');
  const title = node.querySelector('.card__title');
  const rating = node.querySelector('.badge.rating');
  const category = node.querySelector('.card__category');
  const address = node.querySelector('.card__address');
  const status = node.querySelector('.card__status');
  const review = node.querySelector('.card__review');
  const mapLink = node.querySelector('.chip:nth-child(1)');
  const phoneLink = node.querySelector('.chip:nth-child(2)');

  image.style.backgroundImage = `url(${CSS.escape(shop.image || '')})`;
  title.textContent = shop.name;
  rating.textContent = shop.rating ? `${shop.rating.toFixed(1)} ★` : 'N/A';
  category.textContent = shop.category || '水電行';
  address.textContent = shop.address || '地址未提供';
  status.textContent = [shop.status, shop.hours].filter(Boolean).join(' · ');
  review.textContent = shop.review || '尚無評論資料';

  mapLink.href = shop.mapUrl;
  phoneLink.href = shop.phone ? `tel:${shop.phone.replace(/\s+/g, '')}` : '#';
  phoneLink.textContent = shop.phone || '暫無電話';
  phoneLink.setAttribute('aria-disabled', shop.phone ? 'false' : 'true');

  return node;
}

function applyFilters() {
  const term = searchInput.value.trim();
  const category = categorySelect.value;
  const sortBy = sortSelect.value;

  filtered = shops.filter((s) => {
    const matchesCategory = category ? s.category === category : true;
    const haystack = `${s.name} ${s.address} ${s.review} ${s.category}`.toLowerCase();
    const matchesTerm = term ? haystack.includes(term.toLowerCase()) : true;
    return matchesCategory && matchesTerm;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'zh-Hant');
    return (b.rating || 0) - (a.rating || 0);
  });

  render();
}

function render() {
  listEl.innerHTML = '';
  emptyEl.hidden = filtered.length !== 0;
  const fragment = document.createDocumentFragment();
  filtered.forEach((shop) => fragment.appendChild(createCard(shop)));
  listEl.appendChild(fragment);
}

searchInput.addEventListener('input', applyFilters);
categorySelect.addEventListener('change', applyFilters);
sortSelect.addEventListener('change', applyFilters);

loadData().catch(() => {
  emptyEl.hidden = false;
  emptyEl.textContent = '資料載入失敗，請稍後再試。';
});
