def is_valid_triangle(a, b, c):
    """
    Check if three sides can form a valid triangle.
    A triangle is valid if the sum of any two sides is greater than the third side.
    Also checks that all sides are positive numbers.
    """
    if not all(isinstance(x, (int, float)) for x in [a, b, c]):
        raise ValueError("All sides must be numbers")
    if a <= 0 or b <= 0 or c <= 0:
        return False
    return a + b > c and a + c > b and b + c > a

def triangle_type(a, b, c):
    """
    Determine the type of triangle based on side lengths.
    - Equilateral: all sides equal
    - Isosceles: at least two sides equal
    - Scalene: all sides different
    """
    if not all(isinstance(x, (int, float)) for x in [a, b, c]):
        raise ValueError("All sides must be numbers")
    if a == b == c:
        return "Equilateral"
    elif a == b or b == c or a == c:
        return "Isosceles"
    else:
        return "Scalene"

def main():
    try:
        a = float(input("Enter the length of side a: "))
        b = float(input("Enter the length of side b: "))
        c = float(input("Enter the length of side c: "))
        
        if is_valid_triangle(a, b, c):
            print("The sides form a valid triangle.")
            print("Triangle type:", triangle_type(a, b, c))
        else:
            print("The sides do not form a valid triangle.")
    except ValueError:
        print("Invalid input. Please enter numeric values for the sides.")

if __name__ == "__main__":
    main()