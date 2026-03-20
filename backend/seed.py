"""
Comprehensive seed data for JLearn: Java Basics, Control Statements, and OOP.
Each question has multiple test cases for output-based judging.
"""
import models


def get_topics():
    return [
        models.Topic(id="t1", title="Java Basics", description="Variables, Data Types, Operators, Type Casting, and I/O", difficulty="Beginner", total_lessons=3, total_questions=8, order=1, progress=0),
        models.Topic(id="t2", title="Control Statements", description="If-Else, Loops, Switch, Ternary, Nested Loops, and Patterns", difficulty="Beginner", total_lessons=2, total_questions=10, order=2, progress=0),
        models.Topic(id="t3", title="Object-Oriented Programming", description="Classes, Objects, Constructors, Inheritance, Polymorphism, Abstraction, Encapsulation, Interfaces", difficulty="Intermediate", total_lessons=4, total_questions=12, order=3, progress=0),
        models.Topic(id="t4", title="Collections Framework", description="ArrayList, HashMap, HashSet, Iterator Patterns", difficulty="Intermediate", total_lessons=3, total_questions=4, order=4, progress=0),
        models.Topic(id="t5", title="Exception Handling", description="Try-Catch, Custom Exceptions, Finally Blocks", difficulty="Intermediate", total_lessons=2, total_questions=3, order=5, progress=0),
        models.Topic(id="t6", title="File Handling & I/O", description="BufferedReader, Streams API, Functional Processing", difficulty="Advanced", total_lessons=2, total_questions=3, order=6, progress=0),
    ]


