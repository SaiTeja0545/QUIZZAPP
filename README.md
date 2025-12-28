# Quiz App — Local Setup

Run a local json-server to serve `db.json` for questions and users.

Install dev dependencies (optional):

```bash
npm install
```

Start the fake API with json-server:

```bash
npm run serve:db
# or
npx json-server --watch db.json --port 3000
```

Open `index.html` in the browser (no special server required for the frontend). Use `register.html` to create users and `login.html` to sign in. The default admin account is:

- username: admin
- password: admin123

Admin users are redirected to `admin.html` for adding questions.
# QUIZZAPP
