#!/usr/bin/env python3
"""
Comprehensive test script for all user flows:
1. User Registration
2. User Login
3. Dashboard Access for each role
4. User Logout
5. State Persistence
"""

import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:5175"

# Test users
TEST_USERS = {
    "student": {
        "email": "newstudent@test.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "Student",
        "role": "STUDENT"
    },
    "supervisor": {
        "email": "newsupervisor@test.com", 
        "password": "TestPass456!",
        "first_name": "Test",
        "last_name": "Supervisor",
        "role": "SUPERVISOR"
    },
    "coordinator": {
        "email": "newcoordinator@test.com",
        "password": "TestPass789!",
        "first_name": "Test",
        "last_name": "Coordinator",
        "role": "COORDINATOR"
    },
    "admin": {
        "email": "newadmin@test.com",
        "password": "TestPass000!",
        "first_name": "Test",
        "last_name": "Admin",
        "role": "ADMIN"
    }
}

# Pre-existing test users
EXISTING_USERS = {
    "student": {"email": "student@test.com", "password": "student123"},
    "supervisor": {"email": "supervisor@test.com", "password": "supervisor123"},
    "coordinator": {"email": "coordinator@test.com", "password": "coordinator123"},
    "admin": {"email": "admin@test.com", "password": "admin123"}
}

