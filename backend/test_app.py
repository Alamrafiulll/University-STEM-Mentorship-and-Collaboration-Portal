import tempfile
import unittest
from pathlib import Path

from app import create_app


class AuthenticationApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        database = Path(self.temp_directory.name) / "test.db"
        self.app = create_app({"TESTING": True, "DATABASE": str(database)})
        self.client = self.app.test_client()

    def tearDown(self):
        self.temp_directory.cleanup()

    def test_health_reports_sqlite(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["database"], "sqlite")

    def test_all_demo_actors_can_login(self):
        accounts = (
            ("student", "STU001", "student123"),
            ("mentor", "MEN001", "mentor123"),
            ("admin", "ADM001", "admin123"),
        )
        for role, identifier, password in accounts:
            response = self.client.post(
                f"/api/auth/{role}/login",
                json={"identifier": identifier, "password": password},
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json["user"]["role"], role)

    def test_student_can_register_and_login(self):
        registration = self.client.post(
            "/api/auth/student/register",
            json={
                "name": "New Student",
                "email": "new.student@mmu.edu.my",
                "password": "simple123",
            },
        )
        self.assertEqual(registration.status_code, 201)

        login = self.client.post(
            "/api/auth/student/login",
            json={
                "identifier": "new.student@mmu.edu.my",
                "password": "simple123",
            },
        )
        self.assertEqual(login.status_code, 200)


if __name__ == "__main__":
    unittest.main()
