import unittest
from triangle_checker import is_valid_triangle, triangle_type

class TestTriangleChecker(unittest.TestCase):

    def test_valid_triangle(self):
        """Test that three sides form a valid triangle."""
        self.assertTrue(is_valid_triangle(3, 4, 5))
        self.assertTrue(is_valid_triangle(5, 5, 5))
        self.assertTrue(is_valid_triangle(2, 3, 4))

    def test_scalene_triangle(self):
        """Test that a scalene triangle is correctly identified."""
        self.assertEqual(triangle_type(3, 4, 5), "Scalene")
        self.assertEqual(triangle_type(5, 6, 7), "Scalene")

    def test_scalene_triangle_all_orders(self):
        """Test that scalene triangle type is recognized regardless of side order."""
        # All permutations of sides 3, 4, 5
        self.assertEqual(triangle_type(3, 4, 5), "Scalene")
        self.assertEqual(triangle_type(3, 5, 4), "Scalene")
        self.assertEqual(triangle_type(4, 3, 5), "Scalene")
        self.assertEqual(triangle_type(4, 5, 3), "Scalene")
        self.assertEqual(triangle_type(5, 3, 4), "Scalene")
        self.assertEqual(triangle_type(5, 4, 3), "Scalene")

    def test_zero_length_side(self):
        """Test that a triangle with zero-length side is invalid."""
        self.assertFalse(is_valid_triangle(0, 4, 5))
        self.assertFalse(is_valid_triangle(3, 0, 5))
        self.assertFalse(is_valid_triangle(3, 4, 0))

    def test_invalid_triangle(self):
        """Test that sides that don't satisfy triangle inequality are invalid."""
        self.assertFalse(is_valid_triangle(1, 2, 10))
        self.assertFalse(is_valid_triangle(1, 10, 2))
        self.assertFalse(is_valid_triangle(10, 1, 2))

    def test_equilateral_triangle(self):
        """Test that an equilateral triangle is correctly identified."""
        self.assertEqual(triangle_type(5, 5, 5), "Equilateral")
        self.assertEqual(triangle_type(10, 10, 10), "Equilateral")

    def test_isosceles_triangle(self):
        """Test that an isosceles triangle is correctly identified."""
        self.assertEqual(triangle_type(5, 5, 3), "Isosceles")
        self.assertEqual(triangle_type(5, 3, 5), "Isosceles")
        self.assertEqual(triangle_type(3, 5, 5), "Isosceles")

if __name__ == '__main__':
    unittest.main()