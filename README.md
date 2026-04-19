# Scholarium — Autonomous Skill Acquisition Agent

## Prerequisites
  - Python 3.10+
  - Node.js 18+
  - MySQL 8+ running on localhost:3306
  - MongoDB Community Edition running on localhost:27017

## Backend setup
  cd scholarium
  chmod +x setup.sh && ./setup.sh      # creates venv + installs requirements.txt
  source venv/bin/activate
  cd backend
  cp .env.example .env                 # fill in your credentials + API keys
  # Run MySQL setup commands from STEP 2 first
  python manage.py makemigrations
  python manage.py migrate
  python manage.py createsuperuser
  python manage.py runserver           # http://localhost:8000

## Frontend setup (new terminal)
  cd scholarium/frontend
  npm install
  npm run dev                          # http://localhost:5173

## Switch AI provider
  In backend/.env set:  LLM_PROVIDER=claude   (default)
                    or: LLM_PROVIDER=gemini
  Restart Django. No code changes needed.

## MySQL troubleshooting
  - Linux install: sudo apt install libmysqlclient-dev
  - Mac install:   brew install mysql
  - Test connection: python manage.py dbshell

## MongoDB troubleshooting
  - Linux start: sudo systemctl start mongod
  - Mac start:   mongod --config /usr/local/etc/mongod.conf
  - Verify:      mongosh --eval "db.runCommand({ping:1})"