def get_questions():
    return [
        # ═══════════════════════ JAVA BASICS (t1) ═══════════════════════
        models.Question(id="q1", topic_id="t1", title="Print Hello World", difficulty="Easy",
            problem_statement="Write a Java program that prints exactly 'Hello World' (without quotes) to the standard output.",
            input_format="None", output_format="Hello World",
            sample_input="", sample_output="Hello World"),

        models.Question(id="q2", topic_id="t1", title="Sum of Two Numbers", difficulty="Easy",
            problem_statement="Read two integers from standard input (one per line) and print their sum.",
            input_format="Two integers, one per line", output_format="A single integer — their sum",
            sample_input="3\n5", sample_output="8"),

        models.Question(id="q3", topic_id="t1", title="Swap Two Variables", difficulty="Easy",
            problem_statement="Read two integers from standard input. Print them in swapped order on separate lines.",
            input_format="Two integers, one per line", output_format="Two integers swapped, one per line",
            sample_input="10\n20", sample_output="20\n10"),

        models.Question(id="q4", topic_id="t1", title="Area of Circle", difficulty="Easy",
            problem_statement="Read a double value representing the radius of a circle. Print the area rounded to 2 decimal places. Use Math.PI.",
            input_format="A single double (radius)", output_format="Area rounded to 2 decimal places",
            sample_input="5.0", sample_output="78.54"),

        models.Question(id="q5", topic_id="t1", title="Data Type Sizes", difficulty="Easy",
            problem_statement="Print the size (in bytes) of int, double, char, and boolean in Java, one per line in the format: 'type: N bytes'.",
            input_format="None", output_format="Four lines with type sizes",
            sample_input="", sample_output="int: 4 bytes\ndouble: 8 bytes\nchar: 2 bytes\nboolean: 1 bytes"),

        models.Question(id="q6", topic_id="t1", title="Temperature Converter", difficulty="Easy",
            problem_statement="Read a temperature in Celsius (double). Print the Fahrenheit equivalent rounded to 1 decimal place. Formula: F = C * 9/5 + 32.",
            input_format="A single double (Celsius)", output_format="Fahrenheit to 1 decimal place",
            sample_input="100.0", sample_output="212.0"),

        models.Question(id="q7", topic_id="t1", title="Max of Three Numbers", difficulty="Easy",
            problem_statement="Read three integers (one per line) and print the largest one.",
            input_format="Three integers, one per line", output_format="The largest integer",
            sample_input="5\n12\n8", sample_output="12"),

        models.Question(id="q8", topic_id="t1", title="ASCII Value of Character", difficulty="Easy",
            problem_statement="Read a single character and print its ASCII value.",
            input_format="A single character", output_format="The ASCII integer value",
            sample_input="A", sample_output="65"),

        # ═══════════════════ CONTROL STATEMENTS (t2) ═══════════════════
        models.Question(id="q9", topic_id="t2", title="Even or Odd", difficulty="Easy",
            problem_statement="Read an integer. Print 'Even' if it is even, 'Odd' otherwise.",
            input_format="A single integer", output_format="Even or Odd",
            sample_input="4", sample_output="Even"),

        models.Question(id="q10", topic_id="t2", title="Leap Year Check", difficulty="Easy",
            problem_statement="Read a year (integer). Print 'Leap' if it is a leap year, 'Not Leap' otherwise. A year is leap if divisible by 4 but not 100, unless also divisible by 400.",
            input_format="A single integer (year)", output_format="Leap or Not Leap",
            sample_input="2024", sample_output="Leap"),

        models.Question(id="q11", topic_id="t2", title="Factorial Calculator", difficulty="Medium",
            problem_statement="Read a non-negative integer N. Print its factorial. Use long for the result.",
            input_format="A single non-negative integer", output_format="Factorial of N",
            sample_input="5", sample_output="120"),

        models.Question(id="q12", topic_id="t2", title="Is Prime Number", difficulty="Medium",
            problem_statement="Read an integer N. Print 'Prime' if it is a prime number, 'Not Prime' otherwise.",
            input_format="A single integer N (N >= 1)", output_format="Prime or Not Prime",
            sample_input="7", sample_output="Prime"),

        models.Question(id="q13", topic_id="t2", title="FizzBuzz", difficulty="Easy",
            problem_statement="Read an integer N. Print numbers from 1 to N, each on a new line. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', for multiples of both print 'FizzBuzz'.",
            input_format="A single integer N", output_format="FizzBuzz sequence, one per line",
            sample_input="5", sample_output="1\n2\nFizz\n4\nBuzz"),

        models.Question(id="q14", topic_id="t2", title="Reverse a Number", difficulty="Medium",
            problem_statement="Read an integer. Print its digits in reverse order. For negative numbers, keep the negative sign at front.",
            input_format="A single integer", output_format="The reversed number",
            sample_input="12345", sample_output="54321"),

        models.Question(id="q15", topic_id="t2", title="Multiplication Table", difficulty="Easy",
            problem_statement="Read an integer N. Print its multiplication table from 1 to 10. Format: 'N x i = result' on each line.",
            input_format="A single integer N", output_format="10 lines of multiplication table",
            sample_input="5", sample_output="5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50"),

        models.Question(id="q16", topic_id="t2", title="Sum of Digits", difficulty="Medium",
            problem_statement="Read a positive integer. Print the sum of its digits.",
            input_format="A single positive integer", output_format="Sum of all digits",
            sample_input="1234", sample_output="10"),

        models.Question(id="q17", topic_id="t2", title="Right Triangle Pattern", difficulty="Medium",
            problem_statement="Read an integer N. Print a right-angled triangle pattern of stars (*). Row i should have i stars.",
            input_format="A single integer N (rows)", output_format="Star pattern",
            sample_input="4", sample_output="*\n**\n***\n****"),

        models.Question(id="q18", topic_id="t2", title="Fibonacci Series", difficulty="Medium",
            problem_statement="Read an integer N. Print the first N Fibonacci numbers separated by spaces. Start with 0, 1.",
            input_format="A single integer N", output_format="First N Fibonacci numbers space-separated",
            sample_input="7", sample_output="0 1 1 2 3 5 8"),

        # ══════════════ OBJECT-ORIENTED PROGRAMMING (t3) ══════════════
        models.Question(id="q19", topic_id="t3", title="Create a Student Class", difficulty="Easy",
            problem_statement="Read a student's name and age (one per line). Create a Student class with these fields and a display() method. Print: 'Name: <name>\\nAge: <age>'.",
            input_format="Name (String) and Age (int), one per line", output_format="Name and age on separate lines",
            sample_input="Alice\n20", sample_output="Name: Alice\nAge: 20"),

        models.Question(id="q20", topic_id="t3", title="Rectangle with Constructor", difficulty="Easy",
            problem_statement="Read length and width (doubles, one per line). Create a Rectangle class with a parameterized constructor. Print area and perimeter each on a new line, formatted to 1 decimal place.",
            input_format="Two doubles (length, width), one per line", output_format="Area and Perimeter on separate lines",
            sample_input="5.0\n3.0", sample_output="Area: 15.0\nPerimeter: 16.0"),

        models.Question(id="q21", topic_id="t3", title="Method Overloading - Calculator", difficulty="Easy",
            problem_statement="Create a Calculator class with overloaded add() methods: add(int,int), add(int,int,int), add(double,double). Read two integers, three integers, and two doubles. Print results, one per line.",
            input_format="Line1: two ints, Line2: three ints, Line3: two doubles", output_format="Three sums, one per line",
            sample_input="3 5\n1 2 3\n2.5 3.5", sample_output="8\n6\n6.0"),

        models.Question(id="q22", topic_id="t3", title="Inheritance: Animal Hierarchy", difficulty="Medium",
            problem_statement="Create an Animal class with a speak() method printing 'Some sound'. Create Dog (prints 'Woof!') and Cat (prints 'Meow!') subclasses overriding speak(). Create one Dog and one Cat, call speak() on each.",
            input_format="None", output_format="Two lines: dog then cat sound",
            sample_input="", sample_output="Woof!\nMeow!"),

        models.Question(id="q23", topic_id="t3", title="Super Keyword Demo", difficulty="Medium",
            problem_statement="Create a Vehicle class with a constructor printing 'Vehicle created'. Create a Car subclass whose constructor calls super() and then prints 'Car created'. Instantiate a Car.",
            input_format="None", output_format="Two lines of constructor messages",
            sample_input="", sample_output="Vehicle created\nCar created"),

        models.Question(id="q24", topic_id="t3", title="Polymorphism: Shape Area", difficulty="Medium",
            problem_statement="Create a Shape class with area() returning 0. Create Circle(double r) and Rectangle(double l, double w) subclasses. Read r, l, w. Using Shape references, print areas formatted to 2 decimal places on separate lines.",
            input_format="Three doubles: radius, length, width", output_format="Two areas on separate lines",
            sample_input="5.0\n4.0\n6.0", sample_output="78.54\n24.00"),

        models.Question(id="q25", topic_id="t3", title="Abstract Class: Employee", difficulty="Medium",
            problem_statement="Create an abstract class Employee with abstract method salary(). Create FullTime(double base) returning base and PartTime(double hourly, int hours) returning hourly*hours. Read base, hourly, hours. Print both salaries formatted to 1 decimal place.",
            input_format="Three values: base(double), hourly(double), hours(int)", output_format="Two salaries on separate lines",
            sample_input="5000.0\n25.0\n80", sample_output="5000.0\n2000.0"),

        models.Question(id="q26", topic_id="t3", title="Interface: Printable", difficulty="Medium",
            problem_statement="Create an interface Printable with method print(). Create Book(String title) and Magazine(String name) implementing it. Book prints 'Book: <title>', Magazine prints 'Magazine: <name>'. Read title and name.",
            input_format="Two strings: title, name (one per line)", output_format="Two lines of output",
            sample_input="Java Guide\nTech Weekly", sample_output="Book: Java Guide\nMagazine: Tech Weekly"),

        models.Question(id="q27", topic_id="t3", title="Encapsulation: BankAccount", difficulty="Medium",
            problem_statement="Create a BankAccount class with private balance. Add deposit(double), withdraw(double), and getBalance() methods. Withdrawal should fail silently if insufficient funds. Read initial balance, deposit amount, and withdrawal amount. Print final balance formatted to 1 decimal place.",
            input_format="Three doubles: initial, deposit, withdrawal", output_format="Final balance",
            sample_input="1000.0\n500.0\n200.0", sample_output="1300.0"),

        models.Question(id="q28", topic_id="t3", title="Static Members: Counter", difficulty="Easy",
            problem_statement="Create a Counter class with a static field count. Constructor should increment count. Create 3 instances and print the count.",
            input_format="None", output_format="The count value",
            sample_input="", sample_output="3"),

        models.Question(id="q29", topic_id="t3", title="this Keyword: Person", difficulty="Easy",
            problem_statement="Create a Person class where constructor params have the same name as fields. Use 'this' to resolve ambiguity. Read name and age. Print 'Name: <name>\\nAge: <age>'.",
            input_format="Name and age, one per line", output_format="Name and age",
            sample_input="Bob\n25", sample_output="Name: Bob\nAge: 25"),

        models.Question(id="q30", topic_id="t3", title="Multiple Inheritance via Interfaces", difficulty="Hard",
            problem_statement="Create interfaces Flyable (fly() prints 'Flying') and Swimmable (swim() prints 'Swimming'). Create Duck implementing both. Call fly() then swim().",
            input_format="None", output_format="Two lines",
            sample_input="", sample_output="Flying\nSwimming"),

        # ═══════════════════ COLLECTIONS FRAMEWORK (t4) ═══════════════════
        models.Question(id="q31", topic_id="t4", title="ArrayList Sort", difficulty="Easy",
            problem_statement="Read an integer N followed by N integers (one per line). Add them all to an ArrayList, sort it, then print each element on a new line.",
            input_format="N on first line, then N integers one per line", output_format="Sorted integers, one per line",
            sample_input="5\n3\n1\n4\n1\n5", sample_output="1\n1\n3\n4\n5"),

        models.Question(id="q32", topic_id="t4", title="HashMap Word Count", difficulty="Medium",
            problem_statement="Read an integer N, then N words (one per line). Use a HashMap to count occurrences of each word. Print each unique word and its count as 'word: count', sorted alphabetically.",
            input_format="N on first line, then N words one per line", output_format="word: count pairs, alphabetically sorted",
            sample_input="5\napple\nbanana\napple\ncherry\nbanana", sample_output="apple: 2\nbanana: 2\ncherry: 1"),

        models.Question(id="q33", topic_id="t4", title="HashSet Unique Elements", difficulty="Easy",
            problem_statement="Read an integer N, then N integers (one per line, may include duplicates). Use a HashSet to find unique values. Print each unique value in sorted ascending order, one per line.",
            input_format="N on first line, then N integers one per line", output_format="Unique integers in sorted order, one per line",
            sample_input="6\n5\n3\n5\n1\n3\n2", sample_output="1\n2\n3\n5"),

        models.Question(id="q34", topic_id="t4", title="Iterator: Remove Evens", difficulty="Medium",
            problem_statement="Read an integer N followed by N integers. Add them to an ArrayList. Use an Iterator to traverse the list and remove all even numbers. Print the remaining (odd) numbers in original order, one per line.",
            input_format="N on first line, then N integers one per line", output_format="Odd integers in original order, one per line",
            sample_input="6\n1\n2\n3\n4\n5\n6", sample_output="1\n3\n5"),

        # ═══════════════════ EXCEPTION HANDLING (t5) ═══════════════════
        models.Question(id="q35", topic_id="t5", title="Safe Division", difficulty="Easy",
            problem_statement="Read two integers a and b. Use try-catch to perform integer division a/b. If b is zero, print 'ArithmeticException: / by zero'. Otherwise print the result.",
            input_format="Two integers a and b on separate lines", output_format="Division result or exception message",
            sample_input="10\n2", sample_output="5"),

        models.Question(id="q36", topic_id="t5", title="Array Index Guard", difficulty="Medium",
            problem_statement="Read integer N, then N integers into an array, then an index i. Use try-catch to access arr[i]. If out of bounds, print 'ArrayIndexOutOfBoundsException: Index ' + i + ' out of bounds for length ' + N. Otherwise print the value.",
            input_format="N, then N integers, then index i", output_format="Array value or exception message",
            sample_input="3\n10\n20\n30\n1", sample_output="20"),

        models.Question(id="q37", topic_id="t5", title="Custom Exception: Age Validator", difficulty="Medium",
            problem_statement="Create a custom exception class InvalidAgeException. Write a method validateAge(int age) that throws InvalidAgeException if age < 0 or age > 150. Read an integer. If valid, print 'Valid age: ' + age. If invalid, catch the exception and print 'InvalidAgeException: Invalid age: ' + age.",
            input_format="A single integer (age)", output_format="Validation result or exception message",
            sample_input="25", sample_output="Valid age: 25"),

        # ═══════════════════ FILE HANDLING & I/O (t6) ═══════════════════
        models.Question(id="q38", topic_id="t6", title="BufferedReader Line Sum", difficulty="Easy",
            problem_statement="Use a BufferedReader wrapping System.in to read an integer N, then N integers. Compute and print their sum. This practices the BufferedReader API used for file reading.",
            input_format="N on first line, then N integers one per line", output_format="Sum of all integers",
            sample_input="4\n10\n20\n30\n40", sample_output="100"),

        models.Question(id="q39", topic_id="t6", title="Stream Filter Even Numbers", difficulty="Medium",
            problem_statement="Read an integer N, then N integers. Store them in a List. Use the Java Streams API (stream().filter().sorted().forEach()) to print only the even numbers in ascending order, one per line.",
            input_format="N on first line, then N integers one per line", output_format="Even integers sorted ascending, one per line",
            sample_input="6\n5\n2\n8\n1\n4\n7", sample_output="2\n4\n8"),

        models.Question(id="q40", topic_id="t6", title="Stream: Sum of Squares", difficulty="Medium",
            problem_statement="Read an integer N, then N integers. Use the Java Streams API with mapToLong() and sum() to compute and print the sum of squares of all integers.",
            input_format="N on first line, then N integers one per line", output_format="Sum of squares as a long",
            sample_input="4\n1\n2\n3\n4", sample_output="30"),
    ]


