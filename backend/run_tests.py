import sys
print("Python version:", sys.version)

try:
    from app.main import app
    print("FastAPI app loaded successfully.")
    
    # Test service directly
    from app.services.url_service import URLInspectionService
    res = URLInspectionService.process_url_submission("https://paypal-login-alert.com")
    print("URL Inspection test:", res["risk_level"], res["engine_status"])
    
    from app.services.email_service import EmailInspectionService
    res_email = EmailInspectionService.process_email_submission("Immediate action required: verify bank account.")
    print("Email Inspection test:", res_email["risk_level"], res_email["engine_status"])
    
    print("All backend components verified successfully!")
except Exception as e:
    print("Error:", e)
    import traceback
    traceback.print_exc()
    sys.exit(1)
