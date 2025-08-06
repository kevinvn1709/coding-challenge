// Implementation A: Iterative approach using for loop
// Time Complexity: O(n) - we iterate through all numbers from 1 to n
// Space Complexity: O(1) - only using constant extra space for variables
function sum_to_n_a(n: number): number {
  // Handle edge cases
  if (n <= 0) return 0;
  
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Implementation B: Mathematical formula approach
// Time Complexity: O(1) - constant time operation using arithmetic series formula
// Space Complexity: O(1) - only using constant space
// Most efficient approach using the formula: sum = n * (n + 1) / 2
function sum_to_n_b(n: number): number {
  // Handle edge cases
  if (n <= 0) return 0;
  
  // Using arithmetic series formula: sum of 1 to n = n * (n + 1) / 2
  return (n * (n + 1)) / 2;
}

// Implementation C: Recursive approach
// Time Complexity: O(n) - we make n recursive calls
// Space Complexity: O(n) - call stack grows with each recursive call
// Functional programming style but least efficient due to call stack overhead
function sum_to_n_c(n: number): number {
  // Base cases
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  // Recursive case: n + sum of (n-1)
  return n + sum_to_n_c(n - 1);
}

// Test cases to verify all implementations work correctly
function runTests(): void {
  const testCases = [0, 1, 5, 10, 100, 1000];
  
  console.log("Testing all implementations:");
  console.log("n\tIterative\tFormula\t\tRecursive");
  console.log("-------------------------------------------");
  
  testCases.forEach(n => {
    const resultA = sum_to_n_a(n);
    const resultB = sum_to_n_b(n);
    const resultC = sum_to_n_c(n);
    
    console.log(`${n}\t${resultA}\t\t${resultB}\t\t${resultC}`);
    
    // Verify all implementations give the same result
    if (resultA === resultB && resultB === resultC) {
      console.log(`✓ All implementations agree for n=${n}`);
    } else {
      console.log(`✗ Implementations disagree for n=${n}`);
    }
  });
}

// Performance comparison (for demonstration)
function performanceTest(): void {
  const n = 10000;
  
  console.log(`\nPerformance test with n=${n}:`);
  
  // Test iterative approach
  const startA = performance.now();
  const resultA = sum_to_n_a(n);
  const endA = performance.now();
  
  // Test formula approach
  const startB = performance.now();
  const resultB = sum_to_n_b(n);
  const endB = performance.now();
  
  // Test recursive approach (with smaller n to avoid stack overflow)
  const startC = performance.now();
  const resultC = sum_to_n_c(n);
  const endC = performance.now();
  
  console.log(`Iterative (n=${n}): ${resultA} in ${(endA - startA).toFixed(4)}ms`);
  console.log(`Formula (n=${n}): ${resultB} in ${(endB - startB).toFixed(4)}ms`);
  console.log(`Recursive (n=${n}): ${resultC} in ${(endC - startC).toFixed(4)}ms`);
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };

if (require.main === module) {
  runTests();
  performanceTest();
}
