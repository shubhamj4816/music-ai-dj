# Flask Web Application

## Setup

1. **Clone the repository** (or navigate to the project directory)

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**:
   - Create a `.env` file in the root directory
   - Add your configuration:
     ```
     FLASK_APP=app.py
     FLASK_ENV=development
     SECRET_KEY=your-secret-key-here
     ```

## Running the Application

1. **Start the Flask server**:
   ```bash
   python app.py
   ```
   Or:
   ```bash
   flask run
   ```

2. **Access the application**:
   - Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
.
├── app.py                 # Main Flask application
├── .env                   # Environment variables (create this)
├── requirements.txt       # Python dependencies
├── static/
│   ├── script.js         # JavaScript functionality
│   └── style.css         # Styling
└── templates/
    ├── index.html        # Home page
    ├── music_agent.html  # Music agent page
    └── user_form.html    # User form page
```