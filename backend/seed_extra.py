"""
Seed questions q41–q100 (60 new questions to bring the total to 100).
Run once: python seed_extra.py
"""
import os, sys
os.environ.setdefault("DATABASE_URL", "sqlite:///./jlearn.db")
os.environ.setdefault("JWT_SECRET", "dev")

from database import SessionLocal
import models

db = SessionLocal()

# ─────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────
def q(id, topic_id, title, difficulty, problem_statement, input_format, output_format, sample_input, sample_output):
    return models.Question(id=id, topic_id=topic_id, title=title, difficulty=difficulty,
        problem_statement=problem_statement, input_format=input_format,
        output_format=output_format, sample_input=sample_input, sample_output=sample_output)

def tc(question_id, input_data, expected_output, is_hidden=False):
    return models.TestCase(question_id=question_id, input_data=input_data,
        expected_output=expected_output, is_hidden=is_hidden)


# ─────────────────────────────────────────────
# QUESTIONS
# ─────────────────────────────────────────────
questions = [

  # ══════════════ JAVA BASICS t1  (q41-q50, +10 → 18 total) ══════════════
  q("q41","t1","Power of a Number","Easy",
    "Read two integers: base and exponent (exponent >= 0). Print base raised to the power of exponent. Use a loop (do not use Math.pow).",
    "Two integers on separate lines: base, exponent",
    "base^exponent as a long integer",
    "2\n10", "1024"),

  q("q42","t1","Palindrome Number","Easy",
    "Read an integer. Print 'Palindrome' if it reads the same forwards and backwards, 'Not Palindrome' otherwise. Treat negative numbers as not palindromes.",
    "A single integer",
    "Palindrome or Not Palindrome",
    "121", "Palindrome"),

  q("q43","t1","Sum of Natural Numbers","Easy",
    "Read a positive integer N. Print the sum of all natural numbers from 1 to N.",
    "A single positive integer N",
    "Sum of 1 + 2 + ... + N",
    "10", "55"),

  q("q44","t1","Perfect Number Check","Medium",
    "Read a positive integer N. A perfect number equals the sum of its proper divisors (excluding itself). Print 'Perfect' or 'Not Perfect'.",
    "A single positive integer N",
    "Perfect or Not Perfect",
    "28", "Perfect"),

  q("q45","t1","Digit Count","Easy",
    "Read a non-negative integer. Print the number of digits it contains. Zero has 1 digit.",
    "A single non-negative integer",
    "Number of digits",
    "12345", "5"),

  q("q46","t1","Simple Interest","Easy",
    "Read three doubles: principal P, annual rate R (as percentage), and time T in years. Print Simple Interest = (P*R*T)/100, rounded to 2 decimal places.",
    "Three doubles: P, R, T on separate lines",
    "Simple interest to 2 decimal places",
    "1000.0\n5.0\n3.0", "150.00"),

  q("q47","t1","Absolute Value Without Math","Easy",
    "Read an integer. Print its absolute value without using Math.abs().",
    "A single integer",
    "Absolute value",
    "-42", "42"),

  q("q48","t1","Quotient and Remainder","Easy",
    "Read two positive integers a and b. Print the integer quotient on the first line and the remainder on the second line.",
    "Two positive integers a and b on separate lines",
    "Quotient on line 1, remainder on line 2",
    "17\n5", "3\n2"),

  q("q49","t1","Is Armstrong Number","Medium",
    "Read a positive integer. An Armstrong number equals the sum of its own digits each raised to the power of the number of digits (e.g. 153 = 1^3 + 5^3 + 3^3). Print 'Armstrong' or 'Not Armstrong'.",
    "A single positive integer",
    "Armstrong or Not Armstrong",
    "153", "Armstrong"),

  q("q50","t1","Binary to Decimal","Medium",
    "Read a non-negative integer representing a binary number (only 0s and 1s). Convert it to decimal and print the result.",
    "A single non-negative integer (binary digits)",
    "Decimal equivalent",
    "1010", "10"),

  # ══════════════ CONTROL STATEMENTS t2  (q51-q60, +10 → 20 total) ══════════════
  q("q51","t2","Grade Calculator","Easy",
    "Read an integer score (0–100). Print the grade: A (90–100), B (80–89), C (70–79), D (60–69), F (below 60).",
    "A single integer (0–100)",
    "A, B, C, D, or F",
    "85", "B"),

  q("q52","t2","Count Vowels","Easy",
    "Read a single word (lowercase). Print the number of vowels (a, e, i, o, u) it contains.",
    "A single lowercase word",
    "Count of vowels",
    "hello", "2"),

  q("q53","t2","Sum of Even Numbers up to N","Easy",
    "Read a positive integer N. Print the sum of all even numbers from 2 to N (inclusive).",
    "A single positive integer N",
    "Sum of even numbers from 2 to N",
    "10", "30"),

  q("q54","t2","Reverse String","Easy",
    "Read a string. Print it reversed.",
    "A single string (no spaces)",
    "The reversed string",
    "jlearn", "nraelj"),

  q("q55","t2","GCD of Two Numbers","Medium",
    "Read two positive integers. Print their Greatest Common Divisor (GCD) using the Euclidean algorithm.",
    "Two positive integers on separate lines",
    "Their GCD",
    "48\n18", "6"),

  q("q56","t2","Number Staircase","Easy",
    "Read an integer N. Print a staircase where row i (1-indexed) contains the numbers 1 through i separated by spaces.",
    "A single positive integer N",
    "N lines forming a staircase",
    "4", "1\n1 2\n1 2 3\n1 2 3 4"),

  q("q57","t2","Count Digits Even and Odd","Medium",
    "Read a positive integer. Count how many of its digits are even and how many are odd. Print 'Even digits: X' then 'Odd digits: Y'.",
    "A single positive integer",
    "Two lines with even and odd digit counts",
    "1234567", "Even digits: 3\nOdd digits: 4"),

  q("q58","t2","Sum Until Zero","Medium",
    "Read integers one per line until you read 0. Print the sum of all integers read before the 0.",
    "Integers one per line, terminated by 0",
    "Sum of all integers before 0",
    "5\n3\n-2\n0", "6"),

  q("q59","t2","Print Diamond Pattern","Medium",
    "Read an odd integer N. Print a diamond pattern of stars with maximum width N.",
    "A single odd positive integer N",
    "Diamond pattern of stars",
    "5", "  *\n ***\n*****\n ***\n  *"),

  q("q60","t2","LCM of Two Numbers","Medium",
    "Read two positive integers. Print their Least Common Multiple (LCM). Use: LCM(a,b) = (a*b) / GCD(a,b).",
    "Two positive integers on separate lines",
    "Their LCM",
    "4\n6", "12"),

  # ══════════════ OOP t3  (q61-q70, +10 → 22 total) ══════════════
  q("q61","t3","Varargs Sum","Easy",
    "Create a method sum(int... nums) that returns the sum of all its arguments. Call it three times: with (1,2), (1,2,3,4), and (10). Print each result on a separate line.",
    "None",
    "Three sums on separate lines",
    "", "3\n10\n10"),

  q("q62","t3","toString Override","Easy",
    "Create a Car class with fields make (String) and year (int). Override toString() to return 'make (year)'. Read make and year. Print the Car object.",
    "Two lines: make (String) and year (int)",
    "Car's toString output",
    "Toyota\n2020", "Toyota (2020)"),

  q("q63","t3","equals and hashCode","Medium",
    "Create a Point class with int x and y. Override equals() so two Points are equal if x and y match. Create two Points with the same coordinates. Print whether they are equal using .equals().",
    "Four integers: x1, y1, x2, y2 on separate lines",
    "true or false",
    "3\n4\n3\n4", "true"),

  q("q64","t3","Comparable: Sort Names","Medium",
    "Create a Name class implementing Comparable<Name> that compares alphabetically. Read 3 names, add to an ArrayList, sort using Collections.sort(), print each sorted name on a new line.",
    "Three names on separate lines",
    "Names in alphabetical order, one per line",
    "Charlie\nAlice\nBob", "Alice\nBob\nCharlie"),

  q("q65","t3","Anonymous Comparator","Medium",
    "Read 4 integers into an ArrayList. Sort them in descending order using an anonymous Comparator (not a lambda). Print each on a new line.",
    "Four integers on separate lines",
    "Integers sorted descending, one per line",
    "3\n1\n4\n2", "4\n3\n2\n1"),

  q("q66","t3","Static Factory Method","Easy",
    "Create a Temperature class with a private constructor taking a double value. Add static factory methods fromCelsius(double c) and toFahrenheit() that converts to Fahrenheit. Read a Celsius value. Print Fahrenheit rounded to 1 decimal.",
    "A single double (Celsius)",
    "Fahrenheit to 1 decimal place",
    "100.0", "212.0"),

  q("q67","t3","Composition: Engine and Car","Medium",
    "Create an Engine class with an int horsepower field and a start() method printing 'Engine started: X hp'. Create a Car class that has an Engine (composition). Read horsepower. Create a Car and call its engine's start().",
    "A single integer (horsepower)",
    "Engine started: X hp",
    "150", "Engine started: 150 hp"),

  q("q68","t3","Iterable Custom Class","Medium",
    "Create a NumberRange class that implements Iterable<Integer> for a range [start, end] inclusive. Read start and end. Use a for-each loop to print each number on a new line.",
    "Two integers: start and end on separate lines",
    "Each integer in range on a new line",
    "3\n7", "3\n4\n5\n6\n7"),

  q("q69","t3","Enum Days","Easy",
    "Create an enum Day with values MON, TUE, WED, THU, FRI, SAT, SUN. Read a string representing a day. Print 'Weekday' if MON–FRI, 'Weekend' if SAT or SUN.",
    "A string (MON, TUE, WED, THU, FRI, SAT, or SUN)",
    "Weekday or Weekend",
    "SAT", "Weekend"),

  q("q70","t3","Generic Pair Class","Medium",
    "Create a generic class Pair<A, B> with fields first and second. Add a getFirst() and getSecond() method. Read a String and an Integer. Create a Pair<String, Integer> and print 'first: X, second: Y'.",
    "Two lines: a String and an Integer",
    "first: X, second: Y",
    "hello\n42", "first: hello, second: 42"),

  # ══════════════ COLLECTIONS t4  (q71-q82, +12 → 16 total) ══════════════
  q("q71","t4","LinkedList as Stack","Medium",
    "Use a LinkedList<Integer> as a stack (addFirst/removeFirst). Read N integers and push each. Then pop and print all N integers (LIFO order), one per line.",
    "N on first line, then N integers one per line",
    "Integers in LIFO (reverse) order, one per line",
    "4\n1\n2\n3\n4", "4\n3\n2\n1"),

  q("q72","t4","TreeMap Sorted Keys","Easy",
    "Read N key-value pairs (one 'key value' per line). Store in a TreeMap<String,Integer>. Print each entry as 'key=value' in alphabetical key order.",
    "N on first line, then N lines of 'key value'",
    "key=value pairs in alphabetical order",
    "3\nbanana 2\napple 5\ncherry 1", "apple=5\nbanana=2\ncherry=1"),

  q("q73","t4","PriorityQueue Min Extraction","Medium",
    "Read N integers into a PriorityQueue (min-heap). Extract and print all elements one per line (they will come out in ascending order).",
    "N on first line, then N integers one per line",
    "Integers in ascending order, one per line",
    "5\n5\n3\n8\n1\n4", "1\n3\n4\n5\n8"),

  q("q74","t4","Remove Duplicates Preserve Order","Medium",
    "Read N strings one per line. Using a LinkedHashSet, remove duplicates while preserving insertion order. Print remaining strings one per line.",
    "N on first line, then N strings one per line",
    "Unique strings in original order",
    "6\napple\nbanana\napple\ncherry\nbanana\ndate", "apple\nbanana\ncherry\ndate"),

  q("q75","t4","Balanced Parentheses","Medium",
    "Read a string of brackets: '(', ')', '{', '}', '[', ']'. Use a Stack (Deque/ArrayDeque) to check if the brackets are balanced. Print 'Balanced' or 'Not Balanced'.",
    "A single string of bracket characters",
    "Balanced or Not Balanced",
    "{[()]}", "Balanced"),

  q("q76","t4","Collections.frequency","Easy",
    "Read N integers into an ArrayList. Read a target integer T. Print the frequency of T in the list using Collections.frequency().",
    "N on first line, then N integers, then T",
    "Frequency of T",
    "5\n3\n1\n3\n2\n3\n3", "3"),

  q("q77","t4","Map Entry Filter","Medium",
    "Read N pairs of 'name score' (one per line). Store in a HashMap. Print all entries where score >= 80 in 'name: score' format, sorted alphabetically by name.",
    "N on first line, then N lines of 'name score'",
    "Qualifying entries sorted alphabetically",
    "4\nAlice 90\nBob 70\nCarol 85\nDave 60", "Alice: 90\nCarol: 85"),

  q("q78","t4","Deque as Queue","Easy",
    "Use an ArrayDeque<Integer> as a queue (addLast/pollFirst). Read N integers, enqueue all, then dequeue and print all in FIFO order, one per line.",
    "N on first line, then N integers one per line",
    "Integers in FIFO order, one per line",
    "4\n10\n20\n30\n40", "10\n20\n30\n40"),

  q("q79","t4","Group by First Letter","Medium",
    "Read N words. Group them by their first character using a TreeMap<Character, List<String>>. Print each group as 'X: [word1, word2]' in alphabetical key order. Sort words within each group alphabetically.",
    "N on first line, then N words one per line",
    "Groups in alphabetical order",
    "5\napple\navocado\nbanana\nberry\napricot", "a: [apple, apricot, avocado]\nb: [banana, berry]"),

  q("q80","t4","Collections.sort with Comparator Lambda","Easy",
    "Read N strings. Sort them by length (ascending), then alphabetically for ties, using Collections.sort() with a lambda comparator. Print each sorted string on a new line.",
    "N on first line, then N strings one per line",
    "Strings sorted by length then alphabetically",
    "4\nbanana\nkiwi\napple\nfig", "fig\nkiwi\napple\nbanana"),

  q("q81","t4","Merge and Deduplicate Two Lists","Medium",
    "Read two lists of integers. First line: N, next N integers. Then M, next M integers. Merge both into one ArrayList, remove duplicates using a LinkedHashSet (preserve first-seen order), sort, and print each on a new line.",
    "N, then N integers; M, then M integers",
    "Merged unique integers sorted ascending",
    "3\n3\n1\n4\n3\n1\n5\n9", "1\n3\n4\n5\n9"),

  q("q82","t4","Word Frequency Top N","Hard",
    "Read an integer N, then N words (one per line). Count word frequencies with a HashMap. Print all words and frequencies in descending frequency order. For ties, sort alphabetically. Format: 'word: count'.",
    "N on first line, then N words one per line",
    "word: count pairs sorted by frequency desc then alphabetically",
    "6\ncat\ndog\ncat\nbird\ndog\ncat", "cat: 3\ndog: 2\nbird: 1"),

  # ══════════════ EXCEPTION HANDLING t5  (q83-q91, +10 → 13 total) ══════════════
  q("q83","t5","Parse Integer Safely","Easy",
    "Read a string. Try to parse it as an integer. If it succeeds, print 'Parsed: N'. If a NumberFormatException occurs, print 'NumberFormatException: invalid input'.",
    "A single string",
    "Parsed: N or NumberFormatException message",
    "42", "Parsed: 42"),

  q("q84","t5","Multi-catch Block","Medium",
    "Read two integers a and b and a string s. In a single try block: print a/b (may throw ArithmeticException), then print Integer.parseInt(s) (may throw NumberFormatException). Use a multi-catch. If ArithmeticException: print 'ArithmeticException: / by zero'. If NumberFormatException: print 'NumberFormatException: invalid'.",
    "Three lines: int a, int b, String s",
    "Division result or exception message",
    "10\n2\n5", "5\n5"),

  q("q85","t5","Finally Always Runs","Easy",
    "Read an integer. Try to compute 100 / input. Print the result if successful. In the finally block, always print 'Cleanup done'. If ArithmeticException, print 'Error: division by zero' before finally.",
    "A single integer",
    "Result (or error) then 'Cleanup done'",
    "4", "25\nCleanup done"),

  q("q86","t5","Chained Custom Exceptions","Medium",
    "Create a DatabaseException(String msg) class. Create a method connect(int port) that throws DatabaseException('Connection refused on port: '+port) if port < 1024. Read a port number. Call connect(). If exception caught, print its message.",
    "A single integer (port)",
    "Connection refused message or nothing if valid port",
    "80", "Connection refused on port: 80"),

  q("q87","t5","Stack Overflow Detection","Medium",
    "Write a recursive method countdown(int n) that calls itself with n-1. Add a try-catch for StackOverflowError. Read an integer N. If N <= 0 print 'Done'. Otherwise call countdown, and if StackOverflowError is caught print 'StackOverflowError caught'.",
    "A single integer N",
    "Done or StackOverflowError caught",
    "3", "Done"),

  q("q88","t5","Exception Message Extraction","Easy",
    "Read two integers. Compute their division inside a try block. Catch any ArithmeticException and print only the message of the exception (e.getMessage()).",
    "Two integers a and b on separate lines",
    "Division result or the exception message",
    "5\n0", "/ by zero"),

  q("q89","t5","Validate Positive Number","Easy",
    "Create a custom exception NonPositiveException(String msg). Read an integer. If it is <= 0, throw NonPositiveException('Number must be positive: '+n). Catch it and print the message. If positive, print 'Valid: '+n.",
    "A single integer",
    "Valid: N or exception message",
    "-5", "Number must be positive: -5"),

  q("q90","t5","Re-throw as RuntimeException","Medium",
    "Write a method riskyParse(String s) that tries Integer.parseInt(s) and if it fails, catches NumberFormatException and re-throws it as a RuntimeException('Parse failed: ' + s). Read a string. Call riskyParse(), catch RuntimeException and print its message.",
    "A single string",
    "RuntimeException message or parsed value",
    "abc", "Parse failed: abc"),

  q("q91","t5","Exception in Loop","Medium",
    "Read N strings (one per line). For each string, try to parse it as an integer. Print the parsed value if successful, or 'skip' if not parseable. Continue regardless.",
    "N on first line, then N strings one per line",
    "Parsed value or 'skip' for each, one per line",
    "4\n10\nhello\n7\nworld", "10\nskip\n7\nskip"),

  # ══════════════ FILE HANDLING & I/O t6  (q92-q100, +8 → 11 total) ══════════════
  q("q92","t6","Stream Distinct Values","Easy",
    "Read N integers (one per line). Use stream().distinct() to get unique values. Print them in the order they first appeared (use LinkedHashSet or distinct on a stream and collect to list). Print one per line.",
    "N on first line, then N integers one per line",
    "Distinct values in original order, one per line",
    "6\n5\n3\n5\n1\n3\n2", "5\n3\n1\n2"),

  q("q93","t6","Stream Count Matching","Easy",
    "Read N integers. Use stream().filter().count() to count how many are greater than 10. Print the count.",
    "N on first line, then N integers one per line",
    "Count of integers greater than 10",
    "5\n5\n15\n3\n20\n8", "2"),

  q("q94","t6","Stream Map to String","Easy",
    "Read N integers. Use stream().map() to convert each integer to its string representation prefixed with 'num_'. Print each mapped value on a new line.",
    "N on first line, then N integers one per line",
    "Mapped strings, one per line",
    "3\n1\n2\n3", "num_1\nnum_2\nnum_3"),

  q("q95","t6","Stream Reduce Product","Medium",
    "Read N integers. Use stream().reduce(1, (a,b) -> a*b) to compute their product. Print the result.",
    "N on first line, then N integers one per line",
    "Product of all integers",
    "4\n2\n3\n4\n5", "120"),

  q("q96","t6","Stream Min and Max","Easy",
    "Read N integers. Use stream().min() and stream().max() with Integer::compareTo. Print min on first line, max on second line.",
    "N on first line, then N integers one per line",
    "Min on line 1, Max on line 2",
    "5\n3\n7\n1\n9\n4", "1\n9"),

  q("q97","t6","Stream Average","Easy",
    "Read N doubles (one per line). Use mapToDouble and average(). Print the average rounded to 2 decimal places, or 'No data' if N is 0.",
    "N on first line, then N doubles one per line",
    "Average to 2 decimal places",
    "4\n10.0\n20.0\n30.0\n40.0", "25.00"),

  q("q98","t6","BufferedReader Count Words","Medium",
    "Use a BufferedReader on System.in. Read all lines until EOF (use readLine() != null loop). Count the total number of words across all lines (split by spaces). Print the count.",
    "Multiple lines of text",
    "Total word count",
    "hello world\nfoo bar baz", "5"),

  q("q99","t6","Stream Sorted Descending","Easy",
    "Read N integers. Use stream().sorted(Comparator.reverseOrder()) to sort descending. Print each on a new line.",
    "N on first line, then N integers one per line",
    "Integers sorted descending, one per line",
    "5\n3\n1\n4\n1\n5", "5\n4\n3\n1\n1"),

  q("q100","t6","Stream Partition Even Odd","Medium",
    "Read N integers. Use Collectors.partitioningBy(n -> n % 2 == 0) to split into even and odd lists. Print 'Even: ' followed by the sorted even numbers comma-separated. Print 'Odd: ' followed by the sorted odd numbers comma-separated.",
    "N on first line, then N integers one per line",
    "Even: ... and Odd: ... lines",
    "6\n1\n2\n3\n4\n5\n6", "Even: 2, 4, 6\nOdd: 1, 3, 5"),
]


