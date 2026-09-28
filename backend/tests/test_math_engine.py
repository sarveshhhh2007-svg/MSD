"""
Unit Tests for Deterministic Math Engine
Validates all requirements and test cases specified in Section 49 of Master Prompt.
"""

import unittest
from backend.app.math_engine import (
    calculate_current_attendance,
    calculate_required_classes,
    calculate_safe_absences,
    calculate_max_possible_attendance,
    get_subject_status,
    calculate_multi_target_analysis
)


class TestAttendanceMathEngine(unittest.TestCase):
    
    def test_case_1(self):
        """
        Test Case 1 (Section 49):
        A=80, C=100, R=20, T=.75
        -> required = 0
        -> safe absences = 10
        -> max = 83.3333%
        """
        A, C, R, T = 80, 100, 20, 0.75
        req_res = calculate_required_classes(A, C, R, T)
        safe = calculate_safe_absences(A, C, R, T)
        max_att = calculate_max_possible_attendance(A, C, R)
        
        self.assertEqual(req_res["required"], 0)
        self.assertEqual(safe, 10)
        self.assertAlmostEqual(max_att, 83.3333, places=3)
        self.assertTrue(req_res["is_possible"])
        self.assertFalse(req_res["is_irreversible"])
        
    def test_case_2(self):
        """
        Test Case 2 (Section 49):
        A=70, C=100, R=30, T=.75
        -> required = 28
        -> safe absences = 2
        -> max = 76.9231%
        """
        A, C, R, T = 70, 100, 30, 0.75
        req_res = calculate_required_classes(A, C, R, T)
        safe = calculate_safe_absences(A, C, R, T)
        max_att = calculate_max_possible_attendance(A, C, R)
        
        self.assertEqual(req_res["required"], 28)
        self.assertEqual(safe, 2)
        self.assertAlmostEqual(max_att, 76.9231, places=3)
        self.assertTrue(req_res["is_possible"])
        self.assertFalse(req_res["is_irreversible"])
        
    def test_case_3(self):
        """
        Test Case 3 (Section 49):
        A=60, C=100, R=20, T=.75
        -> required = 30
        -> impossible
        -> max = 66.6667%
        -> irreversible = true
        """
        A, C, R, T = 60, 100, 20, 0.75
        req_res = calculate_required_classes(A, C, R, T)
        max_att = calculate_max_possible_attendance(A, C, R)
        
        self.assertEqual(req_res["required"], 30)
        self.assertFalse(req_res["is_possible"])
        self.assertTrue(req_res["is_irreversible"])
        self.assertAlmostEqual(max_att, 66.6667, places=3)
        
    def test_case_4(self):
        """
        Test Case 4 (Section 49):
        A=70, C=100, R=20, T=.75
        -> required = 20
        -> safe absences = 0
        -> max = 75%
        -> recoverable = true
        """
        A, C, R, T = 70, 100, 20, 0.75
        req_res = calculate_required_classes(A, C, R, T)
        safe = calculate_safe_absences(A, C, R, T)
        max_att = calculate_max_possible_attendance(A, C, R)
        
        self.assertEqual(req_res["required"], 20)
        self.assertEqual(safe, 0)
        self.assertAlmostEqual(max_att, 75.0, places=2)
        self.assertTrue(req_res["is_possible"])
        self.assertFalse(req_res["is_irreversible"])
        
    def test_case_5(self):
        """
        Test Case 5 (Section 49):
        A=80, C=100, R=20, T=.90
        -> required = 28
        -> impossible
        -> max = 83.3333%
        """
        A, C, R, T = 80, 100, 20, 0.90
        req_res = calculate_required_classes(A, C, R, T)
        max_att = calculate_max_possible_attendance(A, C, R)
        
        self.assertEqual(req_res["required"], 28)
        self.assertFalse(req_res["is_possible"])
        self.assertTrue(req_res["is_irreversible"])
        self.assertAlmostEqual(max_att, 83.3333, places=3)

    def test_edge_cases(self):
        # C = 0: Attendance should be None (undefined), not 0%
        curr = calculate_current_attendance(0, 0)
        self.assertIsNone(curr)
        
        # A > C must raise ValueError
        with self.assertRaises(ValueError):
            calculate_current_attendance(10, 5)
            
        # Negative values must raise ValueError
        with self.assertRaises(ValueError):
            calculate_current_attendance(-1, 10)
            
        # A = 0, C = 10
        curr_zero = calculate_current_attendance(0, 10)
        self.assertEqual(curr_zero, 0.0)
        
        # A = C = 50
        curr_full = calculate_current_attendance(50, 50)
        self.assertEqual(curr_full, 100.0)

    def test_status_classifications(self):
        # SAFE
        s_safe = get_subject_status(47, 50, 20, 0.75)
        self.assertEqual(s_safe["status"], "SAFE")
        
        # WATCH (Safe absence <= 1)
        s_watch = get_subject_status(75, 100, 4, 0.75)
        # Total = 104, 75% of 104 = 78. Safe absences = 75 + 4 - 78 = 1 <= 1 -> WATCH
        self.assertEqual(s_watch["status"], "WATCH")
        
        # CRITICAL (Below target but recoverable)
        s_crit = get_subject_status(70, 100, 20, 0.75)
        self.assertEqual(s_crit["status"], "CRITICAL")
        
        # IRREVERSIBLE
        s_irrev = get_subject_status(60, 100, 20, 0.75)
        self.assertEqual(s_irrev["status"], "IRREVERSIBLE")


if __name__ == "__main__":
    unittest.main()
