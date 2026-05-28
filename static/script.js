// Глобальні змінні
let currentFilter = 'all';
let currentCategory = '';
let currentPriority = '';

// Ініціалізація
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadTodos();
    loadStats();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('add-todo-form').addEventListener('submit', handleAddTodo);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });

    document.getElementById('filter-category').addEventListener('change', function() {
        currentCategory = this.value;
        loadTodos();
    });

    document.getElementById('filter-priority').addEventListener('change', function() {
        currentPriority = this.value;
        loadTodos();
    });
}

// Handle add todo form
function handleAddTodo(e) {
    e.preventDefault();

    const title = document.getElementById('todo-title').value.trim();
    const description = document.getElementById('todo-description').value.trim();
    const category = document.getElementById('todo-category').value;
    const priority = document.getElementById('todo-priority').value;

    if (!title) {
        alert('Будь ласка, введіть назву завдання');
        return;
    }

    const data = {
        title: title,
        description: description,
        category: category,
        priority: priority
    };

    fetch('/api/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('add-todo-form').reset();
        loadTodos();
        loadStats();
    })
    .catch(error => console.error('Error:', error));
}

// Handle filter change
function handleFilterChange(e) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    loadTodos();
}

// Load todos
function loadTodos() {
    let url = `/api/todos?filter=${currentFilter}`;
    if (currentCategory) url += `&category=${currentCategory}`;
    if (currentPriority) url += `&priority=${currentPriority}`;

    fetch(url)
    .then(response => response.json())
    .then(todos => {
        renderTodos(todos);
    })
    .catch(error => console.error('Error:', error));
}

// Render todos
function renderTodos(todos) {
    const todosList = document.getElementById('todos-list');

    if (todos.length === 0) {
        todosList.innerHTML = '<p class="empty-state">Завдань не знайдено. Додайте нове! 🚀</p>';
        return;
    }

    todosList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id}, this.checked)"
            >
            <div class="todo-content">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                <div class="todo-meta">
                    <span class="todo-badge badge-category">${escapeHtml(todo.category)}</span>
                    <span class="todo-badge badge-priority-${todo.priority.toLowerCase()}">${getPriorityEmoji(todo.priority)} ${todo.priority}</span>
                    <span class="todo-date">📅 ${todo.created_at}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn-small btn-edit" onclick="editTodo(${todo.id})">✏️ Редагувати</button>
                <button class="btn-small btn-delete" onclick="deleteTodo(${todo.id})">🗑️ Видалити</button>
            </div>
        </div>
    `).join('');
}

// Toggle todo
function toggleTodo(id, completed) {
    fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: completed })
    })
    .then(response => response.json())
    .then(data => {
        loadTodos();
        loadStats();
    })
    .catch(error => console.error('Error:', error));
}

// Delete todo
function deleteTodo(id) {
    if (!confirm('Ви впевнені, що хочете видалити це завдання?')) {
        return;
    }

    fetch(`/api/todos/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        loadTodos();
        loadStats();
    })
    .catch(error => console.error('Error:', error));
}

// Edit todo (placeholder for future implementation)
function editTodo(id) {
    alert('Функція редагування буде додана в майбутніх версіях');
}

// Load stats
function loadStats() {
    fetch('/api/stats')
    .then(response => response.json())
    .then(stats => {
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-completed').textContent = stats.completed;
        document.getElementById('stat-pending').textContent = stats.pending;
    })
    .catch(error => console.error('Error:', error));
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to get priority emoji
function getPriorityEmoji(priority) {
    const emojis = {
        'Низька': '🟢',
        'Нормальна': '🟡',
        'Висока': '🔴'
    };
    return emojis[priority] || '';
}
