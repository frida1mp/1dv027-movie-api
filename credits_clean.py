import ast, json, csv

with open('./data/credits.csv', 'r') as infile, open('credits_clean.csv', 'w', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in reader:
        try:
            # Use ast.literal_eval to safely parse the Python literal
            cast = ast.literal_eval(row['cast'])
            # Convert to a JSON string
            row['cast'] = json.dumps(cast)
        except Exception as e:
            print(f"Error processing row {row['id']}: {e}")
            row['cast'] = "[]"
        writer.writerow(row)
