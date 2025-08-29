document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const jsonInput = document.getElementById('json-input');
    const loadExampleBtn = document.getElementById('load-example-btn');
    const fileInput = document.getElementById('file-input');
    const clearBtn = document.getElementById('clear-btn');
    const errorMessage = document.getElementById('error-message');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const viewContents = document.querySelectorAll('.view-content');

    const treeView = document.getElementById('tree-view');
    const tableView = document.getElementById('table-view');
    const rawOutput = document.getElementById('raw-output');

    // --- Example JSON Data ---
    const exampleJSON = {
        "id": "user-001",
        "nom": "Dupont",
        "prenom": "Jean",
        "estActif": true,
        "age": 32,
        "solde": null,
        "competences": ["HTML", "CSS", "JavaScript", "JSON"],
        "adresse": {
            "rue": "123 rue de la République",
            "ville": "Paris",
            "codePostal": "75001"
        },
        "projets": [
            { "id": "p-01", "nom": "Site Vitrine", "status": "Terminé" },
            { "id": "p-02", "nom": "Application Mobile", "status": "En cours" }
        ]
    };

    // --- Event Listeners ---
    jsonInput.addEventListener('input', handleInputChange);
    loadExampleBtn.addEventListener('click', loadExample);
    fileInput.addEventListener('change', handleFileUpload);
    clearBtn.addEventListener('click', clearAll);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Gérer l'état actif des onglets
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Afficher le contenu de l'onglet correspondant
            viewContents.forEach(content => content.classList.remove('active'));
            const viewId = btn.getAttribute('data-view') + '-view';
            document.getElementById(viewId).classList.add('active');
        });
    });

    // --- Core Functions ---

    function handleInputChange() {
        const jsonString = jsonInput.value;
        if (jsonString.trim() === '') {
            resetViews();
            return;
        }
        parseAndRender(jsonString);
    }

    function parseAndRender(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            errorMessage.style.display = 'none';
            renderAllViews(data, jsonString);
        } catch (error) {
            showError(`Erreur de syntaxe JSON : ${error.message}`);
            resetViews();
        }
    }

    function renderAllViews(data, originalString) {
        renderTreeView(data, treeView);
        renderTableView(data, tableView);
        renderRawView(data, rawOutput, originalString);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function resetViews() {
        treeView.innerHTML = '<p class="placeholder">Votre arborescence JSON apparaîtra ici.</p>';
        tableView.innerHTML = '<p class="placeholder">Si votre JSON est un tableau d\'objets, un tableau HTML sera généré ici.</p>';
        rawOutput.innerHTML = '';
        rawOutput.parentElement.querySelector('.placeholder').style.display = 'block';
    }

    function clearAll() {
        jsonInput.value = '';
        fileInput.value = '';
        errorMessage.style.display = 'none';
        resetViews();
    }

    function loadExample() {
        const formattedJson = JSON.stringify(exampleJSON, null, 2);
        jsonInput.value = formattedJson;
        parseAndRender(formattedJson);
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            jsonInput.value = content;
            parseAndRender(content);
        };
        reader.onerror = () => {
            showError("Erreur lors de la lecture du fichier.");
            resetViews();
        };
        reader.readAsText(file);
    }

    // --- Rendering Functions ---

    function renderTreeView(data, container) {
        container.innerHTML = '';
        const tree = createTreeElement(data);
        container.appendChild(tree);

        container.querySelectorAll('.tree-toggler').forEach(toggler => {
            toggler.addEventListener('click', () => {
                toggler.classList.toggle('collapsed');
                toggler.nextElementSibling.classList.toggle('collapsed');
            });
        });
    }

    function createTreeElement(data) {
        if (Array.isArray(data)) {
            const ul = document.createElement('ul');
            ul.className = 'tree-nested';
            data.forEach(item => {
                const li = document.createElement('li');
                li.appendChild(createTreeElement(item));
                ul.appendChild(li);
            });
            return ul;
        } else if (typeof data === 'object' && data !== null) {
            const ul = document.createElement('ul');
            ul.className = 'tree-nested';
            for (const key in data) {
                const li = document.createElement('li');
                const keySpan = document.createElement('span');
                keySpan.className = 'tree-key';
                
                const value = data[key];
                const isObjectOrArray = (typeof value === 'object' && value !== null);
                
                if (isObjectOrArray) {
                    keySpan.classList.add('tree-toggler');
                    keySpan.innerHTML = `"${key}": `;
                } else {
                    keySpan.innerHTML = `"${key}": `;
                }
                
                li.appendChild(keySpan);
                li.appendChild(createTreeElement(value));
                ul.appendChild(li);
            }
            return ul;
        } else {
            const span = document.createElement('span');
            const type = data === null ? 'null' : typeof data;
            span.className = `tree-${type}`;
            span.textContent = JSON.stringify(data);
            return span;
        }
    }

    function renderTableView(data, container) {
        container.innerHTML = ''; // Clear previous content
        if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object' || data[0] === null) {
            container.innerHTML = '<p class="placeholder">La vue Tableau est disponible uniquement pour les JSON qui sont des tableaux d\'objets non vides.</p>';
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const headerRow = document.createElement('tr');

        // Create headers from the keys of the first object
        const headers = Object.keys(data[0]);
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create body rows
        data.forEach(obj => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                const value = obj[header];
                // Stringify objects/arrays inside cells for readability
                td.textContent = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        container.appendChild(table);
    }

    function renderRawView(data, container) {
        container.parentElement.querySelector('.placeholder').style.display = 'none';
        container.textContent = JSON.stringify(data, null, 2);
    }
});