def get_test_cases():
    """Test cases for every question. Multiple test cases per question."""
    return [
        # ─── q1: Hello World ──────────────────────────────────────
        models.TestCase(question_id="q1", input_data="", expected_output="Hello World"),

        # ─── q2: Sum of Two Numbers ───────────────────────────────
        models.TestCase(question_id="q2", input_data="3\n5", expected_output="8"),
        models.TestCase(question_id="q2", input_data="0\n0", expected_output="0"),
        models.TestCase(question_id="q2", input_data="-3\n7", expected_output="4"),
        models.TestCase(question_id="q2", input_data="100\n200", expected_output="300", is_hidden=True),

        # ─── q3: Swap Two Variables ───────────────────────────────
        models.TestCase(question_id="q3", input_data="10\n20", expected_output="20\n10"),
        models.TestCase(question_id="q3", input_data="0\n0", expected_output="0\n0"),
        models.TestCase(question_id="q3", input_data="-5\n5", expected_output="5\n-5"),
        models.TestCase(question_id="q3", input_data="999\n1", expected_output="1\n999", is_hidden=True),

        # ─── q4: Area of Circle ───────────────────────────────────
        models.TestCase(question_id="q4", input_data="5.0", expected_output="78.54"),
        models.TestCase(question_id="q4", input_data="1.0", expected_output="3.14"),
        models.TestCase(question_id="q4", input_data="10.0", expected_output="314.16", is_hidden=True),
        models.TestCase(question_id="q4", input_data="0.0", expected_output="0.00", is_hidden=True),

        # ─── q5: Data Type Sizes ──────────────────────────────────
        models.TestCase(question_id="q5", input_data="", expected_output="int: 4 bytes\ndouble: 8 bytes\nchar: 2 bytes\nboolean: 1 bytes"),

        # ─── q6: Temperature Converter ────────────────────────────
        models.TestCase(question_id="q6", input_data="100.0", expected_output="212.0"),
        models.TestCase(question_id="q6", input_data="0.0", expected_output="32.0"),
        models.TestCase(question_id="q6", input_data="37.0", expected_output="98.6"),
        models.TestCase(question_id="q6", input_data="-40.0", expected_output="-40.0", is_hidden=True),

        # ─── q7: Max of Three Numbers ─────────────────────────────
        models.TestCase(question_id="q7", input_data="5\n12\n8", expected_output="12"),
        models.TestCase(question_id="q7", input_data="1\n1\n1", expected_output="1"),
        models.TestCase(question_id="q7", input_data="-5\n-2\n-8", expected_output="-2"),
        models.TestCase(question_id="q7", input_data="100\n50\n100", expected_output="100", is_hidden=True),

        # ─── q8: ASCII Value ──────────────────────────────────────
        models.TestCase(question_id="q8", input_data="A", expected_output="65"),
        models.TestCase(question_id="q8", input_data="a", expected_output="97"),
        models.TestCase(question_id="q8", input_data="0", expected_output="48"),
        models.TestCase(question_id="q8", input_data="Z", expected_output="90", is_hidden=True),

        # ─── q9: Even or Odd ─────────────────────────────────────
        models.TestCase(question_id="q9", input_data="4", expected_output="Even"),
        models.TestCase(question_id="q9", input_data="7", expected_output="Odd"),
        models.TestCase(question_id="q9", input_data="0", expected_output="Even"),
        models.TestCase(question_id="q9", input_data="-3", expected_output="Odd", is_hidden=True),

        # ─── q10: Leap Year ───────────────────────────────────────
        models.TestCase(question_id="q10", input_data="2024", expected_output="Leap"),
        models.TestCase(question_id="q10", input_data="1900", expected_output="Not Leap"),
        models.TestCase(question_id="q10", input_data="2000", expected_output="Leap"),
        models.TestCase(question_id="q10", input_data="2023", expected_output="Not Leap", is_hidden=True),

        # ─── q11: Factorial ───────────────────────────────────────
        models.TestCase(question_id="q11", input_data="5", expected_output="120"),
        models.TestCase(question_id="q11", input_data="0", expected_output="1"),
        models.TestCase(question_id="q11", input_data="1", expected_output="1"),
        models.TestCase(question_id="q11", input_data="10", expected_output="3628800", is_hidden=True),

        # ─── q12: Is Prime ────────────────────────────────────────
        models.TestCase(question_id="q12", input_data="7", expected_output="Prime"),
        models.TestCase(question_id="q12", input_data="1", expected_output="Not Prime"),
        models.TestCase(question_id="q12", input_data="4", expected_output="Not Prime"),
        models.TestCase(question_id="q12", input_data="2", expected_output="Prime"),
        models.TestCase(question_id="q12", input_data="97", expected_output="Prime", is_hidden=True),

        # ─── q13: FizzBuzz ────────────────────────────────────────
        models.TestCase(question_id="q13", input_data="5", expected_output="1\n2\nFizz\n4\nBuzz"),
        models.TestCase(question_id="q13", input_data="15", expected_output="1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"),
        models.TestCase(question_id="q13", input_data="1", expected_output="1"),
        models.TestCase(question_id="q13", input_data="3", expected_output="1\n2\nFizz", is_hidden=True),

        # ─── q14: Reverse a Number ────────────────────────────────
        models.TestCase(question_id="q14", input_data="12345", expected_output="54321"),
        models.TestCase(question_id="q14", input_data="100", expected_output="1"),
        models.TestCase(question_id="q14", input_data="7", expected_output="7"),
        models.TestCase(question_id="q14", input_data="-123", expected_output="-321", is_hidden=True),

        # ─── q15: Multiplication Table ────────────────────────────
        models.TestCase(question_id="q15", input_data="5", expected_output="5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50"),
        models.TestCase(question_id="q15", input_data="1", expected_output="1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10"),

        # ─── q16: Sum of Digits ───────────────────────────────────
        models.TestCase(question_id="q16", input_data="1234", expected_output="10"),
        models.TestCase(question_id="q16", input_data="9", expected_output="9"),
        models.TestCase(question_id="q16", input_data="999", expected_output="27"),
        models.TestCase(question_id="q16", input_data="10001", expected_output="2", is_hidden=True),

        # ─── q17: Right Triangle Pattern ──────────────────────────
        models.TestCase(question_id="q17", input_data="4", expected_output="*\n**\n***\n****"),
        models.TestCase(question_id="q17", input_data="1", expected_output="*"),
        models.TestCase(question_id="q17", input_data="3", expected_output="*\n**\n***", is_hidden=True),

        # ─── q18: Fibonacci Series ────────────────────────────────
        models.TestCase(question_id="q18", input_data="7", expected_output="0 1 1 2 3 5 8"),
        models.TestCase(question_id="q18", input_data="1", expected_output="0"),
        models.TestCase(question_id="q18", input_data="2", expected_output="0 1"),
        models.TestCase(question_id="q18", input_data="10", expected_output="0 1 1 2 3 5 8 13 21 34", is_hidden=True),

        # ─── q19: Student Class ───────────────────────────────────
        models.TestCase(question_id="q19", input_data="Alice\n20", expected_output="Name: Alice\nAge: 20"),
        models.TestCase(question_id="q19", input_data="Bob\n18", expected_output="Name: Bob\nAge: 18"),
        models.TestCase(question_id="q19", input_data="Charlie\n30", expected_output="Name: Charlie\nAge: 30", is_hidden=True),

        # ─── q20: Rectangle ──────────────────────────────────────
        models.TestCase(question_id="q20", input_data="5.0\n3.0", expected_output="Area: 15.0\nPerimeter: 16.0"),
        models.TestCase(question_id="q20", input_data="10.0\n2.0", expected_output="Area: 20.0\nPerimeter: 24.0"),
        models.TestCase(question_id="q20", input_data="1.0\n1.0", expected_output="Area: 1.0\nPerimeter: 4.0", is_hidden=True),

        # ─── q21: Calculator Overloading ──────────────────────────
        models.TestCase(question_id="q21", input_data="3 5\n1 2 3\n2.5 3.5", expected_output="8\n6\n6.0"),
        models.TestCase(question_id="q21", input_data="0 0\n0 0 0\n0.0 0.0", expected_output="0\n0\n0.0"),

        # ─── q22: Animal Hierarchy ────────────────────────────────
        models.TestCase(question_id="q22", input_data="", expected_output="Woof!\nMeow!"),

        # ─── q23: Super Keyword ───────────────────────────────────
        models.TestCase(question_id="q23", input_data="", expected_output="Vehicle created\nCar created"),

        # ─── q24: Polymorphism Shape ──────────────────────────────
        models.TestCase(question_id="q24", input_data="5.0\n4.0\n6.0", expected_output="78.54\n24.00"),
        models.TestCase(question_id="q24", input_data="1.0\n2.0\n3.0", expected_output="3.14\n6.00"),
        models.TestCase(question_id="q24", input_data="10.0\n5.0\n5.0", expected_output="314.16\n25.00", is_hidden=True),

        # ─── q25: Abstract Employee ───────────────────────────────
        models.TestCase(question_id="q25", input_data="5000.0\n25.0\n80", expected_output="5000.0\n2000.0"),
        models.TestCase(question_id="q25", input_data="3000.0\n15.0\n40", expected_output="3000.0\n600.0"),

        # ─── q26: Interface Printable ─────────────────────────────
        models.TestCase(question_id="q26", input_data="Java Guide\nTech Weekly", expected_output="Book: Java Guide\nMagazine: Tech Weekly"),
        models.TestCase(question_id="q26", input_data="Hello World\nDaily Times", expected_output="Book: Hello World\nMagazine: Daily Times"),

        # ─── q27: BankAccount ─────────────────────────────────────
        models.TestCase(question_id="q27", input_data="1000.0\n500.0\n200.0", expected_output="1300.0"),
        models.TestCase(question_id="q27", input_data="100.0\n50.0\n200.0", expected_output="150.0"),  # withdrawal > balance
        models.TestCase(question_id="q27", input_data="0.0\n100.0\n50.0", expected_output="50.0", is_hidden=True),

        # ─── q28: Static Counter ──────────────────────────────────
        models.TestCase(question_id="q28", input_data="", expected_output="3"),

        # ─── q29: this Keyword Person ─────────────────────────────
        models.TestCase(question_id="q29", input_data="Bob\n25", expected_output="Name: Bob\nAge: 25"),
        models.TestCase(question_id="q29", input_data="Alice\n30", expected_output="Name: Alice\nAge: 30"),

        # ─── q30: Multiple Interfaces Duck ────────────────────────
        models.TestCase(question_id="q30", input_data="", expected_output="Flying\nSwimming"),

        # ─── q31: ArrayList Sort ──────────────────────────────────
        models.TestCase(question_id="q31", input_data="5\n3\n1\n4\n1\n5", expected_output="1\n1\n3\n4\n5"),
        models.TestCase(question_id="q31", input_data="3\n9\n2\n7", expected_output="2\n7\n9"),
        models.TestCase(question_id="q31", input_data="1\n42", expected_output="42"),
        models.TestCase(question_id="q31", input_data="4\n-3\n0\n5\n-1", expected_output="-3\n-1\n0\n5", is_hidden=True),

        # ─── q32: HashMap Word Count ──────────────────────────────
        models.TestCase(question_id="q32", input_data="5\napple\nbanana\napple\ncherry\nbanana", expected_output="apple: 2\nbanana: 2\ncherry: 1"),
        models.TestCase(question_id="q32", input_data="3\nhello\nworld\nhello", expected_output="hello: 2\nworld: 1"),
        models.TestCase(question_id="q32", input_data="1\njava", expected_output="java: 1"),
        models.TestCase(question_id="q32", input_data="4\ndog\ncat\ndog\nbird", expected_output="bird: 1\ncat: 1\ndog: 2", is_hidden=True),

        # ─── q33: HashSet Unique Elements ─────────────────────────
        models.TestCase(question_id="q33", input_data="6\n5\n3\n5\n1\n3\n2", expected_output="1\n2\n3\n5"),
        models.TestCase(question_id="q33", input_data="4\n1\n1\n1\n1", expected_output="1"),
        models.TestCase(question_id="q33", input_data="3\n7\n2\n9", expected_output="2\n7\n9"),
        models.TestCase(question_id="q33", input_data="5\n10\n5\n3\n10\n1", expected_output="1\n3\n5\n10", is_hidden=True),

        # ─── q34: Iterator Remove Evens ───────────────────────────
        models.TestCase(question_id="q34", input_data="6\n1\n2\n3\n4\n5\n6", expected_output="1\n3\n5"),
        models.TestCase(question_id="q34", input_data="4\n2\n4\n6\n8", expected_output=""),
        models.TestCase(question_id="q34", input_data="3\n1\n3\n5", expected_output="1\n3\n5"),
        models.TestCase(question_id="q34", input_data="5\n7\n8\n9\n10\n11", expected_output="7\n9\n11", is_hidden=True),

        # ─── q35: Safe Division ───────────────────────────────────
        models.TestCase(question_id="q35", input_data="10\n2", expected_output="5"),
        models.TestCase(question_id="q35", input_data="7\n0", expected_output="ArithmeticException: / by zero"),
        models.TestCase(question_id="q35", input_data="9\n3", expected_output="3"),
        models.TestCase(question_id="q35", input_data="0\n5", expected_output="0", is_hidden=True),

        # ─── q36: Array Index Guard ───────────────────────────────
        models.TestCase(question_id="q36", input_data="3\n10\n20\n30\n1", expected_output="20"),
        models.TestCase(question_id="q36", input_data="3\n10\n20\n30\n5", expected_output="ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 3"),
        models.TestCase(question_id="q36", input_data="4\n1\n2\n3\n4\n0", expected_output="1"),
        models.TestCase(question_id="q36", input_data="2\n99\n88\n-1", expected_output="ArrayIndexOutOfBoundsException: Index -1 out of bounds for length 2", is_hidden=True),

        # ─── q37: Custom Exception Age Validator ──────────────────
        models.TestCase(question_id="q37", input_data="25", expected_output="Valid age: 25"),
        models.TestCase(question_id="q37", input_data="-5", expected_output="InvalidAgeException: Invalid age: -5"),
        models.TestCase(question_id="q37", input_data="200", expected_output="InvalidAgeException: Invalid age: 200"),
        models.TestCase(question_id="q37", input_data="0", expected_output="Valid age: 0", is_hidden=True),

        # ─── q38: BufferedReader Line Sum ─────────────────────────
        models.TestCase(question_id="q38", input_data="4\n10\n20\n30\n40", expected_output="100"),
        models.TestCase(question_id="q38", input_data="1\n42", expected_output="42"),
        models.TestCase(question_id="q38", input_data="3\n-5\n5\n10", expected_output="10"),
        models.TestCase(question_id="q38", input_data="5\n1\n2\n3\n4\n5", expected_output="15", is_hidden=True),

        # ─── q39: Stream Filter Even Numbers ──────────────────────
        models.TestCase(question_id="q39", input_data="6\n5\n2\n8\n1\n4\n7", expected_output="2\n4\n8"),
        models.TestCase(question_id="q39", input_data="3\n1\n3\n5", expected_output=""),
        models.TestCase(question_id="q39", input_data="4\n2\n4\n6\n8", expected_output="2\n4\n6\n8"),
        models.TestCase(question_id="q39", input_data="5\n10\n7\n4\n3\n6", expected_output="4\n6\n10", is_hidden=True),

        # ─── q40: Stream Sum of Squares ───────────────────────────
        models.TestCase(question_id="q40", input_data="4\n1\n2\n3\n4", expected_output="30"),
        models.TestCase(question_id="q40", input_data="3\n3\n4\n5", expected_output="50"),
        models.TestCase(question_id="q40", input_data="1\n10", expected_output="100"),
        models.TestCase(question_id="q40", input_data="3\n1\n1\n1", expected_output="3", is_hidden=True),
    ]
