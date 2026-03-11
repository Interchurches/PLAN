// ═══════════════════════════════════════════════════════════
//  ICMF - Platform Lineup Allocation System
//  Programming Structure:
//   Super 5   → SA, SB, SC (max 7 choirs)
//   Augmented → AA, AB, AC (unlimited)
//   Major     → MA, MB, MC (unlimited)
//   Common    → CF, CM (all choirs eligible)
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {

    let choirs = [];
    let choirCounter = 1;

    // ── ADD CHOIR ──────────────────────────────────────────
    document.getElementById('addChoir').addEventListener('click', function () {
        const errorEl = document.getElementById('addError');
        errorEl.textContent = '';

        // Get choir name
        let choirName = '';
        if (document.getElementById('tab-preset').classList.contains('active')) {
            choirName = document.getElementById('presetChoir').value.trim();
            if (choirName.match(/^\d+\.\s/)) choirName = choirName.replace(/^\d+\.\s/, '');
        } else {
            choirName = document.getElementById('manualChoirName').value.trim();
        }

        if (!choirName) { errorEl.textContent = 'Please enter or select a choir name.'; return; }

        // Cross-class restriction check
        const existingEntry = choirs.find(c => c.name.toLowerCase() === choirName.toLowerCase());
        if (existingEntry) {
            errorEl.textContent = 'This choir is already registered. Each choir can only be registered once.'; return;
        }

        // Get class
        const classRadio = document.querySelector('input[name="choirClass"]:checked');
        if (!classRadio) { errorEl.textContent = 'Please select a competition class.'; return; }
        const choirClass = classRadio.value;

        // Enforce cross-class item restrictions (belt-and-suspenders check)
        const restrictionMap = {
            super5:    ['augmented', 'major'],
            augmented: ['super5', 'major'],
            major:     ['super5', 'augmented']
        };
        const classLabel = { super5: 'Super 5', augmented: 'Augmented', major: 'Major' };
        // (Items are shown dynamically per class so this is mainly a safety guard)

        // Class-specific limit check for Super 5
        if (choirClass === 'super5') {
            const super5Count = choirs.filter(c => c.choirClass === 'super5').length;
            if (super5Count >= 7) {
                errorEl.textContent = 'Super 5 class is full (maximum 7 choirs).'; return;
            }
        }

        // Get class items
        const classItems = [];
        const prefixMap = { super5: 'S', augmented: 'A', major: 'M' };
        const suffixes = ['A','B','C'];
        const prefix = prefixMap[choirClass];
        suffixes.forEach(s => {
            const el = document.getElementById(`item_${prefix}${s}`);
            if (el && el.checked) classItems.push(`${prefix}${s}`);
        });

        if (classItems.length === 0) {
            errorEl.textContent = `Please select at least one ${choirClass === 'super5' ? 'Super 5' : choirClass === 'augmented' ? 'Augmented' : 'Major'}-class item.`; return;
        }

        // Get common class items
        const commonItems = [];
        ['CF','CM'].forEach(item => {
            const el = document.getElementById(`item${item}`);
            if (el && el.checked) commonItems.push(item);
        });

        const allItems = [...classItems, ...commonItems];

        const choir = {
            id: choirCounter++,
            name: choirName,
            choirClass,
            items: allItems,
            classItems,
            commonItems
        };

        choirs.push(choir);
        updateChoirTable();
        clearForm();
    });

    function clearForm() {
        document.getElementById('presetChoir').selectedIndex = 0;
        document.getElementById('manualChoirName').value = '';
        document.querySelectorAll('input[name="choirClass"]').forEach(r => {
            r.checked = false;
            r.disabled = false;
        });
        // Remove any restriction warning
        const warn = document.getElementById('classRestrictionWarn');
        if (warn) warn.remove();
        document.getElementById('itemsGroup').style.display = 'none';
        document.getElementById('dynamicItems').innerHTML = '';
        ['CF','CM'].forEach(item => {
            const el = document.getElementById(`item${item}`);
            if (el) el.checked = false;
        });
    }

    // ── CLASS RESTRICTION ENFORCEMENT ─────────────────────
    // When a choir name is selected/typed, if that choir is already registered,
    // show a warning. Since each choir can only register once, we block re-entry.
    // The radio buttons also enforce: Super5 choirs cannot pick Augmented/Major items,
    // which is guaranteed by the dynamic item rendering per class.
    // This function provides a real-time UI hint when switching class radios.
    function handleClassRestrictionUI(selectedClass) {
        // Remove old warning if any
        const oldWarn = document.getElementById('classRestrictionWarn');
        if (oldWarn) oldWarn.remove();

        const restrictionMsg = {
            super5:    '⚠ Super 5 choirs may only perform Super 5 (SA, SB, SC) and Common (CF, CM) items.',
            augmented: '⚠ Augmented choirs may only perform Augmented (AA, AB, AC) and Common (CF, CM) items.',
            major:     '⚠ Major choirs may only perform Major (MA, MB, MC) and Common (CF, CM) items.'
        };

        if (restrictionMsg[selectedClass]) {
            const warn = document.createElement('div');
            warn.id = 'classRestrictionWarn';
            warn.style.cssText = 'margin-top:8px;padding:8px 12px;background:#fff8e1;border-left:4px solid #f9a825;border-radius:4px;font-size:0.85em;color:#5d4037;';
            warn.textContent = restrictionMsg[selectedClass];
            const itemsHint = document.getElementById('itemsHint');
            if (itemsHint && itemsHint.parentNode) {
                itemsHint.parentNode.insertBefore(warn, itemsHint.nextSibling);
            }
        }
    }

    // ── UPDATE TABLE ───────────────────────────────────────
    function updateChoirTable() {
        const tbody = document.getElementById('choirTableBody');
        tbody.innerHTML = '';

        choirs.forEach((choir, idx) => {
            const row = document.createElement('tr');
            const classLabel = { super5: 'Super 5', augmented: 'Augmented', major: 'Major' };
            const badgeCls = `badge-class badge-${choir.choirClass}`;
            row.innerHTML = `
                <td>${idx + 1}</td>
                <td><strong>${choir.name}</strong></td>
                <td><span class="${badgeCls}">${classLabel[choir.choirClass]}</span></td>
                <td>${choir.items.map(i => `<span class="item-tag ${i}">${i}</span>`).join(' ')}</td>
                <td><button class="edit-btn" data-id="${choir.id}" title="Edit this choir's class and items">✏️ Edit</button></td>
                <td><button class="delete-btn" data-id="${choir.id}" title="Remove this choir entirely">🗑 Delete</button></td>
            `;
            tbody.appendChild(row);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                choirs = choirs.filter(c => c.id !== id);
                updateChoirTable();
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                openEditModal(id);
            });
        });
    }

    // ── EDIT MODAL ────────────────────────────────────────
    let editingChoirId = null;

    function openEditModal(id) {
        const choir = choirs.find(c => c.id === id);
        if (!choir) return;
        editingChoirId = id;

        document.getElementById('editChoirNameDisplay').textContent = choir.name;
        document.getElementById('editError').textContent = '';

        // Set class radio
        document.querySelectorAll('input[name="editChoirClass"]').forEach(r => {
            r.checked = r.value === choir.choirClass;
        });

        // Populate items for current class
        populateEditItems(choir.choirClass, choir.classItems);

        // Set common items
        document.getElementById('editItemCF').checked = choir.commonItems.includes('CF');
        document.getElementById('editItemCM').checked = choir.commonItems.includes('CM');

        // Wire up class radio change inside modal
        document.querySelectorAll('input[name="editChoirClass"]').forEach(r => {
            r.onchange = function () {
                populateEditItems(this.value, []);
            };
        });

        document.getElementById('editModal').style.display = 'flex';
    }

    function populateEditItems(cls, selectedItems) {
        const dynamicItems = document.getElementById('editDynamicItems');
        const hint = document.getElementById('editItemsHint');
        dynamicItems.innerHTML = '';

        const config = {
            super5:    { items: ['SA','SB','SC'], hint: 'Super 5 items — SA+SB in Session 1; SC in Session 1b.' },
            augmented: { items: ['AA','AB','AC'], hint: 'Augmented items — AA+AB in Session 2; AC in Session 3b.' },
            major:     { items: ['MA','MB','MC'], hint: 'Major items — MA+MB in Session 3; MC in Session 3c.' }
        };

        if (!config[cls]) return;
        hint.textContent = config[cls].hint;
        config[cls].items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.innerHTML = `<input type="checkbox" id="editItem_${item}" value="${item}" ${selectedItems.includes(item) ? 'checked' : ''}><label for="editItem_${item}">${item}</label>`;
            dynamicItems.appendChild(div);
        });
    }

    function closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        editingChoirId = null;
    }

    document.getElementById('closeEditModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });

    document.getElementById('saveEditBtn').addEventListener('click', function () {
        const errorEl = document.getElementById('editError');
        errorEl.textContent = '';

        const classRadio = document.querySelector('input[name="editChoirClass"]:checked');
        if (!classRadio) { errorEl.textContent = 'Please select a competition class.'; return; }
        const newClass = classRadio.value;

        // Super 5 cap check (excluding current choir)
        if (newClass === 'super5') {
            const super5Count = choirs.filter(c => c.choirClass === 'super5' && c.id !== editingChoirId).length;
            if (super5Count >= 7) { errorEl.textContent = 'Super 5 class is full (maximum 7 choirs).'; return; }
        }

        // Gather class items
        const prefixMap = { super5: 'S', augmented: 'A', major: 'M' };
        const prefix = prefixMap[newClass];
        const newClassItems = [];
        ['A','B','C'].forEach(s => {
            const el = document.getElementById(`editItem_${prefix}${s}`);
            if (el && el.checked) newClassItems.push(`${prefix}${s}`);
        });
        if (newClassItems.length === 0) { errorEl.textContent = 'Please select at least one class item.'; return; }

        // Gather common items
        const newCommonItems = [];
        if (document.getElementById('editItemCF').checked) newCommonItems.push('CF');
        if (document.getElementById('editItemCM').checked) newCommonItems.push('CM');

        // Apply changes
        const choir = choirs.find(c => c.id === editingChoirId);
        if (choir) {
            choir.choirClass = newClass;
            choir.classItems = newClassItems;
            choir.commonItems = newCommonItems;
            choir.items = [...newClassItems, ...newCommonItems];
        }

        updateChoirTable();
        closeEditModal();
    });

    // ── GENERATE SCHEDULE ─────────────────────────────────
    document.getElementById('generateSchedule').addEventListener('click', function () {
        if (choirs.length < 1) {
            alert('Please add at least one choir to generate a programme.'); return;
        }

        const overlay = document.getElementById('countdownOverlay');
        const display = document.getElementById('countdownDisplay');
        overlay.style.display = 'flex';
        let t = 5;
        display.textContent = t;

        const interval = setInterval(() => {
            t--;
            display.textContent = t;
            if (t <= 0) {
                clearInterval(interval);
                overlay.style.display = 'none';
                generateScheduleLogic();
            }
        }, 1000);
    });

    // ── SCHEDULE LOGIC ────────────────────────────────────
    function generateScheduleLogic() {
        const originalHTML = document.body.innerHTML;

        document.body.innerHTML = '';

        const page = document.createElement('div');
        page.className = 'results-page';

        // Header
        const header = document.createElement('div');
        header.className = 'results-header';

        const eventDateInput = document.getElementById('eventDate');
        let eventDateStr = '';
        if (eventDateInput && eventDateInput.value) {
            const d = new Date(eventDateInput.value + 'T00:00:00');
            eventDateStr = d.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } else {
            eventDateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }

        header.innerHTML = `
            <h1>ICMF — Order of Presentation</h1>
            <p>Festival Date: <strong>${eventDateStr}</strong></p>
            <div class="results-actions">
                <button class="btn-back" id="btnBack">← Back to Form</button>
                <button class="btn-print" id="btnPrint">🖨 Print Programme</button>
            </div>
        `;
        page.appendChild(header);

        document.body.appendChild(page);

        document.getElementById('btnBack').addEventListener('click', () => {
            document.body.innerHTML = originalHTML;
            attachEventListeners();
        });
        document.getElementById('btnPrint').addEventListener('click', () => {
            header.querySelector('.results-actions').style.display = 'none';
            window.print();
            header.querySelector('.results-actions').style.display = 'flex';
        });

        // ── Classify choirs by items ──
        const itemMap = {};
        ['SA','SB','SC','AA','AB','AC','MA','MB','MC','CF','CM'].forEach(item => { itemMap[item] = []; });

        choirs.forEach(choir => {
            choir.items.forEach(item => {
                if (itemMap[item]) itemMap[item].push(choir);
            });
        });

        // ── Build sessions ──

        // Session 1: Super 5 → SA + SB together
        buildJointSession(page, '1', 'session-super5', 'Session 1 — Super 5', 'Items SA and SB (performed together)', ['SA','SB'], itemMap);

        // Session 1b: Super 5 SC (if any)
        buildSingleItemSession(page, '1b', 'session-super5', 'Session 1b — Super 5 (Continued)', 'Item SC', 'SC', itemMap);

        // Session 2: Augmented → AA + AB together
        buildJointSession(page, '2', 'session-augmented', 'Session 2 — Augmented', 'Items AA and AB (performed together)', ['AA','AB'], itemMap);

        // Session 3: Major → MA + MB together
        buildJointSession(page, '3', 'session-major', 'Session 3 — Major', 'Items MA and MB (performed together)', ['MA','MB'], itemMap);

        // Session 3b: Augmented → AC
        buildSingleItemSession(page, '3b', 'session-augmented', 'Session 3b — Augmented (Continued)', 'Item AC', 'AC', itemMap);

        // Session 3c: Major → MC (if any)
        buildSingleItemSession(page, '3c', 'session-major', 'Session 3c — Major (Continued)', 'Item MC', 'MC', itemMap);

        // Session 4: Common → C1 and C2 alternating
        buildCommonSession(page, itemMap);

        // Print styles
        addPrintStyles();
        window.scrollTo(0, 0);
    }

    // ── SESSION BUILDERS ──────────────────────────────────

    /**
     * Joint session: choirs that perform both items appear once; 
     * choirs with only one of the two items also listed.
     * Order is randomised (shuffled).
     */
    function buildJointSession(page, num, cls, title, subtitle, items, itemMap) {
        const [item1, item2] = items;
        const set1 = itemMap[item1] || [];
        const set2 = itemMap[item2] || [];

        // Merge unique choirs
        const merged = new Map();
        set1.forEach(c => merged.set(c.id, { ...c, performingItems: [item1] }));
        set2.forEach(c => {
            if (merged.has(c.id)) merged.get(c.id).performingItems.push(item2);
            else merged.set(c.id, { ...c, performingItems: [item2] });
        });

        const combined = shuffleArray(Array.from(merged.values()));

        const card = createSessionCard(num, cls, title, subtitle);
        const body = card.querySelector('.session-body');

        if (combined.length === 0) {
            body.innerHTML = '<div class="no-performers">No choirs registered for this session.</div>';
        } else {
            const table = document.createElement('table');
            table.className = 'schedule-table';
            table.innerHTML = `<thead><tr>
                <th>#</th>
                <th>Choir Name</th>
                <th>Items Performing</th>
            </tr></thead>`;
            const tbody = document.createElement('tbody');
            combined.forEach((choir, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${i+1}</td>
                    <td><strong>${choir.name}</strong></td>
                    <td>${choir.performingItems.map(it => `<span class="item-tag ${it}">${it}</span>`).join(' ')}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            body.appendChild(table);
        }
        page.appendChild(card);
    }

    /**
     * Single item session (S3, A3, M3)
     */
    function buildSingleItemSession(page, num, cls, title, subtitle, item, itemMap) {
        const performers = shuffleArray([...(itemMap[item] || [])]);
        if (performers.length === 0) return;

        const card = createSessionCard(num, cls, title, subtitle);
        const body = card.querySelector('.session-body');

        const table = document.createElement('table');
        table.className = 'schedule-table';
        table.innerHTML = `<thead><tr>
            <th>#</th>
            <th>Choir Name</th>
            <th>Item</th>
        </tr></thead>`;
        const tbody = document.createElement('tbody');
        performers.forEach((choir, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${i+1}</td>
                <td><strong>${choir.name}</strong></td>
                <td><span class="item-tag ${item}">${item}</span></td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        body.appendChild(table);
        page.appendChild(card);
    }

    /**
     * Common class session — C1 and C2 in alternating order.
     * If a choir does both C1 and C2, they appear twice (once per item).
     */
    function buildCommonSession(page, itemMap) {
        const cfChoirs = shuffleArray([...(itemMap['CF'] || [])]);
        const cmChoirs = shuffleArray([...(itemMap['CM'] || [])]);

        if (cfChoirs.length === 0 && cmChoirs.length === 0) return;

        const card = createSessionCard('4', 'session-common', 'Session 4 — Common Class', 'Items CF and CM in alternating order');
        const body = card.querySelector('.session-body');

        // Alternating CF / CM
        if (cfChoirs.length > 0 || cmChoirs.length > 0) {
            const altRows = buildAlternatingOrder(cfChoirs, 'CF', cmChoirs, 'CM');

            const table = document.createElement('table');
            table.className = 'schedule-table';
            table.innerHTML = `<thead><tr>
                <th>#</th>
                <th>Choir Name</th>
                <th>Item</th>
            </tr></thead>`;
            const tbody = document.createElement('tbody');
            altRows.forEach((entry, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${i+1}</td>
                    <td><strong>${entry.choir.name}</strong></td>
                    <td><span class="item-tag ${entry.item}">${entry.item}</span></td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            body.appendChild(table);
        }

        page.appendChild(card);
    }

    /**
     * Build strictly alternating list between two item groups
     */
    function buildAlternatingOrder(list1, label1, list2, label2) {
        const r1 = list1.map(c => ({ choir: c, item: label1 }));
        const r2 = list2.map(c => ({ choir: c, item: label2 }));
        const result = [];
        let turn = 0; // 0 = list1, 1 = list2

        while (r1.length > 0 || r2.length > 0) {
            if (turn === 0) {
                if (r1.length > 0) result.push(r1.shift());
                else result.push(r2.shift());
            } else {
                if (r2.length > 0) result.push(r2.shift());
                else result.push(r1.shift());
            }
            turn = 1 - turn;
        }
        return result;
    }

    /**
     * Create a styled session card element
     */
    function createSessionCard(num, cls, title, subtitle) {
        const card = document.createElement('div');
        card.className = `session-card ${cls}`;

        const header = document.createElement('div');
        header.className = 'session-header';
        header.innerHTML = `
            <div class="session-number">${num}</div>
            <div>
                <div class="session-title">${title}</div>
                <div class="session-subtitle">${subtitle}</div>
            </div>
        `;
        card.appendChild(header);

        const body = document.createElement('div');
        body.className = 'session-body';
        card.appendChild(body);
        return card;
    }

    // ── UTILITIES ─────────────────────────────────────────

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function addPrintStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @media print {
                .btn-back, .btn-print, .results-actions { display: none !important; }
                body { font-size: 11pt; background: white; }
                .results-page { padding: 0; }
                .session-card { box-shadow: none; border: 1px solid #ccc; page-break-inside: avoid; margin-bottom: 16px; }
                .results-header { background: #3d1a6e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .session-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { size: portrait; margin: 0.5in; }
            }
        `;
        document.head.appendChild(style);
    }

    // ── RE-ATTACH LISTENERS (after back navigation) ───────
    function attachEventListeners() {
        // Tabs
        document.getElementById('tab-preset').addEventListener('click', function () {
            this.classList.add('active');
            document.getElementById('tab-manual').classList.remove('active');
            document.getElementById('content-preset').classList.add('active');
            document.getElementById('content-manual').classList.remove('active');
        });
        document.getElementById('tab-manual').addEventListener('click', function () {
            this.classList.add('active');
            document.getElementById('tab-preset').classList.remove('active');
            document.getElementById('content-manual').classList.add('active');
            document.getElementById('content-preset').classList.remove('active');
        });

        // Class radio re-attach
        document.querySelectorAll('input[name="choirClass"]').forEach(radio => {
            radio.addEventListener('change', function () {
                updateItemsForClass(this.value);
                handleClassRestrictionUI(this.value);
            });
        });

        // Add choir button
        document.getElementById('addChoir').addEventListener('click', function () {
            document.getElementById('addChoir').click();
        });

        // Generate
        document.getElementById('generateSchedule').addEventListener('click', function () {
            document.getElementById('generateSchedule').click();
        });

        // Reattach delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.dataset.id);
                choirs = choirs.filter(c => c.id !== id);
                updateChoirTable();
            });
        });

        updateChoirTable();
    }

    function updateItemsForClass(cls) {
        const itemsGroup = document.getElementById('itemsGroup');
        const dynamicItems = document.getElementById('dynamicItems');
        const hint = document.getElementById('itemsHint');
        if (!itemsGroup) return;
        itemsGroup.style.display = 'block';
        dynamicItems.innerHTML = '';

        const config = {
            super5:    { items: ['SA','SB','SC'], hint: 'Super 5 items — SA+SB performed together in Session 1; SC in a separate session if applicable.' },
            augmented: { items: ['AA','AB','AC'], hint: 'Augmented items — AA+AB performed together in Session 2; AC in Session 3b.' },
            major:     { items: ['MA','MB','MC'], hint: 'Major items — MA+MB performed together in Session 3; MC in Session 3c if applicable.' }
        };

        if (!config[cls]) return;
        hint.textContent = config[cls].hint;
        config[cls].items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.innerHTML = `<input type="checkbox" id="item_${item}" value="${item}"><label for="item_${item}">${item}</label>`;
            dynamicItems.appendChild(div);
        });
    }

    // Expose to inline scripts in HTML
    window.updateItemsForClass = updateItemsForClass;
    window.handleClassRestrictionUI = handleClassRestrictionUI;
    window.attachEventListeners = attachEventListeners;
});
`           `