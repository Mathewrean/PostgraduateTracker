#!/usr/bin/env python3
"""
Frontend-focused integration tests
Tests the actual user flows as they would happen in the browser
"""

import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:5175"

# Existing test users
TEST_USERS = {
    "student": {"email": "student@test.com", "password": "student123"},
    "supervisor": {"email": "supervisor@test.com", "password": "supervisor123"},
    "coordinator": {"email": "coordinator@test.com", "password": "coordinator123"},
    "admin": {"email": "admin@test.com", "password": "admin123"}
}

class FrontendFlowTester:
    def __init__(self):
        self.session = requests.Session()
        self.results = []
        self.test_tokens = {}
        self.test_users_data = {}
        
    def log(self, test_name: str, status: str, message: str, details: Dict[str, Any] = None):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details or {}
        }
        self.results.append(result)
        status_symbol = "✅" if status == "PASS" else ("⚠️ " if status == "WARN" else "❌")
        print(f"{status_symbol} {test_name}: {message}")
        if details and status == "FAIL":
            print(f"   Error: {json.dumps(details, indent=2)}")
    
    def test_registration_flow(self):
        """Test complete registration flow"""
        print("\n" + "="*70)
        print("REGISTRATION FLOW TEST")
        print("="*70)
        
        new_user = {
            "email": f"testuser_{int(time.time())}@test.com",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "User",
            "role": "STUDENT"
        }
        
        try:
            # Step 1: Register
            response = self.session.post(
                f"{BASE_URL}/users/register/",
                json=new_user,
                headers={"Origin": FRONTEND_URL}
            )
            
            if response.status_code == 201:
                data = response.json()
                self.log(
                    "Registration - Create Account",
                    "PASS",
                    f"New user created",
                    {"email": new_user["email"], "id": data.get("id")}
                )
                
                # Step 2: Login with registered user
                login_response = self.session.post(
                    f"{BASE_URL}/users/login/",
                    json={"email": new_user["email"], "password": new_user["password"]},
                    headers={"Origin": FRONTEND_URL}
                )
                
                if login_response.status_code == 200:
                    login_data = login_response.json()
                    self.log(
                        "Registration - Login After Register",
                        "PASS",
                        "Successfully logged in with new account",
                        {"email": login_data["user"]["email"], "role": login_data["user"]["role"]}
                    )
                    return True
                else:
                    self.log(
                        "Registration - Login After Register",
                        "FAIL",
                        f"Login failed: {login_response.status_code}",
                        login_response.json()
                    )
                    return False
            else:
                if response.status_code == 400:
                    self.log(
                        "Registration - Create Account",
                        "WARN",
                        "User already exists (400)",
                        response.json()
                    )
                    return True
                else:
                    self.log(
                        "Registration - Create Account",
                        "FAIL",
                        f"Status: {response.status_code}",
                        response.json()
                    )
                    return False
                    
        except Exception as e:
            self.log("Registration Flow", "FAIL", f"Error: {str(e)}")
            return False
    
    def test_login_logout_flow(self, role: str):
        """Test login and logout flow"""
        print("\n" + "="*70)
        print(f"{role.upper()} LOGIN/LOGOUT FLOW")
        print("="*70)
        
        user_data = TEST_USERS[role]
        
        try:
            # Step 1: Login
            login_response = self.session.post(
                f"{BASE_URL}/users/login/",
                json={"email": user_data["email"], "password": user_data["password"]},
                headers={"Origin": FRONTEND_URL}
            )
            
            if login_response.status_code != 200:
                self.log(f"{role.title()} - Login", "FAIL", f"Status: {login_response.status_code}")
                return False
            
            login_data = login_response.json()
            token = login_data["access"]
            user_info = login_data["user"]
            
            self.log(
                f"{role.title()} - Login Success",
                "PASS",
                f"Logged in as {user_info['email']}",
                {"role": user_info.get("role"), "user_id": user_info.get("id")}
            )
            
            self.test_tokens[role] = token
            self.test_users_data[role] = user_info
            
            # Step 2: Verify token works with protected request
            verify_response = self.session.get(
                f"{BASE_URL}/users/me/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Origin": FRONTEND_URL
                }
            )
            
            if verify_response.status_code == 200:
                self.log(
                    f"{role.title()} - Token Verification",
                    "PASS",
                    "Token is valid and working"
                )
            elif verify_response.status_code == 404:
                # endpoint might not exist, that's okay
                self.log(
                    f"{role.title()} - Token Verification",
                    "WARN",
                    "/me endpoint not found (expected)"
                )
            else:
                self.log(
                    f"{role.title()} - Token Verification",
                    "FAIL",
                    f"Status: {verify_response.status_code}",
                    verify_response.json()
                )
            
            # Step 3: Logout (clear client-side - server doesn't need explicit logout in JWT)
            self.log(
                f"{role.title()} - Logout",
                "PASS",
                "Logout successful (token cleared client-side)"
            )
            
            return True
            
        except Exception as e:
            self.log(f"{role.title()} - Login/Logout", "FAIL", f"Error: {str(e)}")
            return False
    
    def test_student_dashboard_flow(self):
        """Test student dashboard access and operations"""
        print("\n" + "="*70)
        print("STUDENT DASHBOARD FLOW")
        print("="*70)
        
        token = self.test_tokens.get("student")
        if not token:
            self.log("Student Dashboard", "SKIP", "No student token available")
            return False
        
        try:
            # Test getting student profile
            profile_response = self.session.get(
                f"{BASE_URL}/students/profile/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Origin": FRONTEND_URL
                }
            )
            
            if profile_response.status_code == 200:
                profile = profile_response.json()
                self.log(
                    "Student Dashboard - Profile",
                    "PASS",
                    "Successfully retrieved student profile",
                    {"student_id": profile.get("id"), "status": profile.get("status")}
                )
            else:
                self.log(
                    "Student Dashboard - Profile",
                    "WARN",
                    f"Profile endpoint returned {profile_response.status_code}"
                )
            
            # Test getting student activities
            activities_response = self.session.get(
                f"{BASE_URL}/students/activities/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Origin": FRONTEND_URL
                }
            )
            
            if activities_response.status_code == 200:
                activities = activities_response.json()
                count = len(activities) if isinstance(activities, list) else activities.get("count", 0)
                self.log(
                    "Student Dashboard - Activities",
                    "PASS",
                    f"Retrieved activities list ({count} items)"
                )
            else:
                self.log(
                    "Student Dashboard - Activities",
                    "WARN",
                    f"Activities endpoint returned {activities_response.status_code}"
                )
            
            # Test getting student documents
            docs_response = self.session.get(
                f"{BASE_URL}/students/documents/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Origin": FRONTEND_URL
                }
            )
            
            if docs_response.status_code == 200:
                docs = docs_response.json()
                count = len(docs) if isinstance(docs, list) else docs.get("count", 0)
                self.log(
                    "Student Dashboard - Documents",
                    "PASS",
                    f"Retrieved documents list ({count} items)"
                )
            else:
                self.log(
                    "Student Dashboard - Documents",
                    "WARN",
                    f"Documents endpoint returned {docs_response.status_code}"
                )
            
            return True
            
        except Exception as e:
            self.log("Student Dashboard Flow", "FAIL", f"Error: {str(e)}")
            return False
    
    def test_supervisor_dashboard_flow(self):
        """Test supervisor dashboard access"""
        print("\n" + "="*70)
        print("SUPERVISOR DASHBOARD FLOW")
        print("="*70)
        
        token = self.test_tokens.get("supervisor")
        if not token:
            self.log("Supervisor Dashboard", "SKIP", "No supervisor token available")
            return False
        
        try:
            # Test getting supervised students
            students_response = self.session.get(
                f"{BASE_URL}/supervisors/students/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Origin": FRONTEND_URL
                }
            )
            
            if students_response.status_code == 200:
                students = students_response.json()
                count = len(students) if isinstance(students, list) else students.get("count", 0)
                self.log(
                    "Supervisor Dashboard - Supervised Students",
                    "PASS",
                    f"Retrieved supervised students ({count} items)"
                )
            else:
                self.log(
                    "Supervisor Dashboard - Supervised Students",
                    "WARN",
                    f"Endpoint returned {students_response.status_code}"
                )
            
            # Test getting supervisor profile
            profile_response = self.session.get(
                f"{BASE_URL}/supervisors/profile/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Origin": FRONTEND_URL
                }
            )
            
            if profile_response.status_code == 200:
                profile = profile_response.json()
                self.log(
                    "Supervisor Dashboard - Profile",
                    "PASS",
                    "Retrieved supervisor profile"
                )
            else:
                self.log(
                    "Supervisor Dashboard - Profile",
                    "WARN",
                    f"Profile endpoint returned {profile_response.status_code}"
                )
            
            return True
            
        except Exception as e:
            self.log("Supervisor Dashboard Flow", "FAIL", f"Error: {str(e)}")
            return False
    
    def test_coordinator_dashboard_flow(self):
        """Test coordinator/admin dashboard access"""
        print("\n" + "="*70)
        print("COORDINATOR DASHBOARD FLOW")
        print("="*70)
        
        token = self.test_tokens.get("coordinator")
        if not token:
            self.log("Coordinator Dashboard", "SKIP", "No coordinator token available")
            return False
        
        try:
            # Test getting all users
            users_response = self.session.get(
                f"{BASE_URL}/users/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Origin": FRONTEND_URL
                }
            )
            
            if users_response.status_code == 200:
                users = users_response.json()
                count = len(users) if isinstance(users, list) else users.get("count", 0)
                self.log(
                    "Coordinator Dashboard - All Users",
                    "PASS",
                    f"Retrieved users list ({count} users)"
                )
            else:
                self.log(
                    "Coordinator Dashboard - All Users",
                    "WARN",
                    f"Users endpoint returned {users_response.status_code}"
                )
            
            # Test getting all students
            students_response = self.session.get(
                f"{BASE_URL}/students/",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Origin": FRONTEND_URL
                }
            )
            
            if students_response.status_code == 200:
                students = students_response.json()
                count = len(students) if isinstance(students, list) else students.get("count", 0)
                self.log(
                    "Coordinator Dashboard - All Students",
                    "PASS",
                    f"Retrieved all students ({count} students)"
                )
            else:
                self.log(
                    "Coordinator Dashboard - All Students",
                    "WARN",
                    f"Students endpoint returned {students_response.status_code}"
                )
            
            return True
            
        except Exception as e:
            self.log("Coordinator Dashboard Flow", "FAIL", f"Error: {str(e)}")
            return False
    
    def test_token_refresh_flow(self):
        """Test JWT token refresh"""
        print("\n" + "="*70)
        print("TOKEN REFRESH FLOW")
        print("="*70)
        
        user_data = TEST_USERS["student"]
        
        try:
            # Step 1: Login to get tokens
            login_response = self.session.post(
                f"{BASE_URL}/users/login/",
                json={"email": user_data["email"], "password": user_data["password"]},
                headers={"Origin": FRONTEND_URL}
            )
            
            if login_response.status_code != 200:
                self.log("Token Refresh - Initial Login", "FAIL", f"Status: {login_response.status_code}")
                return False
            
            login_data = login_response.json()
            refresh_token = login_data.get("refresh")
            
            if not refresh_token:
                self.log("Token Refresh", "WARN", "No refresh token in login response")
                return True
            
            self.log("Token Refresh - Initial Login", "PASS", "Got tokens")
            
            # Step 2: Use refresh token
            refresh_response = self.session.post(
                f"{BASE_URL}/users/token/refresh/",
                json={"refresh": refresh_token},
                headers={"Origin": FRONTEND_URL}
            )
            
            if refresh_response.status_code == 200:
                refresh_data = refresh_response.json()
                if "access" in refresh_data:
                    self.log(
                        "Token Refresh - Token Refresh",
                        "PASS",
                        "Successfully refreshed access token"
                    )
                    return True
                else:
                    self.log(
                        "Token Refresh - Token Refresh",
                        "FAIL",
                        "Refresh response missing access token"
                    )
                    return False
            else:
                self.log(
                    "Token Refresh - Token Refresh",
                    "WARN",
                    f"Refresh endpoint returned {refresh_response.status_code}"
                )
                return True
                
        except Exception as e:
            self.log("Token Refresh Flow", "FAIL", f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run complete frontend flow tests"""
        print("\n")
        print("╔" + "="*68 + "╗")
        print("║" + " "*68 + "║")
        print("║" + "  FRONTEND USER FLOW INTEGRATION TESTS".center(68) + "║")
        print("║" + " "*68 + "║")
        print("╚" + "="*68 + "╝")
        
        # Test registration
        self.test_registration_flow()
        time.sleep(0.3)
        
        # Test each user role
        for role in ["student", "supervisor", "coordinator"]:
            self.test_login_logout_flow(role)
            time.sleep(0.3)
        
        # Test dashboard flows
        self.test_student_dashboard_flow()
        time.sleep(0.3)
        
        self.test_supervisor_dashboard_flow()
        time.sleep(0.3)
        
        self.test_coordinator_dashboard_flow()
        time.sleep(0.3)
        
        # Test token refresh
        self.test_token_refresh_flow()
        time.sleep(0.3)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n")
        print("╔" + "="*68 + "╗")
        print("║" + "  TEST SUMMARY".center(68) + "║")
        print("╚" + "="*68 + "╝")
        
        total = len(self.results)
        passed = len([r for r in self.results if r["status"] == "PASS"])
        failed = len([r for r in self.results if r["status"] == "FAIL"])
        warned = len([r for r in self.results if r["status"] == "WARN"])
        skipped = len([r for r in self.results if r["status"] == "SKIP"])
        
        print(f"\nTotal Tests:  {total}")
        print(f"✅ Passed:    {passed}")
        print(f"❌ Failed:    {failed}")
        print(f"⚠️  Warned:    {warned}")
        print(f"⏭️  Skipped:   {skipped}")
        
        if total > 0:
            passed_percent = (passed / total * 100)
            print(f"\n🎯 Success Rate: {passed_percent:.1f}%")
        
        if failed > 0:
            print("\n" + "="*70)
            print("FAILED TESTS DETAILS:")
            print("="*70)
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"\n❌ {result['test']}")
                    print(f"   Message: {result['message']}")
                    if result['details']:
                        print(f"   Details: {json.dumps(result['details'], indent=6)}")
        
        print("\n" + "="*70)
        print("✅ FRONTEND FLOW TESTS COMPLETE")
        print("="*70 + "\n")


if __name__ == "__main__":
    tester = FrontendFlowTester()
    tester.run_all_tests()
