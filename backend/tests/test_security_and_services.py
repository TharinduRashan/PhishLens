import sys
import unittest
from app.main import app
from app.services.url_service import URLInspectionService
from app.services.email_service import EmailInspectionService
from app.core.security import validate_and_normalize_url, SSRFProtectionError, InvalidURLError


class TestPhishLensBackend(unittest.TestCase):
    def test_ssrf_loopback_blocked(self):
        with self.assertRaises(SSRFProtectionError):
            validate_and_normalize_url("http://127.0.0.1:8080/admin")

    def test_ssrf_private_network_blocked(self):
        with self.assertRaises(SSRFProtectionError):
            validate_and_normalize_url("http://192.168.1.1/setup")

    def test_ssrf_cloud_metadata_blocked(self):
        with self.assertRaises(SSRFProtectionError):
            validate_and_normalize_url("http://169.254.169.254/latest/meta-data/")

    def test_invalid_scheme_blocked(self):
        with self.assertRaises(InvalidURLError):
            validate_and_normalize_url("file:///etc/passwd")

    def test_valid_url_normalization(self):
        url, host = validate_and_normalize_url("HTTPS://EXAMPLE.COM:443/test/path?q=1")
        self.assertEqual(url, "https://example.com/test/path?q=1")
        self.assertEqual(host, "example.com")

    def test_url_inspection_phase1(self):
        res = URLInspectionService.process_url_submission("https://paypal-verification.com/login")
        self.assertEqual(res["risk_level"], "UNKNOWN")
        self.assertEqual(res["engine_status"], "engine_pending")
        self.assertIn("Phase 1: Project Foundation", res["summary"])
        self.assertTrue(len(res["indicators"]) >= 4)

    def test_email_inspection_phase1(self):
        res = EmailInspectionService.process_email_submission(
            content="Urgent: your account has been temporarily disabled. Confirm password immediately.",
            sender="alert@security-service.com",
            subject="Account Locked"
        )
        self.assertEqual(res["scan_type"], "EMAIL")
        self.assertEqual(res["risk_level"], "UNKNOWN")
        self.assertEqual(res["engine_status"], "engine_pending")
        self.assertTrue(len(res["indicators"]) >= 4)


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPhishLensBackend)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if not result.wasSuccessful():
        sys.exit(1)
    print("All unit and security tests passed!")
