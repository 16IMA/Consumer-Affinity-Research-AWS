import csv
import json

with open('customer_survey_q1_2026.csv', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

with open('survey_data.json', 'w', encoding='utf-8') as f:
    for row in rows:
        f.write(json.dumps(row, ensure_ascii=False) + '\n')

print(f'{len(rows)} filas convertidas a survey_data.json')
