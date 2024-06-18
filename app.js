document.addEventListener('DOMContentLoaded', function() {
    const recordButton = document.getElementById('recordButton');
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep listening even after the audio stops
    recognition.lang = 'en-US'; // Set the language of the recognition
    recognition.interimResults = false; // We only want final results

    let recording = false;

    recognition.onresult = function(event) {
        const transcript = event.results[event.resultIndex][0].transcript.trim();
        console.log('Transcript:', transcript); // Output the transcription
        processData(transcript); // Process and display the data
    };

    recordButton.addEventListener('click', () => {
        if (recording) {
            recognition.stop();
            recordButton.textContent = 'Start Recording';
        } else {
            recognition.start();
            recordButton.textContent = 'Stop Recording';
        }
        recording = !recording;
    });
});

function processData(transcript) {
    const namePattern = /\b[A-Z][a-z]*\b/; // Simple pattern to capture a name
    const placePattern = /from (\w+)/; // Capture a word after 'from'
    const amountPattern = /(\d+(,\d{3})*|\d+)/; // Capture an amount with or without comma separators

    const nameMatch = transcript.match(namePattern);
    const placeMatch = transcript.match(placePattern);
    const amountMatch = transcript.match(amountPattern);

    if (nameMatch && placeMatch && amountMatch) {
        const name = nameMatch[0];
        const place = placeMatch[1];
        const amount = amountMatch[0];

        // Insert data into the table
        const table = document.getElementById('donationsTable');
        const newRow = table.insertRow(-1); // Inserts a row at the end of the table
        const cell1 = newRow.insertCell(0); // Name
        const cell2 = newRow.insertCell(1); // Place
        const cell3 = newRow.insertCell(2); // Donation Amount

        cell1.textContent = name;
        cell2.textContent = place;
        cell3.textContent = amount;
    } else {
        console.log('Could not parse the input correctly.');
    }
}

document.getElementById('exportExcelButton').addEventListener('click', exportToExcel);
document.getElementById('exportPDFButton').addEventListener('click', exportToPDF);

function exportToExcel() {
    let table = document.getElementById('donationsTable');
    let workbook = XLSX.utils.table_to_book(table);
    XLSX.writeFile(workbook, 'Donations.xlsx');
}

function exportToPDF() {
    const doc = new jspdf.jsPDF();

    const options = {
        didDrawPage: function(data) {
            // Set the header
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.setFont('normal');
            doc.text("Charity Donation Tracker", data.settings.margin.left + 15, 22);
        },
        margin: {
            top: 30
        },
        startY: doc.internal.pageSize.getHeight() / 10,
        theme: 'grid',
        headStyles: {
            fillColor: [33, 150, 243], // Blue color for header background
            textColor: [255, 255, 255], // White text color for header
            fontStyle: 'bold'
        },
        bodyStyles: {
            fillColor: [255, 255, 255], // White background for body
            textColor: [33, 150, 243], // Blue text color for body
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245] // Lighter gray for alternate rows
        },
        columnStyles: {
            0: { cellWidth: 60 }, // Assuming 'Name'
            1: { cellWidth: 70 }, // Assuming 'Place'
            2: { cellWidth: 50 }, // Assuming 'Donation Amount'
        }
    };

    // Ensure the table is drawn with the new styles
    doc.autoTable({
        html: '#donationsTable',
        styles: { fontSize: 11, overflow: 'linebreak' },
        ...options
    });

    doc.save('Donations.pdf');
}

document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('donationsTable');

    table.addEventListener('click', function(e) {
        const target = e.target;
        if (target.tagName === 'TD' && !target.classList.contains('input')) {
            makeEditable(target);
        }
    });
});

function makeEditable(cell) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = cell.innerText;
    input.classList.add('editing');

    // Replace the cell's content with the input
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();

    // Handle when we stop editing
    input.addEventListener('blur', function() {
        cell.innerText = input.value;  // Update the cell with the new text
        cell.classList.remove('input'); // Remove input class if needed
    });

    // Optional: Save changes when pressing Enter key
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            input.blur(); // This triggers the blur event handler above
        }
    });
}


