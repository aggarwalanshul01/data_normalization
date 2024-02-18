from flask import Flask, request, jsonify
import os
import uuid
import csv

app = Flask(__name__)


UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed file extensions
ALLOWED_EXTENSIONS = {'csv'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if a file is in the request
    if 'csvFile' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['csvFile']

    # Check if the file is empty
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    # Check if the file has a allowed extension
    if file and allowed_file(file.filename):
        # Generate a unique filename using UUID
        filename = str(uuid.uuid4()) + '.csv'
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Read the CSV file
        with open(file_path, 'r', newline='') as csvfile:
            csv_reader = csv.reader(csvfile)
            # Get column names from the first row
            column_names = next(csv_reader)
            # Get first five data rows
            data_rows = [row for _, row in zip(range(5), csv_reader)]

        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'column_names': column_names,
            'data_rows': data_rows
        }), 200
    else:
        return jsonify({'message': 'Invalid file format. Allowed formats: .csv'}), 400


@app.route('/update-names', methods=['POST'])
def update_names():
    global column_names, renamed_columns, table_name

    # Get the updated column names and table name from the request body
    data = request.get_json()
    updated_renamed_columns = data.get('renamedColumns', {})
    table_name = data.get('tableName', '')
    filename = data.get('fileName', '')
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    # Update column names, renamed columns, and table name
    with open(file_path, 'r', newline='') as csvfile:
        csv_reader = csv.reader(csvfile)
        # Get column names from the first row
        column_names = next(csv_reader)
        print(column_names)
        print(updated_renamed_columns)
        result = []
        for item in column_names:
            if item in updated_renamed_columns and len(updated_renamed_columns[item]) > 0:
                result.append(updated_renamed_columns[item])
            else:
                result.append(item)

    # Return a success message
    return jsonify({'message': 'Column names and table name updated successfully'}), 200
