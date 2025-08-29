document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const jsonInput = document.getElementById('json-input');
    const errorMessage = document.getElementById('error-message');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    const loadExampleBtn = document.getElementById('load-example-btn');
    const fileInput = document.getElementById('file-input');
    const clearBtn = document.getElementById('clear-btn');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const viewContents = document.querySelectorAll('.view-content');

    const treeView = document.getElementById('tree-view');
    const tableView = document.getElementById('table-view');
    const rawView = document.getElementById('raw-view');
    const rawOutput = document.getElementById('raw-output');

    // --- Example JSON Data ---
    const exampleJSON = {
        "projectName": "JSON Visualizer",
        "version": 1.0,
        "author": "Gemini",
        "features": [
            { "id": 1, "name": "Tree View" },
            { "id": 2, "name": "Table View" },
            { "id": 3, "name": "Raw View" }
        ],
        "isAwesome": true,
        "bugs": null
    };

    // --- Event Listeners ---
    jsonInput.addEventListener('input', parseAndRender);
    themeToggleBtn.addEventListener('click', toggleTheme);
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    loadExampleBtn.addEventListener('click', loadExample);
    clearBtn.addEventListener('click', clearInput);
    fileInput.addEventListener('change', importFile);

    // --- Core Logic Functions ---

    function parseAndRender() {
        const jsonString = jsonInput.value.trim();
        if (!jsonString) {
            clearViews();
            hideError();
            return;
        }

        try {
            const data = JSON.parse(jsonString);
            hideError();
            renderTreeView(data, treeView);
            renderTableView(data, tableView);
            renderRawView(jsonString, rawOutput.parentElement);
        } catch (e) {
            showError(e.message);
            clearViews();
        }
    }

    function switchView(viewName) {
        tabBtns.forEach(btn => btn.classList.remove('active'));
        viewContents.forEach(content => content.classList.remove('active'));

        document.querySelector(`.tab-btn[data-view="${viewName}"]`).classList.add('active');
        document.getElementById(`${viewName}-view`).classList.add('active');
    }

    function showError(message) {
        errorMessage.textContent = `Erreur JSON : ${message}`;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function clearViews() {
        treeView.innerHTML = '<p class="placeholder">Votre arborescence JSON apparaîtra ici.</p>';
        tableView.innerHTML = '<p class="placeholder">Si votre JSON est un tableau d\'objets, un tableau HTML sera généré ici.</p>';
        rawOutput.textContent = '';
        rawView.querySelector('.placeholder').style.display = 'block';
    }

    // --- Rendering Functions ---

    function renderTreeView(data, container) {
        container.innerHTML = '';
        const tree = createTreeNode(data);
        container.appendChild(tree);
    }

    function createTreeNode(data) {
        const ul = document.createElement('ul');
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const li = document.createElement('li');
                const keySpan = document.createElement('span');
                keySpan.className = 'key';
                keySpan.textContent = `${key}: `;
                li.appendChild(keySpan);

                const value = data[key];
                if (typeof value === 'object' && value !== null) {
                    li.appendChild(createTreeNode(value));
                } else {
                    const valueSpan = document.createElement('span');
                    valueSpan.textContent = JSON.stringify(value);
                    valueSpan.className = `value ${typeof value}`;
                    li.appendChild(valueSpan);
                }
                ul.appendChild(li);
            }
        }
        return ul;
    }

    function renderTableView(data, container) {
        if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object' || data[0] === null) {
            container.innerHTML = '<p class="placeholder">La vue tableau est disponible uniquement pour les tableaux d\'objets non vides.</p>';
            return;
        }

        const headers = Object.keys(data[0]);
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const headerRow = document.createElement('tr');

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        data.forEach(obj => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = obj[header] !== null && obj[header] !== undefined ? JSON.stringify(obj[header]) : 'null';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.innerHTML = '';
        container.appendChild(table);
    }

    function renderRawView(text, container) {
        try {
            const data = JSON.parse(text);
            const formattedJson = JSON.stringify(data, null, 2);
            rawOutput.innerHTML = syntaxHighlight(formattedJson);
            container.querySelector('.placeholder').style.display = 'none';
        } catch (e) {}
    }

    function syntaxHighlight(jsonString) {
        jsonString = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return jsonString.replace(/("(\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? 'key' : 'string';
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    // --- Action Button Functions ---

    function loadExample() {
        jsonInput.value = JSON.stringify(exampleJSON, null, 2);
        parseAndRender();
    }

    function clearInput() {
        jsonInput.value = '';
        clearViews();
        hideError();
    }

    function importFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            jsonInput.value = e.target.result;
            parseAndRender();
        };
        reader.onerror = () => {
            showError(`Erreur lors de la lecture du fichier : ${reader.error}`);
        };
        reader.readAsText(file);
    }

    // --- Theme Switching ---

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcons(isDarkMode);
    }

    function updateThemeIcons(isDarkMode) {
        sunIcon.style.display = isDarkMode ? 'none' : 'inline-block';
        moonIcon.style.display = isDarkMode ? 'inline-block' : 'none';
    }

    function applyInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode');
            updateThemeIcons(true);
        } else {
            document.body.classList.remove('dark-mode');
            updateThemeIcons(false);
        }
    }

    applyInitialTheme();

});