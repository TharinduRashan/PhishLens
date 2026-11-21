import unittest
from fastapi import HTTPException
from app.api.v1.endpoints.health import get_health_status
from app.api.v1.endpoints.scans import scan_url, scan_email, list_scans
from app.db.session import SessionLocal
from app.main import root
from app.schemas.scan import URLScanRequest, EmailScanRequest


class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_root_endpoint(self):
        res = root()
        self.assertEqual(res["platform"], "PhishLens API")
        self.assertEqual(res["version"], "0.1.0")

    def test_health_endpoint(self):
        res = get_health_status(db=self.db)
        self.assertEqual(res.status, "success")
        self.assertEqual(res.data.status, "healthy")
        self.assertIn("url_inspection_v1", res.data.capabilities)

    def test_scan_url_501_not_implemented(self):
        req = URLScanRequest(url="https://secure-login-phish.net/account", deep_analysis=False)
        res = scan_url(payload=req, db=self.db)
        self.assertEqual(res.status_code, 501)
        import json
        body = json.loads(res.body.decode("utf-8"))
        self.assertEqual(body["status"], "not_implemented")
        self.assertEqual(body["data"]["scan_type"], "URL")
        self.assertEqual(body["data"]["engine_status"], "engine_pending")

    def test_scan_url_ssrf_protection_exception(self):
        req = URLScanRequest(url="http://127.0.0.1:8000/admin")
        with self.assertRaises(HTTPException) as ctx:
            scan_url(payload=req, db=self.db)
        self.assertEqual(ctx.exception.status_code, 422)
        self.assertIn("SSRF Shield Block", ctx.exception.detail)

    def test_scan_email_501_not_implemented(self):
        req = EmailScanRequest(
            content="Important notice: Please verify your payroll profile immediately.",
            sender="hr@company-security-portal.xyz",
            subject="Urgent Payroll Notification"
        )
        res = scan_email(payload=req, db=self.db)
        self.assertEqual(res.status_code, 501)
        import json
        body = json.loads(res.body.decode("utf-8"))
        self.assertEqual(body["status"], "not_implemented")
        self.assertEqual(body["data"]["scan_type"], "EMAIL")

    def test_list_scans_endpoint(self):
        res = list_scans(limit=10, offset=0, db=self.db)
        self.assertEqual(res.status, "success")
        self.assertIsNotNone(res.data.items)


if __name__ == "__main__":
    unittest.main()
