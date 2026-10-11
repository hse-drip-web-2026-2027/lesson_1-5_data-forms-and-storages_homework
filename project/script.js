const STORAGE_KEY = 'fictional-world-card';
const form = document.querySelector('#world-form');
const statusElement = document.querySelector('.workspace__status');
const statePanels = {
  empty: document.querySelector('[data-state-panel="empty"]'),
  editor: document.querySelector('[data-state-panel="editor"]'),
  viewer: document.querySelector('[data-state-panel="viewer"]'),
};

let savedCard = null;

function setStatus(message) {
  statusElement.textContent = message;
}

function setState(stateName) {
  const states = Object.entries(statePanels);

  states.forEach(([name, panel]) => {
    panel.hidden = name !== stateName;
  });
}

function readStoredCard() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.error('Ошибка чтения карточки из localStorage:', error);
    return null;
  }
}

function writeStoredCard(card) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
  } catch (error) {
    console.error('Ошибка записи карточки в localStorage:', error);
  }
}

function clearStoredCard() {
  localStorage.removeItem(STORAGE_KEY);
}

function fillForm(card) {
  if (!card) {
    form.reset();
    return;
  }

  Object.entries(card).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);

    if (field) {
      field.value = value;
    }
  });
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function renderCard(card) {
  const fields = {
    name: document.querySelector('[data-card-field="name"]'),
    ruler: document.querySelector('[data-card-field="ruler"]'),
    region: document.querySelector('[data-card-field="region"]'),
    magic: document.querySelector('[data-card-field="magic"]'),
    date: document.querySelector('[data-card-field="date"]'),
    legend: document.querySelector('[data-card-field="legend"]'),
  };

  fields.name.textContent = card.name;
  fields.ruler.textContent = card.ruler;
  fields.region.textContent = card.region;
  fields.magic.textContent = `${card.magic} / 10`;
  fields.date.textContent = formatDate(card.date);
  fields.legend.textContent = card.legend;

  setState('viewer');
}

function openEditor(card) {
  fillForm(card);
  setState('editor');
}

function createCard() {
  form.reset();
  setStatus('Новую карту мира можно заполнить');
  setState('editor');
}

function saveCard(event) {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const nextCard = Object.fromEntries(formData.entries());
  nextCard.magic = Number(nextCard.magic);

  savedCard = nextCard;
  writeStoredCard(nextCard);
  renderCard(nextCard);
  setStatus('Карта мира сохранена');
}

function cancelEditing() {
  if (savedCard) {
    renderCard(savedCard);
    setStatus('Изменения не сохранены');
    return;
  }

  form.reset();
  setState('empty');
  setStatus('Данные еще не проверены');
}

function editCard() {
  if (!savedCard) {
    return;
  }

  openEditor(savedCard);
  setStatus('Внесите изменения и сохраните карту');
}

function deleteCard() {
  savedCard = null;
  clearStoredCard();
  form.reset();
  setState('empty');
  setStatus('Карточка удалена');
}

function init() {
  const storedCard = readStoredCard();

  if (storedCard) {
    savedCard = storedCard;
    renderCard(storedCard);
    setStatus('Сохраненная карта загружена');
    return;
  }

  setState('empty');
  setStatus('Данные еще не проверены');
}

document.querySelector('[data-action="create"]').addEventListener('click', createCard);
document.querySelector('[data-action="cancel"]').addEventListener('click', cancelEditing);
document.querySelector('[data-action="edit"]').addEventListener('click', editCard);
document.querySelector('[data-action="delete"]').addEventListener('click', deleteCard);
form.addEventListener('submit', saveCard);

init();