# ─────────────────────────────────────────────
# TEST CASES
# ─────────────────────────────────────────────
test_cases = [

  # q41 Power
  tc("q41","2\n10","1024"), tc("q41","3\n3","27"), tc("q41","5\n0","1"),
  tc("q41","2\n20","1048576",True),

  # q42 Palindrome Number
  tc("q42","121","Palindrome"), tc("q42","123","Not Palindrome"),
  tc("q42","1","Palindrome"), tc("q42","-121","Not Palindrome",True),

  # q43 Sum Natural
  tc("q43","10","55"), tc("q43","1","1"), tc("q43","5","15"),
  tc("q43","100","5050",True),

  # q44 Perfect Number
  tc("q44","28","Perfect"), tc("q44","12","Not Perfect"),
  tc("q44","6","Perfect"), tc("q44","496","Perfect",True),

  # q45 Digit Count
  tc("q45","12345","5"), tc("q45","0","1"), tc("q45","9","1"),
  tc("q45","1000000","7",True),

  # q46 Simple Interest
  tc("q46","1000.0\n5.0\n3.0","150.00"), tc("q46","500.0\n10.0\n2.0","100.00"),
  tc("q46","200.0\n3.5\n4.0","28.00",True),

  # q47 Absolute Value
  tc("q47","-42","42"), tc("q47","42","42"), tc("q47","0","0"),
  tc("q47","-1","1",True),

  # q48 Quotient and Remainder
  tc("q48","17\n5","3\n2"), tc("q48","10\n2","5\n0"),
  tc("q48","7\n3","2\n1",True),

  # q49 Armstrong
  tc("q49","153","Armstrong"), tc("q49","370","Armstrong"),
  tc("q49","100","Not Armstrong"), tc("q49","9474","Armstrong",True),

  # q50 Binary to Decimal
  tc("q50","1010","10"), tc("q50","1111","15"),
  tc("q50","0","0"), tc("q50","11111111","255",True),

  # q51 Grade
  tc("q51","85","B"), tc("q51","95","A"), tc("q51","72","C"),
  tc("q51","55","F"), tc("q51","60","D",True),

  # q52 Count Vowels
  tc("q52","hello","2"), tc("q52","rhythm","0"),
  tc("q52","aeiou","5"), tc("q52","java","2",True),

  # q53 Sum Even up to N
  tc("q53","10","30"), tc("q53","1","0"), tc("q53","4","6"),
  tc("q53","20","110",True),

  # q54 Reverse String
  tc("q54","jlearn","nraelj"), tc("q54","a","a"),
  tc("q54","abcd","dcba"), tc("q54","racecar","racecar",True),

  # q55 GCD
  tc("q55","48\n18","6"), tc("q55","100\n75","25"),
  tc("q55","7\n3","1"), tc("q55","1000\n500","500",True),

  # q56 Number Staircase
  tc("q56","4","1\n1 2\n1 2 3\n1 2 3 4"),
  tc("q56","1","1"), tc("q56","3","1\n1 2\n1 2 3",True),

  # q57 Count Even Odd Digits
  tc("q57","1234567","Even digits: 3\nOdd digits: 4"),
  tc("q57","2468","Even digits: 4\nOdd digits: 0"),
  tc("q57","135","Even digits: 0\nOdd digits: 3",True),

  # q58 Sum Until Zero
  tc("q58","5\n3\n-2\n0","6"), tc("q58","0","0"),
  tc("q58","10\n20\n30\n0","60",True),

  # q59 Diamond
  tc("q59","5","  *\n ***\n*****\n ***\n  *"),
  tc("q59","1","*"),
  tc("q59","3"," *\n***\n *",True),

  # q60 LCM
  tc("q60","4\n6","12"), tc("q60","3\n5","15"),
  tc("q60","12\n18","36"), tc("q60","100\n75","300",True),

  # q61 Varargs
  tc("q61","","3\n10\n10"),

  # q62 toString
  tc("q62","Toyota\n2020","Toyota (2020)"),
  tc("q62","Honda\n2018","Honda (2018)"),
  tc("q62","BMW\n2023","BMW (2023)",True),

  # q63 equals
  tc("q63","3\n4\n3\n4","true"), tc("q63","1\n2\n3\n4","false"),
  tc("q63","0\n0\n0\n0","true",True),

  # q64 Comparable Sort Names
  tc("q64","Charlie\nAlice\nBob","Alice\nBob\nCharlie"),
  tc("q64","Zara\nMike\nAnn","Ann\nMike\nZara"),
  tc("q64","Same\nSame\nOther","Other\nSame\nSame",True),

  # q65 Anonymous Comparator
  tc("q65","3\n1\n4\n2","4\n3\n2\n1"),
  tc("q65","9\n7\n5\n3","9\n7\n5\n3"),
  tc("q65","1\n2\n3\n4","4\n3\n2\n1",True),

  # q66 Static Factory
  tc("q66","100.0","212.0"), tc("q66","0.0","32.0"),
  tc("q66","37.0","98.6",True),

  # q67 Composition Engine
  tc("q67","150","Engine started: 150 hp"),
  tc("q67","300","Engine started: 300 hp"),
  tc("q67","0","Engine started: 0 hp",True),

  # q68 Iterable Range
  tc("q68","3\n7","3\n4\n5\n6\n7"),
  tc("q68","1\n1","1"),
  tc("q68","5\n8","5\n6\n7\n8",True),

  # q69 Enum Days
  tc("q69","SAT","Weekend"), tc("q69","MON","Weekday"),
  tc("q69","SUN","Weekend"), tc("q69","FRI","Weekday",True),

  # q70 Generic Pair
  tc("q70","hello\n42","first: hello, second: 42"),
  tc("q70","java\n100","first: java, second: 100"),
  tc("q70","test\n0","first: test, second: 0",True),

  # q71 LinkedList Stack (LIFO)
  tc("q71","4\n1\n2\n3\n4","4\n3\n2\n1"),
  tc("q71","1\n7","7"),
  tc("q71","3\n5\n10\n15","15\n10\n5",True),

  # q72 TreeMap Sorted Keys
  tc("q72","3\nbanana 2\napple 5\ncherry 1","apple=5\nbanana=2\ncherry=1"),
  tc("q72","2\nzebra 1\nant 9","ant=9\nzebra=1"),
  tc("q72","1\nonly 3","only=3",True),

  # q73 PriorityQueue
  tc("q73","5\n5\n3\n8\n1\n4","1\n3\n4\n5\n8"),
  tc("q73","3\n9\n2\n6","2\n6\n9"),
  tc("q73","1\n42","42",True),

  # q74 Remove Duplicates Preserve Order
  tc("q74","6\napple\nbanana\napple\ncherry\nbanana\ndate","apple\nbanana\ncherry\ndate"),
  tc("q74","3\na\na\na","a"),
  tc("q74","4\nd\nc\nb\na","d\nc\nb\na",True),

  # q75 Balanced Parentheses
  tc("q75","{[()]}","Balanced"), tc("q75","([)]","Not Balanced"),
  tc("q75","{}[]()","Balanced"), tc("q75","{","Not Balanced",True),

  # q76 Collections.frequency
  tc("q76","5\n3\n1\n3\n2\n3\n3","3"),
  tc("q76","4\n1\n2\n3\n4\n5","0"),
  tc("q76","3\n7\n7\n7\n7","3",True),

  # q77 Map Entry Filter
  tc("q77","4\nAlice 90\nBob 70\nCarol 85\nDave 60","Alice: 90\nCarol: 85"),
  tc("q77","2\nEve 80\nFrank 79","Eve: 80"),
  tc("q77","2\nGrace 95\nHank 100","Grace: 95\nHank: 100",True),

  # q78 Deque as Queue (FIFO)
  tc("q78","4\n10\n20\n30\n40","10\n20\n30\n40"),
  tc("q78","1\n5","5"),
  tc("q78","3\n1\n2\n3","1\n2\n3",True),

  # q79 Group by First Letter
  tc("q79","5\napple\navocado\nbanana\nberry\napricot","a: [apple, apricot, avocado]\nb: [banana, berry]"),
  tc("q79","2\ncat\ncow","c: [cat, cow]"),
  tc("q79","3\nzebra\nyak\nzoo","y: [yak]\nz: [zebra, zoo]",True),

  # q80 Sort by Length
  tc("q80","4\nbanana\nkiwi\napple\nfig","fig\nkiwi\napple\nbanana"),
  tc("q80","3\na\nbb\nc","a\nc\nbb"),
  tc("q80","2\nhello\nhi","hi\nhello",True),

  # q81 Merge Deduplicate
  tc("q81","3\n3\n1\n4\n3\n1\n5\n9","1\n3\n4\n5\n9"),
  tc("q81","2\n1\n2\n2\n2\n3","1\n2\n3"),
  tc("q81","1\n5\n1\n5","5",True),

  # q82 Word Frequency Top N
  tc("q82","6\ncat\ndog\ncat\nbird\ndog\ncat","cat: 3\ndog: 2\nbird: 1"),
  tc("q82","3\na\nb\na","a: 2\nb: 1"),
  tc("q82","1\nx","x: 1",True),

  # q83 Parse Integer Safely
  tc("q83","42","Parsed: 42"), tc("q83","abc","NumberFormatException: invalid input"),
  tc("q83","0","Parsed: 0"), tc("q83","-7","Parsed: -7",True),

  # q84 Multi-catch
  tc("q84","10\n2\n5","5\n5"), tc("q84","10\n0\n5","ArithmeticException: / by zero"),
  tc("q84","10\n2\nhello","5\nNumberFormatException: invalid"),

  # q85 Finally
  tc("q85","4","25\nCleanup done"), tc("q85","0","Error: division by zero\nCleanup done"),
  tc("q85","10","10\nCleanup done",True),

  # q86 Chained Custom Exception
  tc("q86","80","Connection refused on port: 80"),
  tc("q86","1024",""),
  tc("q86","443","Connection refused on port: 443",True),

  # q87 Stack Overflow
  tc("q87","3","Done"), tc("q87","0","Done"),
  tc("q87","100000","StackOverflowError caught",True),

  # q88 Exception Message
  tc("q88","5\n0","/ by zero"), tc("q88","10\n2","5"),
  tc("q88","0\n0","/ by zero",True),

  # q89 Validate Positive
  tc("q89","-5","Number must be positive: -5"),
  tc("q89","10","Valid: 10"), tc("q89","0","Number must be positive: 0"),
  tc("q89","1","Valid: 1",True),

  # q90 Re-throw as RuntimeException
  tc("q90","abc","Parse failed: abc"), tc("q90","123","Parse failed: 123"),

  # q91 Exception in Loop
  tc("q91","4\n10\nhello\n7\nworld","10\nskip\n7\nskip"),
  tc("q91","2\n5\n5","5\n5"),
  tc("q91","3\nfoo\n42\nbar","skip\n42\nskip",True),

  # q92 Stream Distinct
  tc("q92","6\n5\n3\n5\n1\n3\n2","5\n3\n1\n2"),
  tc("q92","3\n1\n1\n1","1"),
  tc("q92","4\n4\n3\n2\n1","4\n3\n2\n1",True),

  # q93 Stream Count Matching
  tc("q93","5\n5\n15\n3\n20\n8","2"),
  tc("q93","3\n11\n12\n13","3"),
  tc("q93","3\n1\n2\n3","0",True),

  # q94 Stream Map to String
  tc("q94","3\n1\n2\n3","num_1\nnum_2\nnum_3"),
  tc("q94","1\n42","num_42"),
  tc("q94","2\n100\n200","num_100\nnum_200",True),

  # q95 Stream Reduce Product
  tc("q95","4\n2\n3\n4\n5","120"),
  tc("q95","3\n1\n2\n3","6"),
  tc("q95","1\n7","7",True),

  # q96 Stream Min Max
  tc("q96","5\n3\n7\n1\n9\n4","1\n9"),
  tc("q96","1\n5","5\n5"),
  tc("q96","3\n-2\n0\n2","-2\n2",True),

  # q97 Stream Average
  tc("q97","4\n10.0\n20.0\n30.0\n40.0","25.00"),
  tc("q97","2\n0.0\n100.0","50.00"),
  tc("q97","3\n1.0\n2.0\n3.0","2.00",True),

  # q98 BufferedReader Word Count
  tc("q98","hello world\nfoo bar baz","5"),
  tc("q98","one","1"),
  tc("q98","a b\nc d\ne f","6",True),

  # q99 Stream Sorted Descending
  tc("q99","5\n3\n1\n4\n1\n5","5\n4\n3\n1\n1"),
  tc("q99","3\n9\n2\n6","9\n6\n2"),
  tc("q99","1\n42","42",True),

  # q100 Stream Partition Even Odd
  tc("q100","6\n1\n2\n3\n4\n5\n6","Even: 2, 4, 6\nOdd: 1, 3, 5"),
  tc("q100","4\n2\n4\n6\n8","Even: 2, 4, 6, 8\nOdd: "),
  tc("q100","3\n1\n3\n5","Even: \nOdd: 1, 3, 5",True),
]


