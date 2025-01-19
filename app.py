from flask import Flask, render_template, request, jsonify
import math
import numpy as np

app = Flask(__name__)

def hitung_poisson(k, lambda_val):
    """Menghitung probabilitas Poisson untuk nilai k tertentu"""
    return (math.exp(-lambda_val) * (lambda_val ** k)) / math.factorial(k)

def generate_skor_table(expected_home, expected_away, max_goals=4):
    """Menghasilkan tabel probabilitas skor"""
    probability_matrix = []
    for i in range(max_goals + 1):
        row = []
        for j in range(max_goals + 1):
            prob_home = hitung_poisson(i, expected_home)
            prob_away = hitung_poisson(j, expected_away)
            row.append(prob_home * prob_away * 100)
        probability_matrix.append(row)
    return probability_matrix

def hitung_probabilitas_hasil(matrix):
    """Menghitung probabilitas untuk berbagai hasil pertandingan"""
    home_win = 0
    draw = 0
    away_win = 0
    
    for i in range(len(matrix)):
        for j in range(len(matrix[0])):
            if i > j:  # Home win
                home_win += matrix[i][j]
            elif i == j:  # Draw
                draw += matrix[i][j]
            else:  # Away win
                away_win += matrix[i][j]
    
    return {
        'home_win': home_win,
        'draw': draw,
        'away_win': away_win
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    expected_home = float(data['home'])
    expected_away = float(data['away'])
    
    # Generate probability matrix
    prob_matrix = generate_skor_table(expected_home, expected_away)
    
    # Calculate match outcomes
    hasil = hitung_probabilitas_hasil(prob_matrix)
    
    # Calculate BTTS (Both Teams To Score) probability
    btts_yes = sum(prob_matrix[i][j] for i in range(1, len(prob_matrix)) 
                   for j in range(1, len(prob_matrix[0])))
    btts_no = 100 - btts_yes
    
    return jsonify({
        'matrix': prob_matrix,
        'hasil': hasil,
        'btts': {'yes': btts_yes, 'no': btts_no}
    })

if __name__ == '__main__':
    app.run(debug=True)