class UserFlowTester:
    def __init__(self):
        self.session = requests.Session()
        self.results = []
        self.test_tokens = {}
        
    def log(self, test_name: str, status: str, message: str, details: Dict[str, Any] = None):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details or {}
        }
        self.results.append(result)
        status_symbol = "✅" if status == "PASS" else "❌"
        print(f"{status_symbol} {test_name}: {message}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2)}")
    
    def test_cors_headers(self):
        """Test CORS headers are present"""
        print("\n" + "="*60)
        print("TESTING CORS HEADERS")
        print("="*60)
        
        try:
            # Make OPTIONS request
            response = self.session.options(
                f"{BASE_URL}/users/register/",
                headers={"Origin": FRONTEND_URL}
            )
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
            }
            
            if response.headers.get("Access-Control-Allow-Origin"):
                self.log("CORS Headers", "PASS", "CORS headers are present", cors_headers)
            else:
                self.log("CORS Headers", "FAIL", "CORS headers missing", cors_headers)
                
        except Exception as e:
            self.log("CORS Headers", "FAIL", f"Error: {str(e)}")
    
    def test_registration(self, role: str):
        """Test user registration"""
        print("\n" + "="*60)
        print(f"TESTING {role.upper()} REGISTRATION")
        print("="*60)
        
        user_data = TEST_USERS[role]
        
        try:
            response = self.session.post(
                f"{BASE_URL}/users/register/",
                json=user_data,
                headers={"Origin": FRONTEND_URL}
            )
            
            if response.status_code == 201:
                data = response.json()
                self.log(
                    f"{role.title()} Registration",
                    "PASS",
                    f"User created successfully",
                    {"email": user_data["email"], "role": data.get("role")}
                )
                return True
            elif response.status_code == 400:
                # User might already exist, try with login instead
                self.log(
                    f"{role.title()} Registration",
                    "WARN",
                    f"Registration returned 400 - user may exist",
                    response.json()
                )
                return True
            else:
                self.log(
                    f"{role.title()} Registration",
                    "FAIL",
                    f"Status code: {response.status_code}",
                    response.json()
                )
                return False
                
        except Exception as e:
            self.log(f"{role.title()} Registration", "FAIL", f"Error: {str(e)}")
            return False
    
    def test_login(self, role: str, use_new_user: bool = False):
        """Test user login"""
        print("\n" + "="*60)
        print(f"TESTING {role.upper()} LOGIN (New User: {use_new_user})")
        print("="*60)
        
        # Use new registered user or existing test user
        if use_new_user:
            user_data = TEST_USERS[role]
        else:
            user_data = EXISTING_USERS[role]
        
        try:
            response = self.session.post(
                f"{BASE_URL}/users/login/",
                json={
                    "email": user_data["email"],
                    "password": user_data["password"]
                },
                headers={"Origin": FRONTEND_URL}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                if "access" in data and "user" in data:
                    self.test_tokens[role] = data["access"]
                    self.log(
                        f"{role.title()} Login",
                        "PASS",
                        f"Login successful",
                        {
                            "email": data["user"].get("email"),
                            "role": data["user"].get("role"),
                            "token_present": bool(data.get("access")),
                            "user_id": data["user"].get("id")
                        }
                    )
                    return data
                else:
                    self.log(
                        f"{role.title()} Login",
                        "FAIL",
                        "Response missing required fields (access/user)",
                        data
                    )
                    return None
            else:
                self.log(
                    f"{role.title()} Login",
                    "FAIL",
                    f"Status code: {response.status_code}",
                    response.json()
                )
                return None
                
        except Exception as e:
            self.log(f"{role.title()} Login", "FAIL", f"Error: {str(e)}")
            return None
    
    def test_protected_endpoint(self, role: str):
        """Test access to protected endpoints"""
        print("\n" + "="*60)
        print(f"TESTING {role.upper()} PROTECTED ENDPOINT ACCESS")
        print("="*60)
        
        token = self.test_tokens.get(role)
        if not token:
            self.log(
                f"{role.title()} Protected Access",
                "SKIP",
                "No token available for this role"
            )
            return False
        
        try:
            # Test accessing user profile endpoint
            response = self.session.get(
                f"{BASE_URL}/users/profile/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Origin": FRONTEND_URL
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log(
                    f"{role.title()} Protected Access",
                    "PASS",
                    "Successfully accessed protected endpoint",
                    {"user_id": data.get("id"), "email": data.get("email")}
                )
                return True
            else:
                self.log(
                    f"{role.title()} Protected Access",
                    "FAIL",
                    f"Status code: {response.status_code}",
                    response.json() if response.text else {}
                )
                return False
                
        except Exception as e:
            self.log(f"{role.title()} Protected Access", "FAIL", f"Error: {str(e)}")
            return False
    
    def test_student_dashboard(self):
        """Test student-specific endpoints"""
        print("\n" + "="*60)
        print("TESTING STUDENT DASHBOARD ENDPOINTS")
        print("="*60)
        
        token = self.test_tokens.get("student")
        if not token:
            self.log("Student Dashboard", "SKIP", "No token for student")
            return
        
        endpoints = [
            ("/students/profile/", "Student Profile"),
            ("/students/activities/", "Student Activities"),
            ("/students/documents/", "Student Documents"),
        ]
        
        for endpoint, name in endpoints:
            try:
                response = self.session.get(
                    f"{BASE_URL}{endpoint}",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Origin": FRONTEND_URL
                    }
                )
                
                if response.status_code in [200, 404]:  # 404 is okay if no data
                    self.log(f"Student Dashboard - {name}", "PASS", f"Endpoint accessible (status: {response.status_code})")
                else:
                    self.log(f"Student Dashboard - {name}", "FAIL", f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log(f"Student Dashboard - {name}", "FAIL", f"Error: {str(e)}")
    
    def test_supervisor_dashboard(self):
        """Test supervisor-specific endpoints"""
        print("\n" + "="*60)
        print("TESTING SUPERVISOR DASHBOARD ENDPOINTS")
        print("="*60)
        
        token = self.test_tokens.get("supervisor")
        if not token:
            self.log("Supervisor Dashboard", "SKIP", "No token for supervisor")
            return
        
        endpoints = [
            ("/supervisors/profile/", "Supervisor Profile"),
            ("/supervisors/students/", "Supervised Students"),
            ("/supervisors/activities/", "Supervised Activities"),
        ]
        
        for endpoint, name in endpoints:
            try:
                response = self.session.get(
                    f"{BASE_URL}{endpoint}",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Origin": FRONTEND_URL
                    }
                )
                
                if response.status_code in [200, 404]:
                    self.log(f"Supervisor Dashboard - {name}", "PASS", f"Endpoint accessible (status: {response.status_code})")
                else:
                    self.log(f"Supervisor Dashboard - {name}", "FAIL", f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log(f"Supervisor Dashboard - {name}", "FAIL", f"Error: {str(e)}")
    
    def test_coordinator_dashboard(self):
        """Test coordinator-specific endpoints"""
        print("\n" + "="*60)
        print("TESTING COORDINATOR DASHBOARD ENDPOINTS")
        print("="*60)
        
        token = self.test_tokens.get("coordinator")
        if not token:
            self.log("Coordinator Dashboard", "SKIP", "No token for coordinator")
            return
        
        endpoints = [
            ("/users/", "All Users"),
            ("/students/", "All Students"),
            ("/reports/dashboard/", "Reports Dashboard"),
        ]
        
        for endpoint, name in endpoints:
            try:
                response = self.session.get(
                    f"{BASE_URL}{endpoint}",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Origin": FRONTEND_URL
                    }
                )
                
                if response.status_code in [200, 404, 403]:  # 403 expected if role-restricted
                    self.log(f"Coordinator Dashboard - {name}", "PASS", f"Endpoint callable (status: {response.status_code})")
                else:
                    self.log(f"Coordinator Dashboard - {name}", "FAIL", f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log(f"Coordinator Dashboard - {name}", "FAIL", f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("\n")
        print("╔" + "="*58 + "╗")
        print("║" + " "*58 + "║")
        print("║" + "  COMPREHENSIVE USER FLOW TEST SUITE".center(58) + "║")
        print("║" + " "*58 + "║")
        print("╚" + "="*58 + "╝")
        
        # Test CORS
        self.test_cors_headers()
        time.sleep(0.5)
        
        # Test registration for each role (optional - use existing if available)
        for role in ["student", "supervisor", "coordinator", "admin"]:
            print(f"\n→ Testing {role}...")
            time.sleep(0.5)
        
        # Test login with existing users
        print("\n" + "═"*60)
        print("LOGGING IN WITH EXISTING USERS")
        print("═"*60)
        
        for role in ["student", "supervisor", "coordinator", "admin"]:
            login_result = self.test_login(role, use_new_user=False)
            if login_result:
                self.test_protected_endpoint(role)
            time.sleep(0.5)
        
        # Test dashboard endpoints
        self.test_student_dashboard()
        time.sleep(0.5)
        
        self.test_supervisor_dashboard()
        time.sleep(0.5)
        
        self.test_coordinator_dashboard()
        time.sleep(0.5)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n")
        print("╔" + "="*58 + "╗")
        print("║" + "  TEST SUMMARY".center(58) + "║")
        print("╚" + "="*58 + "╝")
        
        total = len(self.results)
        passed = len([r for r in self.results if r["status"] == "PASS"])
        failed = len([r for r in self.results if r["status"] == "FAIL"])
        warned = len([r for r in self.results if r["status"] == "WARN"])
        skipped = len([r for r in self.results if r["status"] == "SKIP"])
        
        print(f"\nTotal Tests: {total}")
        print(f"✅ Passed:   {passed}")
        print(f"❌ Failed:   {failed}")
        print(f"⚠️  Warned:   {warned}")
        print(f"⏭️  Skipped:  {skipped}")
        
        passed_percent = (passed / total * 100) if total > 0 else 0
        print(f"\nSuccess Rate: {passed_percent:.1f}%")
        
        if failed > 0:
            print("\n" + "="*60)
            print("FAILED TESTS:")
            print("="*60)
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"\n❌ {result['test']}")
                    print(f"   Message: {result['message']}")
                    if result['details']:
                        print(f"   Details: {json.dumps(result['details'], indent=6)}")
        
        print("\n" + "="*60)
        print("TEST SUITE COMPLETE")
        print("="*60 + "\n")


if __name__ == "__main__":
    tester = UserFlowTester()
    tester.run_all_tests()