# ─────────────────────────────────────────────
# Insert
# ─────────────────────────────────────────────
existing_ids = {row[0] for row in db.execute(__import__('sqlalchemy').text("SELECT id FROM questions")).fetchall()}

new_questions = [q for q in questions if q.id not in existing_ids]
db.add_all(new_questions)
db.flush()

existing_tc_keys = set()
for row in db.execute(__import__('sqlalchemy').text("SELECT question_id, input_data FROM test_cases")).fetchall():
    existing_tc_keys.add((row[0], row[1]))

new_tcs = [t for t in test_cases if (t.question_id, t.input_data) not in existing_tc_keys]
db.add_all(new_tcs)
db.commit()

# Update topic total_questions
from sqlalchemy import func
for tid in ['t1','t2','t3','t4','t5','t6']:
    count = db.query(func.count(models.Question.id)).filter(models.Question.topic_id == tid).scalar()
    topic = db.query(models.Topic).filter(models.Topic.id == tid).first()
    if topic:
        topic.total_questions = count
db.commit()
db.close()

print(f"Inserted {len(new_questions)} questions, {len(new_tcs)} test cases.")
print("Topic breakdown:")
import subprocess, json
result = subprocess.run(
    ['sqlite3', './jlearn.db', 'SELECT topic_id, COUNT(*) FROM questions GROUP BY topic_id ORDER BY topic_id;'],
    capture_output=True, text=True)
print(result.stdout)
