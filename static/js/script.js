document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculateBtn');
    const homeInput = document.getElementById('homeGoals');
    const awayInput = document.getElementById('awayGoals');
    
    // Set default values
    homeInput.value = "1.655";
    awayInput.value = "2.123";
    
    calculateBtn.addEventListener('click', calculateProbabilities);
    // Initial calculation on page load
    calculateProbabilities();
});

async function calculateProbabilities() {
    const homeGoals = document.getElementById('homeGoals').value;
    const awayGoals = document.getElementById('awayGoals').value;
    const showPercent = document.getElementById('showPercent').checked;

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                home: homeGoals,
                away: awayGoals
            })
        });

        const data = await response.json();
        updateAllTables(data, showPercent);
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateAllTables(data, showPercent) {
    // Update Peluang Hasil Akhir table
    updateFinalResults(data.hasil);
    
    // Update Gol Atas/Bawah table
    updateOverUnderTable(data.matrix);
    
    // Update Peluang untuk Menang Bersih table
    updateCleanWinTable(data.hasil);
    
    // Update BTTS table
    updateBTTSTable(data.btts);
    
    // Update Correct Score table
    updateCorrectScoreTable(data.matrix);
}

function updateFinalResults(hasil) {
    const table = document.getElementById('finalResults').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    
    // Menang di kandang sendiri
    updateTableRow(rows[0], hasil.home_win);
    
    // Kemenangan tandang
    updateTableRow(rows[1], hasil.draw);
    
    // Menggambar
    updateTableRow(rows[2], hasil.away_win);
}

function updateTableRow(row, probability) {
    const cells = row.getElementsByTagName('td');
    const odds = probability > 0 ? (1 / (probability / 100)).toFixed(2) : "0.00";
    cells[1].textContent = odds;
    cells[2].textContent = probability.toFixed(2) + "%";
}

function updateOverUnderTable(matrix) {
    const table = document.getElementById('overUnderTable');
    table.innerHTML = '';
    
    // Create header
    const headerRow = document.createElement('tr');
    const goals = [0.5, 1.5, 2.5, 3.5, 4.5];
    headerRow.innerHTML = '<th></th>';
    goals.forEach(goal => {
        headerRow.innerHTML += `<th>${goal}</th>`;
    });
    table.appendChild(headerRow);
    
    // Create "Lebih" row
    const overRow = document.createElement('tr');
    overRow.innerHTML = '<td>Lebih</td>';
    goals.forEach(goal => {
        const prob = calculateOverProbability(matrix, goal);
        overRow.innerHTML += `<td>${prob.toFixed(2)}</td>`;
    });
    table.appendChild(overRow);
    
    // Create "Di bawah" row
    const underRow = document.createElement('tr');
    underRow.innerHTML = '<td>Di bawah</td>';
    goals.forEach(goal => {
        const prob = calculateUnderProbability(matrix, goal);
        underRow.innerHTML += `<td>${prob.toFixed(2)}</td>`;
    });
    table.appendChild(underRow);
}

function calculateOverProbability(matrix, goal) {
    let prob = 0;
    const maxGoals = matrix.length;
    for (let i = 0; i < maxGoals; i++) {
        for (let j = 0; j < maxGoals; j++) {
            if (i + j > goal) {
                prob += matrix[i][j];
            }
        }
    }
    return prob;
}

function calculateUnderProbability(matrix, goal) {
    let prob = 0;
    const maxGoals = matrix.length;
    for (let i = 0; i < maxGoals; i++) {
        for (let j = 0; j < maxGoals; j++) {
            if (i + j < goal) {
                prob += matrix[i][j];
            }
        }
    }
    return prob;
}

function updateCleanWinTable(hasil) {
    const table = document.getElementById('cleanWinTable').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');
    
    // Home clean win
    rows[0].getElementsByTagName('td')[1].textContent = (hasil.home_win / 2).toFixed(2);
    rows[0].getElementsByTagName('td')[2].textContent = (100 - hasil.home_win / 2).toFixed(2);
    
    // Away clean win
    rows[1].getElementsByTagName('td')[1].textContent = (hasil.away_win / 2).toFixed(2);
    rows[1].getElementsByTagName('td')[2].textContent = (100 - hasil.away_win / 2).toFixed(2);
}

function updateBTTSTable(btts) {
    const table = document.getElementById('bttsTable').getElementsByTagName('tbody')[0];
    const row = table.getElementsByTagName('tr')[0];
    
    row.getElementsByTagName('td')[0].textContent = btts.yes.toFixed(2);
    row.getElementsByTagName('td')[1].textContent = btts.no.toFixed(2);
}

function updateCorrectScoreTable(matrix) {
    const table = document.getElementById('correctScoreTable');
    table.innerHTML = '';
    
    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>angka 0</th>';
    for (let i = 0; i < matrix[0].length; i++) {
        headerRow.innerHTML += `<th>${i}</th>`;
    }
    table.appendChild(headerRow);
    
    // Create data rows
    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${i}</td>`;
        for (let j = 0; j < matrix[i].length; j++) {
            row.innerHTML += `<td>${matrix[i][j].toFixed(2)}</td>`;
        }
        table.appendChild(row);
    }
}
