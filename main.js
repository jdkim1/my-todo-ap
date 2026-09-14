// LocalStorage에 저장할 때 사용하는 키
const STORAGE_KEY = "todo-list-data";

// 할 일 목록 배열 (초기값은 LocalStorage에서 불러온 데이터)
let todos = [];

// 각 할 일 항목에 고유 id를 부여하기 위한 카운터
let nextId = 1;

// 현재 선택된 필터: "all" | "active" | "completed"
let currentFilter = "all";

let inputEl;
let listEl;
let countEl;
let filterBtns;
let clearCompletedBtn;

// 현재 todos 배열을 LocalStorage에 저장하는 함수
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// LocalStorage에서 todos 배열을 불러오는 함수
// 저장된 데이터가 없거나 형식이 올바르지 않으면 빈 배열로 시작한다
function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

// 전체 개수와 완료 개수를 화면에 표시하는 함수
function renderCount() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  countEl.textContent = `전체 ${total}개, 완료 ${completed}개`;
}

// 현재 필터에 맞는 항목만 걸러서 반환하는 함수
function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((t) => !t.completed);
  }
  if (currentFilter === "completed") {
    return todos.filter((t) => t.completed);
  }
  return todos;
}

// 현재 선택된 필터를 버튼 강조 표시에 반영하는 함수
function renderFilterButtons() {
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });
}

// 배열 상태를 기준으로 목록 화면을 다시 그리는 함수
function renderTodos() {
  listEl.innerHTML = "";

  getFilteredTodos().forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = String(todo.id);

    // 완료 여부를 토글하는 체크박스
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    // 할 일 텍스트
    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;

    // 항목을 삭제하는 버튼
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "삭제";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    listEl.appendChild(li);
  });

  renderCount();
  renderFilterButtons();
}

// 입력창의 값을 읽어 새 할 일을 배열에 추가하는 함수
function addTodo() {
  const text = inputEl.value.trim();

  if (text === "") {
    alert("할 일을 입력하세요");
    return;
  }

  // 이미 등록된 할 일인지 확인 (공백 차이는 무시하고 비교)
  const isDuplicate = todos.some((t) => t.text === text);
  if (isDuplicate) {
    alert("이미 등록된 할 일입니다.");
    return;
  }

  todos.push({ id: nextId++, text, completed: false });
  inputEl.value = "";
  saveTodos();
  renderTodos();
}

// 완료/미완료 상태를 토글하는 함수
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
}

// 항목을 배열에서 제거하는 함수
function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

// 완료된 항목을 모두 제거하는 함수
function clearCompletedTodos() {
  if (!confirm("삭제하시겠습니까?")) {
    return;
  }

  todos = todos.filter((t) => !t.completed);
  saveTodos();
  renderTodos();
}

// 필터를 변경하고 목록을 다시 그리는 함수
function setFilter(filter) {
  currentFilter = filter;
  renderTodos();
}

// 앱 초기화 함수: 저장된 데이터 복원, DOM 참조 및 이벤트 리스너 등록
function initApp() {
  inputEl = document.getElementById("todo-input");
  listEl = document.getElementById("todo-list");
  countEl = document.getElementById("todo-count");
  filterBtns = Array.from(document.querySelectorAll(".filter-btn"));
  clearCompletedBtn = document.getElementById("clear-completed-btn");

  // LocalStorage에서 기존 데이터를 불러와 복원
  todos = loadTodos();
  // 다음 id는 기존 항목 중 가장 큰 id + 1로 설정하여 id 중복을 방지
  nextId = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;

  const addBtn = document.getElementById("add-btn");
  addBtn.addEventListener("click", addTodo);

  // Enter 키 입력 시에도 추가되도록 처리
  // 한글 등 조합형 입력(IME) 중에는 Enter가 조합 확정용으로도 발생하므로
  // event.isComposing이 true인 경우(조합 중 발생한 keydown)는 무시한다
  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.isComposing) {
      addTodo();
    }
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  clearCompletedBtn.addEventListener("click", clearCompletedTodos);

  renderTodos();
}

// DOM 로드가 완료되면 initApp 호출
document.addEventListener("DOMContentLoaded", initApp);
