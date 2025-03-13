document.addEventListener('DOMContentLoaded', function () {
    let choirs = [];
    let choirCounter = 1;

    // Create popup elements initially
    createCountdownPopup();

    // Tab switching
    document.getElementById('tab-preset').addEventListener('click', function () {
        document.getElementById('tab-preset').classList.add('active');
        document.getElementById('tab-manual').classList.remove('active');
        document.getElementById('content-preset').classList.add('active');
        document.getElementById('content-manual').classList.remove('active');
    });

    document.getElementById('tab-manual').addEventListener('click', function () {
        document.getElementById('tab-manual').classList.add('active');
        document.getElementById('tab-preset').classList.remove('active');
        document.getElementById('content-manual').classList.add('active');
        document.getElementById('content-preset').classList.remove('active');
    });

    // Add choir to the list
    document.getElementById('addChoir').addEventListener('click', function () {
        let choirName = "";

        // Get choir name based on active tab
        if (document.getElementById('tab-preset').classList.contains('active')) {
            choirName = document.getElementById('presetChoir').value.trim();
            // Remove the number prefix if present
            if (choirName.match(/^\d+\.\s/)) {
                choirName = choirName.replace(/^\d+\.\s/, '');
            }
        } else {
            choirName = document.getElementById('manualChoirName').value.trim();
        }

        const ballotNumber = parseInt(document.getElementById('ballotNumber').value);

        const errorElement = document.getElementById('addError');
        errorElement.textContent = '';

        // Validate input
        if (!choirName) {
            errorElement.textContent = 'Please enter or select a choir name.';
            return;
        }

        // Check if choir name is already used
        if (choirs.some(choir => choir.name.toLowerCase() === choirName.toLowerCase())) {
            errorElement.textContent = 'This choir name is already in the list.';
            return;
        }

        if (isNaN(ballotNumber) || ballotNumber < 1 || ballotNumber > 50) {
            errorElement.textContent = 'Please enter a valid ballot number between 1 and 50.';
            return;
        }

        // Check if ballot number is already used
        if (choirs.some(choir => choir.ballotNumber === ballotNumber)) {
            errorElement.textContent = 'This ballot number is already assigned to another choir.';
            return;
        }

        // Get selected items
        const selectedItems = [];
        ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(item => {
            if (document.getElementById(`item${item}`).checked) {
                selectedItems.push(item);
            }
        });

        if (selectedItems.length === 0) {
            errorElement.textContent = 'Please select at least one item to perform.';
            return;
        }

        // Add choir to the list
        const choir = {
            id: choirCounter++,
            name: choirName,
            ballotNumber: ballotNumber,
            items: selectedItems
        };

        choirs.push(choir);
        updateChoirTable();

        // Clear form
        document.getElementById('presetChoir').selectedIndex = 0;
        document.getElementById('manualChoirName').value = '';
        document.getElementById('ballotNumber').value = '';
        ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(item => {
            document.getElementById(`item${item}`).checked = false;
        });
    });

    // Update choir table
    function updateChoirTable() {
        const tableBody = document.getElementById('choirTableBody');
        tableBody.innerHTML = '';

        choirs.forEach((choir, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${choir.name}</td>
                <td>${choir.ballotNumber}</td>
                <td>${choir.items.join(', ')}</td>
                <td><button class="delete-btn" data-id="${choir.id}">Remove</button></td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const choirId = parseInt(this.getAttribute('data-id'));
                choirs = choirs.filter(choir => choir.id !== choirId);
                updateChoirTable();
            });
        });
    }

    // Generate performance schedule
    document.getElementById('generateSchedule').addEventListener('click', function () {
        if (choirs.length < 2) {
            alert('Please add at least two choirs to generate a schedule.');
            return;
        }

        // Clear any previous results
        const scheduleResult = document.getElementById('scheduleResult');
        if (scheduleResult) {
            scheduleResult.innerHTML = '';
        }

        // Make sure popup exists
        let popupOverlay = document.getElementById('countdownOverlay');
        let countdownDisplay = document.getElementById('countdownDisplay');

        // If popup doesn't exist, create it again
        if (!popupOverlay || !countdownDisplay) {
            createCountdownPopup();
            popupOverlay = document.getElementById('countdownOverlay');
            countdownDisplay = document.getElementById('countdownDisplay');
        }

        // Show countdown popup
        popupOverlay.style.display = 'flex';
        let secondsLeft = 5;
        countdownDisplay.textContent = secondsLeft;

        // Start countdown
        const countdownInterval = setInterval(function () {
            secondsLeft--;
            countdownDisplay.textContent = secondsLeft;

            if (secondsLeft <= 0) {
                // Stop countdown and hide popup
                clearInterval(countdownInterval);
                popupOverlay.style.display = 'none';

                // Only generate and display the schedule after countdown finishes
                generateScheduleLogic();
            }
        }, 1000);
    });

    // Schedule generation function - only called after countdown finishes
    function generateScheduleLogic() {
        // Store the original content for later restoration
        const originalContent = document.body.innerHTML;

        // Clear the entire body content
        document.body.innerHTML = '';

        // Create the results page container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'results-container';
        resultsContainer.style.cssText = `
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        `;

        // Create header for results page
        const header = document.createElement('div');
        header.innerHTML = '<h1>ICMF 2025 Performance Schedule</h1>';

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            margin: 20px 0;
            display: flex;
            gap: 10px;
        `;

        // Back button
        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Form';
        backButton.className = 'back-btn';
        backButton.style.cssText = `
            padding: 10px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        `;
        backButton.addEventListener('click', function () {
            // Restore the original content
            document.body.innerHTML = originalContent;

            // Reattach all event listeners and recreate popup
            attachEventListeners();
            createCountdownPopup();
        });

        // Print button
        const printButton = document.createElement('button');
        printButton.textContent = 'Print Performance Program';
        printButton.className = 'print-btn';
        printButton.style.cssText = `
            padding: 10px 15px;
            background-color: #008CBA;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        `;
        printButton.addEventListener('click', function () {
            // Hide the buttons before printing
            buttonContainer.style.display = 'none';
            window.print();
            // Show the buttons after printing
            buttonContainer.style.display = 'flex';
        });

        // Add buttons to container
        buttonContainer.appendChild(backButton);
        buttonContainer.appendChild(printButton);

        // Add button container to header
        header.appendChild(buttonContainer);

        // Add header to results container
        resultsContainer.appendChild(header);

        // Create container for schedule results
        const scheduleResult = document.createElement('div');
        scheduleResult.id = 'scheduleResult';
        resultsContainer.appendChild(scheduleResult);

        // Add results container to body
        document.body.appendChild(resultsContainer);

        // Get choirs for each item
        const itemChoirs = {
            'A': choirs.filter(choir => choir.items.includes('A')),
            'B': choirs.filter(choir => choir.items.includes('B')),
            'C': choirs.filter(choir => choir.items.includes('C')),
            'D': choirs.filter(choir => choir.items.includes('D')),
            'E': choirs.filter(choir => choir.items.includes('E')),
            'F': choirs.filter(choir => choir.items.includes('F')),
            'G': choirs.filter(choir => choir.items.includes('G'))
        };

        // Generate randomized performance orders for each item
        const itemPerformanceOrders = generatePerformanceOrders(itemChoirs);

        // Display session schedules
        const sessionsDiv = document.createElement('div');
        sessionsDiv.innerHTML = '<h2>Order of Performance</h2>';
        sessionsDiv.style.marginBottom = '30px';

        // Table styles
        const tableStyle = `
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 2px 3px rgba(0,0,0,0.1);
        `;

        const thStyle = `
            background-color: #f2f2f2;
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
        `;

        const tdStyle = `
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        `;

        // Session 1: Items F and G (alternating)
        createAlternatingSessionTable('Session 1', ['F', 'G'], itemPerformanceOrders, sessionsDiv, thStyle, tdStyle, tableStyle);

        // Session 2: Items E and C (alternating)
        createAlternatingSessionTable('Session 2', ['E', 'C'], itemPerformanceOrders, sessionsDiv, thStyle, tdStyle, tableStyle);

        // Session 3: Items A and B (merged)
        createMergedSession3('Session 3', itemPerformanceOrders, sessionsDiv, thStyle, tdStyle, tableStyle);

        // Session 4: Item D
        createSessionTable('Session 4', ['D'], itemPerformanceOrders, sessionsDiv, thStyle, tdStyle, tableStyle);

        scheduleResult.appendChild(sessionsDiv);

        // Add CSS for print styles
        const printStyles = document.createElement('style');
        printStyles.textContent = `
     @media print {
         /* Hide UI elements during printing */
         .back-btn, .print-btn, #btn-container {
             display: none !important;
         }
         
         /* Ensure all content is visible */
         body {
             font-size: 12pt;
             margin: 0;
             padding: 0;
             background-color: white !important;
             color: black !important;
         }
         
         /* Fix header sizes */
         h1 {
             font-size: 18pt;
             margin-bottom: 10px;
         }
         
         h2 {
             font-size: 16pt;
             margin-bottom: 8px;
         }
         
         h3 {
             font-size: 14pt;
             margin-bottom: 6px;
         }
         
         /* Table styling for print */
         table {
             width: 100% !important;
             border-collapse: collapse !important;
             page-break-inside: avoid !important;
         }
         
         th, td {
             border: 1px solid #000 !important;
             padding: 5px !important;
             text-align: left !important;
         }
         
         th {
             background-color: #eee !important;
             -webkit-print-color-adjust: exact !important;
             print-color-adjust: exact !important;
         }
         
         /* Page break controls */
         .session-table {
             page-break-inside: avoid;
             margin-bottom: 15px;
         }
         
         /* Ensure each schedule section starts on a new page if needed */
         .session-table {
             page-break-before: auto;
         }
         
         /* Add footer with page numbers */
         @page {
             size: portrait;
             margin: 0.5in;
         }
         
         /* Make sure shadows don't appear in print */
         * {
             box-shadow: none !important;
         }
     }
 `;
        document.head.appendChild(printStyles);

        document.head.appendChild(printStyles);

        // Scroll to top of the page
        window.scrollTo(0, 0);
    }
    // Function to create the countdown popup
    function createCountdownPopup() {
        // Remove existing popup if it exists
        const existingPopup = document.getElementById('countdownOverlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup elements and add them to the DOM
        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'countdownOverlay';
        popupOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

        const popupContent = document.createElement('div');
        popupContent.id = 'countdownPopup';
        popupContent.style.cssText = `
        background-color: white;
        padding: 30px 50px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    `;

        // Logo container with loading animation
        const logoContainer = document.createElement('div');
        logoContainer.id = 'logoContainer';
        logoContainer.style.cssText = `
        width: 100px;
        height: 100px;
        margin: 0 auto 20px auto;
        position: relative;
    `;

        // Placeholder for the logo
        const logoPlaceholder = document.createElement('div');
        logoPlaceholder.id = 'logoPlaceholder';
        logoPlaceholder.style.cssText = `
        width: 100%;
        height: 100%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
    `;

        // Loading spinner animation that wraps around the logo
        const loadingSpinner = document.createElement('div');
        loadingSpinner.id = 'loadingSpinner';
        loadingSpinner.style.cssText = `
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border: 3px solid transparent;
        border-top-color: #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;

        // Add the loading animation keyframes to the document
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
        document.head.appendChild(styleSheet);

        const countdownTitle = document.createElement('h2');
        countdownTitle.textContent = 'Generating order of Presentation';
        countdownTitle.style.marginBottom = '20px';

        const countdownDisplay = document.createElement('div');
        countdownDisplay.id = 'countdownDisplay';
        countdownDisplay.style.cssText = `
        font-size: 48px;
        font-weight: bold;
        color: #333;
        margin: 20px 0;
    `;

        const loadingText = document.createElement('p');
        loadingText.textContent = 'Please wait while we generate your schedule...';

        // Assemble the logo container components
        logoContainer.appendChild(logoPlaceholder);
        logoContainer.appendChild(loadingSpinner);

        // Build the popup
        popupContent.appendChild(logoContainer);
        popupContent.appendChild(countdownTitle);
        popupContent.appendChild(countdownDisplay);
        popupContent.appendChild(loadingText);
        popupOverlay.appendChild(popupContent);
        document.body.appendChild(popupOverlay);
    }
    document.getElementById('logoPlaceholder').style.backgroundImage = "url('./assets/interchurches.png')";
    // Function to reattach all event listeners after going back to the form
    function attachEventListeners() {
        // Tab switching
        document.getElementById('tab-preset').addEventListener('click', function () {
            document.getElementById('tab-preset').classList.add('active');
            document.getElementById('tab-manual').classList.remove('active');
            document.getElementById('content-preset').classList.add('active');
            document.getElementById('content-manual').classList.remove('active');
        });

        document.getElementById('tab-manual').addEventListener('click', function () {
            document.getElementById('tab-manual').classList.add('active');
            document.getElementById('tab-preset').classList.remove('active');
            document.getElementById('content-manual').classList.add('active');
            document.getElementById('content-preset').classList.remove('active');
        });

        // Add choir button
        document.getElementById('addChoir').addEventListener('click', function () {
            // The addChoir event listener code
            let choirName = "";

            // Get choir name based on active tab
            if (document.getElementById('tab-preset').classList.contains('active')) {
                choirName = document.getElementById('presetChoir').value.trim();
                // Remove the number prefix if present
                if (choirName.match(/^\d+\.\s/)) {
                    choirName = choirName.replace(/^\d+\.\s/, '');
                }
            } else {
                choirName = document.getElementById('manualChoirName').value.trim();
            }

            const ballotNumber = parseInt(document.getElementById('ballotNumber').value);

            const errorElement = document.getElementById('addError');
            errorElement.textContent = '';

            // Validate input
            if (!choirName) {
                errorElement.textContent = 'Please enter or select a choir name.';
                return;
            }

            // Check if choir name is already used
            if (choirs.some(choir => choir.name.toLowerCase() === choirName.toLowerCase())) {
                errorElement.textContent = 'This choir name is already in the list.';
                return;
            }

            if (isNaN(ballotNumber) || ballotNumber < 1 || ballotNumber > 50) {
                errorElement.textContent = 'Please enter a valid ballot number between 1 and 50.';
                return;
            }

            // Check if ballot number is already used
            if (choirs.some(choir => choir.ballotNumber === ballotNumber)) {
                errorElement.textContent = 'This ballot number is already assigned to another choir.';
                return;
            }

            // Get selected items
            const selectedItems = [];
            ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(item => {
                if (document.getElementById(`item${item}`).checked) {
                    selectedItems.push(item);
                }
            });

            if (selectedItems.length === 0) {
                errorElement.textContent = 'Please select at least one item to perform.';
                return;
            }

            // Add choir to the list
            const choir = {
                id: choirCounter++,
                name: choirName,
                ballotNumber: ballotNumber,
                items: selectedItems
            };

            choirs.push(choir);
            updateChoirTable();

            // Clear form
            document.getElementById('presetChoir').selectedIndex = 0;
            document.getElementById('manualChoirName').value = '';
            document.getElementById('ballotNumber').value = '';
            ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(item => {
                document.getElementById(`item${item}`).checked = false;
            });
        });

        // Generate schedule button
        document.getElementById('generateSchedule').addEventListener('click', function () {
            if (choirs.length < 2) {
                alert('Please add at least two choirs to generate a schedule.');
                return;
            }

            // Clear any previous results
            const scheduleResult = document.getElementById('scheduleResult');
            if (scheduleResult) {
                scheduleResult.innerHTML = '';
            }

            // Make sure popup exists
            let popupOverlay = document.getElementById('countdownOverlay');
            let countdownDisplay = document.getElementById('countdownDisplay');

            // If popup doesn't exist, create it again
            if (!popupOverlay || !countdownDisplay) {
                createCountdownPopup();
                popupOverlay = document.getElementById('countdownOverlay');
                countdownDisplay = document.getElementById('countdownDisplay');
            }

            // Show countdown popup
            popupOverlay.style.display = 'flex';
            let secondsLeft = 5;
            countdownDisplay.textContent = secondsLeft;

            // Start countdown
            const countdownInterval = setInterval(function () {
                secondsLeft--;
                countdownDisplay.textContent = secondsLeft;

                if (secondsLeft <= 0) {
                    // Stop countdown and hide popup
                    clearInterval(countdownInterval);
                    popupOverlay.style.display = 'none';

                    // Only generate and display the schedule after countdown finishes
                    generateScheduleLogic();
                }
            }, 1000);
        });

        // Reattach delete button event listeners
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const choirId = parseInt(this.getAttribute('data-id'));
                choirs = choirs.filter(choir => choir.id !== choirId);
                updateChoirTable();
            });
        });
    }

    // Function to create alternating session tables (for Sessions 1 and 2)
    function createAlternatingSessionTable(sessionName, items, itemPerformanceOrders, container, thStyle, tdStyle, tableStyle) {
        if (items.length !== 2) {
            console.error("Alternating session must have exactly 2 items");
            return;
        }

        const item1 = items[0];
        const item2 = items[1];

        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-table';
        sessionDiv.style.marginBottom = '30px';
        sessionDiv.innerHTML = `<h3>${sessionName} (Items ${items.join(', ')})</h3>`;

        // Check if any choirs are performing in this session
        const choirs1 = itemPerformanceOrders[item1] || [];
        const choirs2 = itemPerformanceOrders[item2] || [];

        if (choirs1.length === 0 && choirs2.length === 0) {
            sessionDiv.innerHTML += '<p>No choirs scheduled for this session.</p>';
            container.appendChild(sessionDiv);
            return;
        }

        // Create a single table that shows the alternating performances
        const table = document.createElement('table');
        table.className = 'schedule-table';
        table.style.cssText = tableStyle;

        const thead = document.createElement('thead');
        thead.innerHTML = `
        <tr>
            <th colspan="3" style="${thStyle}">Alternating Performance Order</th>
        </tr>
        <tr>
            <th style="${thStyle}">Performance</th>
            <th style="${thStyle}">Choir Name</th>
            <th style="${thStyle}">Item</th>
        </tr>
    `;

        const tbody = document.createElement('tbody');

        // Create alternating schedule
        let performanceCounter = 1;

        // Create a map to keep track of choir IDs for each item
        const performingChoirs1 = choirs1.map(choir => ({ choir, item: item1 }));
        const performingChoirs2 = choirs2.map(choir => ({ choir, item: item2 }));

        // Shuffle these arrays for randomness
        shuffleArray(performingChoirs1);
        shuffleArray(performingChoirs2);

        // Arrays to keep track of the remaining performances
        let remaining1 = [...performingChoirs1];
        let remaining2 = [...performingChoirs2];

        // Set to track last choir ID to prevent back-to-back performances
        let lastChoirId = null;

        // Force strict alternating pattern by using currentItem
        let currentItem = item1; // Start with item1

        // Continue until all performances are scheduled
        while (remaining1.length > 0 || remaining2.length > 0) {
            // Determine which item to schedule based on strict alternation
            let nextRemaining, nextItem;

            if (currentItem === item1) {
                nextRemaining = remaining1;
                nextItem = item1;
                // If no more choirs for item1, switch to item2
                if (remaining1.length === 0) {
                    nextRemaining = remaining2;
                    nextItem = item2;
                    currentItem = item2; // Update current item
                }
            } else {
                nextRemaining = remaining2;
                nextItem = item2;
                // If no more choirs for item2, switch to item1
                if (remaining2.length === 0) {
                    nextRemaining = remaining1;
                    nextItem = item1;
                    currentItem = item1; // Update current item
                }
            }

            // Find a choir that's not the same as the last one
            let validChoirIndex = -1;
            for (let i = 0; i < nextRemaining.length; i++) {
                if (nextRemaining[i].choir.id !== lastChoirId) {
                    validChoirIndex = i;
                    break;
                }
            }

            // If all choirs would create a back-to-back performance, pick one anyway
            if (validChoirIndex === -1) {
                validChoirIndex = 0;
            }

            // Get the next choir to perform
            const nextPerformance = nextRemaining.splice(validChoirIndex, 1)[0];

            // Create the row
            const row = document.createElement('tr');
            row.innerHTML = `
            <td style="${tdStyle}">${performanceCounter}</td>
            <td style="${tdStyle}">${nextPerformance.choir.name}</td>
            <td style="${tdStyle}">${nextPerformance.item}</td>
        `;
            tbody.appendChild(row);

            // Update last choir ID
            lastChoirId = nextPerformance.choir.id;

            // Increment performance counter
            performanceCounter++;

            // Toggle to the other item for strict alternation
            currentItem = currentItem === item1 ? item2 : item1;
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        sessionDiv.appendChild(table);
        container.appendChild(sessionDiv);
    }

    // Original session table function (for Session 4)
    function createSessionTable(sessionName, items, itemPerformanceOrders, container, thStyle, tdStyle, tableStyle) {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-table';
        sessionDiv.style.marginBottom = '30px';
        sessionDiv.innerHTML = `<h3>${sessionName} (Items ${items.join(', ')})</h3>`;

        // Check if any choirs are performing in this session
        let hasPerformers = false;
        items.forEach(item => {
            if (itemPerformanceOrders[item] && itemPerformanceOrders[item].length > 0) {
                hasPerformers = true;
            }
        });

        if (!hasPerformers) {
            sessionDiv.innerHTML += '<p>No choirs scheduled for this session.</p>';
            container.appendChild(sessionDiv);
            return;
        }

        items.forEach(item => {
            if (itemPerformanceOrders[item] && itemPerformanceOrders[item].length > 0) {
                const table = document.createElement('table');
                table.className = 'schedule-table';
                table.style.cssText = tableStyle;

                const thead = document.createElement('thead');
                thead.innerHTML = `
                <tr>
                    <th colspan="2" style="${thStyle}">Item ${item}</th>
                </tr>
                <tr>
                    <th style="${thStyle}">Performance</th>
                    <th style="${thStyle}">Choir Name</th>
                </tr>
            `;

                const tbody = document.createElement('tbody');

                itemPerformanceOrders[item].forEach((choir, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td style="${tdStyle}">${index + 1}</td>
                    <td style="${tdStyle}">${choir.name}</td>
                `;
                    tbody.appendChild(row);
                });

                table.appendChild(thead);
                table.appendChild(tbody);
                sessionDiv.appendChild(table);
                sessionDiv.appendChild(document.createElement('br'));
            }
        });

        container.appendChild(sessionDiv);
    }

    const tableStyle = 'width: 100%; border-collapse: collapse; margin-top: 20px;';
    const thStyle = 'background-color: #f2f2f2; padding: 10px; text-align: left; border: 1px solid #ddd;';
    const tdStyle = 'padding: 10px; border: 1px solid #ddd;';

    // Form submission handler
    document.getElementById('choirForm').addEventListener('submit', function (event) {
        event.preventDefault();

        // Show countdown overlay
        const overlay = document.getElementById('countdownOverlay');
        overlay.style.display = 'flex';

        // Initialize countdown from 3
        let countdown = 3;
        const countdownDisplay = document.getElementById('countdownDisplay');
        countdownDisplay.textContent = countdown;

        // Update countdown every second
        const countdownInterval = setInterval(function () {
            countdown--;
            countdownDisplay.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(countdownInterval);

                // Generate schedule after countdown
                setTimeout(function () {
                    generateSchedule();
                    overlay.style.display = 'none';
                }, 1000);
            }
        }, 1000);
    });

    // Main function to generate the schedule
    function generateSchedule() {
        // Get input data
        const choirInput = document.getElementById('choirData').value.trim();
        if (!choirInput) {
            alert('Please enter choir data');
            return;
        }

        try {
            // Parse choir data
            const choirData = JSON.parse(choirInput);

            // Organize choirs by items they perform
            const itemChoirs = {
                'A': [],
                'B': [],
                'C': [],
                'D': [],
                'E': [],
                'F': [],
                'G': []
            };

            // Process choir data
            choirData.forEach(choir => {
                // Ensure choir has all required fields
                if (!choir.id || !choir.name || !choir.items || !choir.ballotNumber) {
                    console.warn('Skipping incomplete choir data:', choir);
                    return;
                }

                // Add choir to relevant item lists
                choir.items.forEach(item => {
                    if (itemChoirs[item]) {
                        itemChoirs[item].push({
                            id: choir.id,
                            name: choir.name,
                            ballotNumber: choir.ballotNumber,
                            items: choir.items // Keep track of all items this choir performs
                        });
                    }
                });
            });

            // Generate performance orders for each item
            const itemPerformanceOrders = generatePerformanceOrders(itemChoirs);

            // Clear previous results
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = '';

            // Create header
            const header = document.createElement('h2');
            header.textContent = 'Generated Performance Schedule';
            resultsContainer.appendChild(header);

            // Create sessions
            createSession1('Session 1', itemPerformanceOrders, resultsContainer, thStyle, tdStyle, tableStyle);
            createSession2('Session 2', itemPerformanceOrders, resultsContainer, thStyle, tdStyle, tableStyle);
            createMergedSession3('Session 3', itemPerformanceOrders, resultsContainer, thStyle, tdStyle, tableStyle);
            createSession4('Session 4', itemPerformanceOrders, resultsContainer, thStyle, tdStyle, tableStyle);

            // Show results section
            document.getElementById('resultsSection').style.display = 'block';

            // Scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth' });

        } catch (e) {
            console.error('Error processing choir data:', e);
            alert('Error processing choir data. Please check your input format.');
        }
    }

    // Create Session 1 with alternating F and G items, preventing back-to-back performances
    function createSession1(sessionName, itemPerformanceOrders, container, thStyle, tdStyle, tableStyle) {
        createAlternatingSessionTable(sessionName, ['F', 'G'], itemPerformanceOrders, container, thStyle, tdStyle, tableStyle);
    }

    // Create Session 2 with alternating E and C items, preventing back-to-back performances
    function createSession2(sessionName, itemPerformanceOrders, container, thStyle, tdStyle, tableStyle) {
        createAlternatingSessionTable(sessionName, ['E', 'C'], itemPerformanceOrders, container, thStyle, tdStyle, tableStyle);
    }

    // Create merged session 3 with A and B items combined and proper ordering
    function createMergedSession3(sessionName, itemPerformanceOrders, container, thStyle, tdStyle, tableStyle) {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-table';
        sessionDiv.style.marginBottom = '30px';
        sessionDiv.innerHTML = `<h3>${sessionName} (Items A, B)</h3>`;

        // Get a unique list of choirs that perform in either A or B or both
        const choirsInSession3 = new Map();

        // Gather all choirs from items A and B
        ['A', 'B'].forEach(item => {
            if (itemPerformanceOrders[item]) {
                itemPerformanceOrders[item].forEach(choir => {
                    if (!choirsInSession3.has(choir.id)) {
                        choirsInSession3.set(choir.id, {
                            id: choir.id,
                            name: choir.name,
                            ballotNumber: choir.ballotNumber,
                            items: choir.items.filter(i => i === 'A' || i === 'B'),
                            originalItems: choir.items
                        });
                    }
                });
            }
        });

        const session3Choirs = Array.from(choirsInSession3.values());

        if (session3Choirs.length === 0) {
            sessionDiv.innerHTML += '<p>No choirs scheduled for this session.</p>';
            container.appendChild(sessionDiv);
            return;
        }

        // Separate choirs into those performing both items and those performing just one
        const bothItemsChoirs = session3Choirs.filter(choir => choir.items.includes('A') && choir.items.includes('B'));
        const singleItemChoirs = session3Choirs.filter(choir => choir.items.length === 1);

        // Sort single item choirs by the item they perform (A or B)
        const onlyAChoirs = singleItemChoirs.filter(choir => choir.items.includes('A'));
        const onlyBChoirs = singleItemChoirs.filter(choir => choir.items.includes('B'));

        // Sort each group by ballot number
        bothItemsChoirs.sort((a, b) => a.ballotNumber - b.ballotNumber);
        onlyAChoirs.sort((a, b) => a.ballotNumber - b.ballotNumber);
        onlyBChoirs.sort((a, b) => a.ballotNumber - b.ballotNumber);

        // Shuffle each group to add randomization while maintaining the grouping
        const shuffledBothItemsChoirs = shuffleArray([...bothItemsChoirs]);
        const shuffledOnlyAChoirs = shuffleArray([...onlyAChoirs]);
        const shuffledOnlyBChoirs = shuffleArray([...onlyBChoirs]);

        // Arrange single-item choirs in alternating A/B order
        const alternatingChoirs = [];
        const maxSingleItems = Math.max(shuffledOnlyAChoirs.length, shuffledOnlyBChoirs.length);

        for (let i = 0; i < maxSingleItems; i++) {
            if (i < shuffledOnlyAChoirs.length) {
                alternatingChoirs.push(shuffledOnlyAChoirs[i]);
            }
            if (i < shuffledOnlyBChoirs.length) {
                alternatingChoirs.push(shuffledOnlyBChoirs[i]);
            }
        }

        // Final performance order: first those performing both items, then alternating A/B
        const finalOrder = [...shuffledBothItemsChoirs, ...alternatingChoirs];

        // Create a single table for Session 3
        const table = document.createElement('table');
        table.className = 'schedule-table';
        table.style.cssText = tableStyle;

        const thead = document.createElement('thead');
        thead.innerHTML = `
        <tr>
            <th colspan="3" style="${thStyle}">Performance for Items A & B</th>
        </tr>
        <tr>
            <th style="${thStyle}">Performance</th>
            <th style="${thStyle}">Choir Name</th>
            <th style="${thStyle}">Items Performing</th>
        </tr>
    `;

        const tbody = document.createElement('tbody');

        finalOrder.forEach((choir, index) => {
            const row = document.createElement('tr');
            // Display which items from A and B the choir is performing
            const itemsText = choir.items.join(', ');

            row.innerHTML = `
            <td style="${tdStyle}">${index + 1}</td>
            <td style="${tdStyle}">${choir.name}</td>
            <td style="${tdStyle}">${itemsText}</td>
        `;
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        sessionDiv.appendChild(table);
        container.appendChild(sessionDiv);
    }

    // Create Session 4 with Item D performances
    function createSession4(sessionName, itemPerformanceOrders, container, thStyle, tdStyle, tableStyle) {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-table';
        sessionDiv.style.marginBottom = '30px';
        sessionDiv.innerHTML = `<h3>${sessionName} (Item D)</h3>`;

        const itemD = itemPerformanceOrders['D'] || [];

        if (itemD.length === 0) {
            sessionDiv.innerHTML += '<p>No choirs scheduled for this session.</p>';
            container.appendChild(sessionDiv);
            return;
        }

        // Create table n 4
        const table = document.createElement('table');
        table.className = 'schedule-table';
        table.style.cssText = tableStyle;

        const thead = document.createElement('thead');
        thead.innerHTML = `
        <tr>
            <th colspan="2" style="${thStyle}">Performance for Item D</th>
        </tr>
        <tr>
            <th style="${thStyle}">Performance</th>
            <th style="${thStyle}">Choir Name</th>
        </tr>
    `;

        const tbody = document.createElement('tbody');

        itemD.forEach((choir, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td style="${tdStyle}">${index + 1}</td>
            <td style="${tdStyle}">${choir.name}</td>
        `;
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        sessionDiv.appendChild(table);
        container.appendChild(sessionDiv);
    }

    // Generate randomized performance orders
    function generatePerformanceOrders(itemChoirs) {
        const itemPerformanceOrders = {};
        const positionConstraints = {}; // To track which choirs performed at which positions

        // Process items in order
        const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

        items.forEach(item => {
            const choirsForItem = itemChoirs[item];

            if (choirsForItem && choirsForItem.length > 0) {
                // Sort first by ballot number to create initial order
                const sortedChoirs = [...choirsForItem].sort((a, b) => a.ballotNumber - b.ballotNumber);

                // Now shuffle while respecting constraints
                const shuffledOrder = shuffleWithConstraints(sortedChoirs, positionConstraints);

                // Update position constraints
                shuffledOrder.forEach((choir, position) => {
                    if (!positionConstraints[choir.id]) {
                        positionConstraints[choir.id] = [];
                    }
                    positionConstraints[choir.id].push(position);
                });

                itemPerformanceOrders[item] = shuffledOrder;
            } else {
                itemPerformanceOrders[item] = [];
            }
        });

        return itemPerformanceOrders;
    }

    // Shuffle choirs while respecting position constraints
    function shuffleWithConstraints(choirs, positionConstraints) {
        // Make a copy to avoid modifying the original
        const choirsCopy = [...choirs];
        const result = [];
        const positions = Array.from(Array(choirsCopy.length).keys());

        // Assign positions based on constraints
        while (choirsCopy.length > 0) {
            // Find a choir that can be placed at an available position
            let placed = false;

            // Randomize the order in which we try choirs
            const choirIndices = Array.from(Array(choirsCopy.length).keys());
            shuffleArray(choirIndices);

            for (let i of choirIndices) {
                const choir = choirsCopy[i];

                // Get positions this choir has already performed at
                const previousPositions = positionConstraints[choir.id] || [];

                // Find available positions this choir hasn't performed at
                const availablePositions = positions.filter(pos => !previousPositions.includes(pos));

                if (availablePositions.length > 0) {
                    // Choose a random available position
                    shuffleArray(availablePositions);
                    const chosenPosition = availablePositions[0];

                    // Place choir at this position
                    result[chosenPosition] = choir;

                    // Remove choir and position from available lists
                    choirsCopy.splice(i, 1);
                    positions.splice(positions.indexOf(chosenPosition), 1);

                    placed = true;
                    break;
                }
            }

            // If no choir could be placed with constraints, place a random choir
            if (!placed && choirsCopy.length > 0) {
                shuffleArray(choirsCopy);
                const choir = choirsCopy.pop();
                const position = positions.pop();
                result[position] = choir;
            }
        }

        // Remove undefined entries (in case some positions couldn't be filled)
        return result.filter(entry => entry !== undefined);
    }

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Create popup elements and add them to the DOM
    const popupOverlay = document.createElement('div');
    popupOverlay.id = 'countdownOverlay';
    popupOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const popupContent = document.createElement('div');
    popupContent.id = 'countdownPopup';
    popupContent.style.cssText = `
        background-color: white;
        padding: 30px 50px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    `;

    const countdownTitle = document.createElement('h2');
    countdownTitle.textContent = 'Generating order of Presentation';
    countdownTitle.style.marginBottom = '20px';

    const countdownDisplay = document.createElement('div');
    countdownDisplay.id = 'countdownDisplay';
    countdownDisplay.style.cssText = `
        font-size: 48px;
        font-weight: bold;
        color: #333;
        margin: 20px 0;
    `;

    const loadingText = document.createElement('p');
    loadingText.textContent = 'Please wait while we generate your program...';

    popupContent.appendChild(countdownTitle);
    popupContent.appendChild(countdownDisplay);
    popupContent.appendChild(loadingText);
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
});
