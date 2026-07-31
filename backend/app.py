from __future__ import annotations

import os
import secrets
import sqlite3
from pathlib import Path

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DATABASE = (
    Path("/tmp/portal.db")
    if os.environ.get("VERCEL")
    else BASE_DIR / "instance" / "portal.db"
)

DEMO_ACCOUNTS = (
    ("STU001", "Demo Student", "demo.student@mmu.edu.my", "student", "student123"),
    ("MEN001", "Dr. Aisha Rahman", "aisha.rahman@mmu.edu.my", "mentor", "mentor123"),
    ("ADM001", "Portal Administrator", "admin@mmu.edu.my", "admin", "admin123"),
)


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE=os.environ.get("PORTAL_DATABASE", str(DEFAULT_DATABASE)),
        JSON_SORT_KEYS=False,
    )
    if test_config:
        app.config.update(test_config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    def get_db() -> sqlite3.Connection:
        if "db" not in g:
            database = Path(app.config["DATABASE"])
            database.parent.mkdir(parents=True, exist_ok=True)
            g.db = sqlite3.connect(database)
            g.db.row_factory = sqlite3.Row
        return g.db

    @app.teardown_appcontext
    def close_db(_: BaseException | None) -> None:
        database = g.pop("db", None)
        if database is not None:
            database.close()

    def initialize_database() -> None:
        database = get_db()
        database.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_id TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                role TEXT NOT NULL CHECK(role IN ('student', 'mentor', 'admin')),
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        for actor_id, name, email, role, password in DEMO_ACCOUNTS:
            database.execute(
                """
                INSERT OR IGNORE INTO users
                    (actor_id, name, email, role, password_hash)
                VALUES (?, ?, ?, ?, ?)
                """,
                (actor_id, name, email, role, generate_password_hash(password)),
            )
        database.commit()

    with app.app_context():
        initialize_database()

    def payload() -> dict:
        return request.get_json(silent=True) or {}

    def public_user(user: sqlite3.Row) -> dict:
        return {
            "id": user["id"],
            "actorId": user["actor_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }

    def login(role: str):
        body = payload()
        identifier = str(body.get("identifier", "")).strip().lower()
        password = str(body.get("password", ""))
        if not identifier or not password:
            return jsonify({"message": "ID/email and password are required."}), 400

        user = get_db().execute(
            """
            SELECT * FROM users
            WHERE role = ? AND (lower(actor_id) = ? OR lower(email) = ?)
            """,
            (role, identifier, identifier),
        ).fetchone()
        if user is None or not check_password_hash(user["password_hash"], password):
            return jsonify({"message": "Invalid ID/email or password."}), 401

        return jsonify(
            {
                "message": f"{role.title()} login successful.",
                "token": secrets.token_urlsafe(24),
                "user": public_user(user),
            }
        )

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "database": "sqlite"})

    @app.post("/api/auth/student/login")
    def student_login():
        return login("student")

    @app.post("/api/auth/mentor/login")
    def mentor_login():
        return login("mentor")

    @app.post("/api/auth/admin/login")
    def admin_login():
        return login("admin")

    @app.post("/api/auth/student/register")
    def student_register():
        body = payload()
        name = str(body.get("name", "")).strip()
        email = str(body.get("email", "")).strip().lower()
        password = str(body.get("password", ""))
        if not name or not email or not password:
            return jsonify({"message": "Name, email, and password are required."}), 400
        if len(password) < 6:
            return jsonify({"message": "Password must contain at least 6 characters."}), 400

        database = get_db()
        next_number = database.execute(
            "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM users"
        ).fetchone()["next_id"]
        actor_id = f"STU{next_number:03d}"
        try:
            cursor = database.execute(
                """
                INSERT INTO users (actor_id, name, email, role, password_hash)
                VALUES (?, ?, ?, 'student', ?)
                """,
                (actor_id, name, email, generate_password_hash(password)),
            )
            database.commit()
        except sqlite3.IntegrityError:
            return jsonify({"message": "An account with this email already exists."}), 409

        user = database.execute(
            "SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return jsonify(
            {
                "message": "Student registration successful.",
                "token": secrets.token_urlsafe(24),
                "user": public_user(user),
            }
        ), 201

    @app.post("/api/auth/mentor/register")
    def mentor_register():
        body = payload()
        name = str(body.get("name", "")).strip()
        email = str(body.get("email", "")).strip().lower()
        password = str(body.get("password", ""))
        if not name or not email or not password:
            return jsonify({"message": "Name, email, and access code are required."}), 400
        if len(password) < 6:
            return jsonify({"message": "Access code must contain at least 6 characters."}), 400

        database = get_db()
        next_number = database.execute(
            "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM users"
        ).fetchone()["next_id"]
        actor_id = f"MEN{next_number:03d}"
        try:
            cursor = database.execute(
                """
                INSERT INTO users (actor_id, name, email, role, password_hash)
                VALUES (?, ?, ?, 'mentor', ?)
                """,
                (actor_id, name, email, generate_password_hash(password)),
            )
            database.commit()
        except sqlite3.IntegrityError:
            return jsonify({"message": "An account with this email already exists."}), 409

        user = database.execute(
            "SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return jsonify(
            {
                "message": "Mentor registration submitted.",
                "token": secrets.token_urlsafe(24),
                "user": public_user(user),
            }
        ), 201

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
