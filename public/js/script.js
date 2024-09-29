const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const categorySelect = document.getElementById('category');
const filterCategorySelect = document.getElementById('filter-category');
const sortByTitleBtn = document.getElementById('sort-by-title');
const sortByDateBtn = document.getElementById('sort-by-date');
const otherInput = document.getElementById('other-input');
const searchBar = document.getElementById('search-bar');
const descriptionInput = document.getElementById('description');
const charCountElement = document.getElementById('char-count');
const maxChars = 50;
let tasks = [];

// Show/hide the "Other" category input
categorySelect.addEventListener('change', () => {
  otherInput.style.display = categorySelect.value === 'Other' ? 'block' : 'none';
});

// Update character count
descriptionInput.addEventListener('input', () => {
  const currentLength = descriptionInput.value.length;
  charCountElement.textContent = `${currentLength}/${maxChars} characters`;
});

// Filter and sort tasks
function applyFilterAndSort(filteredTasks) {
  const userId = sessionStorage.getItem('userId');
  if (!userId) return;

  filteredTasks = filteredTasks.filter(task => task.userId === parseInt(userId));

  const searchTerm = searchBar.value.toLowerCase();
  if (searchTerm) {
    filteredTasks = filteredTasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
  }

  // Sort tasks based on active sorting option
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (sortByTitleBtn.classList.contains('active')) {
      return a.title.localeCompare(b.title);
    } else if (sortByDateBtn.classList.contains('active')) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    return 0;
  });

  renderTasks(sortedTasks);
}

// Filter tasks by category
function filterTasks() {
  const selectedCategory = filterCategorySelect.value;
  let filteredTasks = tasks.filter(task => {
    if (selectedCategory === 'all') return true; // Show all tasks
    if (selectedCategory === 'Other') return task.category !== 'Work' && task.category !== 'Personal'; // Show custom categories
    return task.category === selectedCategory; // Show specific category
  });
  applyFilterAndSort(filteredTasks);
}


// Fetch tasks from the server
async function fetchTasks() {
  try {
    const userId = sessionStorage.getItem('userId');
    const response = await fetch(`/api/tasks?userId=${userId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    tasks = data || [];
    filterTasks();
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}
// Render tasks to the DOM
function renderTasks(tasksToRender) {
  taskList.innerHTML = '';
  tasksToRender.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    if (task.completed) taskElement.classList.add('completed');

    taskElement.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
      <p><strong>Category:</strong> ${task.category}</p>
      <div class="task-actions">
        <button class="toggle-task" onclick="toggleTask('${task.id}')">
          <img src="./images/complete.png" alt="Complete Task" /> 
        </button>
        <button class="edit-task" onclick="editTask('${task.id}')">
          <img src="./images/edit.png" alt="Edit Task" /> 
        </button>
        <button class="delete-task" onclick="deleteTask('${task.id}')">
          <img src="./images/delete.png" alt="Delete Task" /> 
        </button>
      </div>
    `;
    taskList.appendChild(taskElement);
    // Attach event listeners to buttons
    taskElement.querySelector('.toggle-task').addEventListener('click', () => toggleTask(task.id));
    taskElement.querySelector('.edit-task').addEventListener('click', () => editTask(task.id));
    taskElement.querySelector('.delete-task').addEventListener('click', () => deleteTask(task.id));
  });
}
// Add a new task
async function addTask(event) {
  event.preventDefault();
  try {
    const title = document.getElementById('title').value;
    const description = descriptionInput.value;
    const dueDate = document.getElementById('due-date').value;
    const category = categorySelect.value === 'Other' ? otherInput.value : categorySelect.value;
    const userId = sessionStorage.getItem('userId');

    const task = { title, description, dueDate, category, userId };
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    fetchTasks();
    taskForm.reset();
    charCountElement.textContent = `0/${maxChars} characters`;
  } catch (error) {
    console.error('Error adding task:', error);
  }
}

// Delete a task
async function deleteTask(id) {
  try {
    const userId = sessionStorage.getItem('userId');
    const response = await fetch(`/api/tasks/${id}?userId=${userId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    fetchTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

// Toggle task completion
async function toggleTask(id) {
  try {
    const userId = sessionStorage.getItem('userId');
    const response = await fetch(`/api/tasks/${id}/toggle?userId=${userId}`, { method: 'PUT' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    fetchTasks();
  } catch (error) {
    console.error('Error toggling task:', error);
  }
}

async function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const formHTML = `
    <div id="edit-form">
      <h2>Edit Task</h2>
      <input type="text" id="edit-title" value="${task.title}" required>
      <textarea id="edit-description" maxlength="50" required>${task.description}</textarea>
      <input type="date" id="edit-due-date" value="${new Date(task.dueDate).toISOString().split('T')[0]}" required>
      <select id="edit-category" required>
        <option value="Work" ${task.category === 'Work' ? 'selected' : ''}>Work</option>
        <option value="Personal" ${task.category === 'Personal' ? 'selected' : ''}>Personal</option>
        <option value="Other" ${task.category === 'Other' ? 'selected' : ''}>Other</option>
      </select>
      <input type="text" id="other-input-edit" placeholder="Specify other category" style="display: ${task.category === 'Other' ? 'block' : 'none'};" value="${task.category === 'Other' ? task.description : ''}">
      <button id="save-edit">Save Changes</button>
      <button id="cancel-edit">Cancel</button>
    </div>
  `;

  taskList.innerHTML = formHTML;

  // Show/hide the "Other" category input
  document.getElementById('edit-category').addEventListener('change', function() {
    const otherInputEdit = document.getElementById('other-input-edit');
    otherInputEdit.style.display = this.value === 'Other' ? 'block' : 'none';
  });

  document.getElementById('save-edit').addEventListener('click', async () => {
    const updatedTask = {
      title: document.getElementById('edit-title').value,
      description: document.getElementById('edit-description').value,
      dueDate: document.getElementById('edit-due-date').value,
      category: document.getElementById('edit-category').value === 'Other' ? document.getElementById('other-input-edit').value : document.getElementById('edit-category').value,
    };

    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });

    fetchTasks();
  });

  document.getElementById('cancel-edit').addEventListener('click', fetchTasks);
}
// Event Listeners
taskForm.addEventListener('submit', addTask);
sortByTitleBtn.addEventListener('click', () => {
  sortByTitleBtn.classList.add('active');
  sortByDateBtn.classList.remove('active');
  filterTasks();
});
sortByDateBtn.addEventListener('click', () => {
  sortByTitleBtn.classList.remove('active');
  sortByDateBtn.classList.add('active');
  filterTasks();
});
filterCategorySelect.addEventListener('change', filterTasks);
searchBar.addEventListener('input', searchTasks);

// Search tasks
function searchTasks() {
  const searchTerm = searchBar.value.toLowerCase();
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm) ||
    task.description.toLowerCase().includes(searchTerm)
  );
  renderTasks(filteredTasks);
}

// Logout
document.getElementById('logout-button').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    if (response.ok) window.location.href = '/';
  } catch (error) {
    console.error('Error logging out:', error);
  }
});

// Initial fetch
fetchTasks();
