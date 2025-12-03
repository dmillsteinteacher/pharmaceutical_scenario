/**
 * Closed-Form Analytic Solution for Expected Duration E(n)
 * Uses the formula for Expected Duration (number of steps T(n)) of a Gambler's Ruin/Random Walk
 * with cost C per step, when p != 0.5.
 *
 * E(n) = C * T(n)
 * T(n) = (1 / (p-q)) * [ (N * ( (q/p)^n - 1) / ( (q/p)^N - 1) ) - n ]
 *
 * @param {number} n The starting state.
 * @param {number} N The absorbing state (maximum state).
 * @param {number} p The probability of moving up (to n+1).
 * @param {number} C The cost per transition.
 * @returns {number} The analytic expected total cost E(n).
 */
function calculateAnalyticExpectedCost(n, N, p, C) {
    const q = 1 - p;

    // Check for the critical case p = 0.5
    if (Math.abs(p - 0.5) < 0.00001) {
        // Expected Duration for p=0.5 is T(n) = n * (N - n)
        const expectedSteps = n * (N - n);
        return C * expectedSteps;
    }

    // Standard solution for p != 0.5
    const ratio = q / p; // The ratio (q/p)
    const factor = 1 / (p - q); // 1 / (p-q)

    // Calculate T(n) (Expected Number of Steps)
    const numerator = N * (Math.pow(ratio, n) - 1);
    const denominator = Math.pow(ratio, N) - 1;

    const expectedSteps = factor * ( (numerator / denominator) - n );

    // Expected Cost E(n) = C * T(n)
    return C * expectedSteps;
}


/**
 * Runs a single random walk simulation trial.
 * @param {number} n0 The starting state.
 * @param {number} N The absorbing state (maximum state).
 * @param {number} p The probability of moving up (to n+1).
 * @param {number} C The cost per transition.
 * @returns {number} The total cost for this single trial.
 */
function runSingleTrial(n0, N, p, C) {
    let currentState = n0;
    let totalCost = 0;

    // The walk stops when it hits state 0 (Failure) or state N (Success)
    while (currentState > 0 && currentState < N) {
        // Increment cost for the transition
        totalCost += C;

        // Determine the next state
        if (Math.random() < p) {
            // Move up (towards Success)
            currentState += 1;
        } else {
            // Move down (towards Failure)
            currentState -= 1;
        }
    }

    return totalCost;
}


/**
 * Main function to run the Monte Carlo simulation and display results.
 */
function runSimulation() {
    // --- 1. Get Inputs and Validate ---
    const N = parseInt(document.getElementById('maxState').value);
    const n0 = parseInt(document.getElementById('startState').value);
    const p = parseFloat(document.getElementById('probP').value);
    const C = parseFloat(document.getElementById('costC').value);
    const T = parseInt(document.getElementById('numTrials').value);

    // Basic validation
    if (isNaN(N) || N <= 1 || N > 100) return alert("Max State (N) must be a positive integer.");
    if (isNaN(n0) || n0 < 1 || n0 >= N) return alert(`Start State (n₀) must be between 1 and ${N - 1}.`);
    if (isNaN(p) || p <= 0 || p >= 1) return alert("Prob. Up (p) must be strictly between 0 and 1.");
    if (isNaN(C) || C <= 0) return alert("Cost Per Transition (C) must be positive.");
    if (isNaN(T) || T < 1000 || T > 100000) return alert("Number of Trials (T) must be between 1,000 and 100,000.");


    const analyticResultElement = document.getElementById('analyticResult');
    const simulationResultElement = document.getElementById('simulationResult');

    analyticResultElement.textContent = 'Calculating...';
    simulationResultElement.textContent = 'Simulating...';


    // --- 2. Calculate Analytic Result ---
    const E_analytic = calculateAnalyticExpectedCost(n0, N, p, C);
    // Format as currency
    analyticResultElement.textContent = `$${E_analytic.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;


    // --- 3. Run Monte Carlo Simulation (Chunked for browser responsiveness) ---
    setTimeout(() => {
        let totalCostSum = 0;
        let trialsComplete = 0;

        // Chunking prevents the browser from freezing on large simulations
        const CHUNK_SIZE = 1000;

        function processChunk() {
            const trialsToRun = Math.min(T - trialsComplete, CHUNK_SIZE);

            for (let i = 0; i < trialsToRun; i++) {
                totalCostSum += runSingleTrial(n0, N, p, C);
            }

            trialsComplete += trialsToRun;

            if (trialsComplete < T) {
                // Update progress and schedule next chunk
                simulationResultElement.textContent = `Simulating... (${((trialsComplete / T) * 100).toFixed(0)}%)`;
                setTimeout(processChunk, 0); // Schedule next chunk immediately
            } else {
                // All trials complete
                const E_simulation = totalCostSum / T;
                // Format as currency
                simulationResultElement.textContent = `$${E_simulation.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            }
        }

        // Start the chunk processing
        processChunk();

    }, 10); // Initial slight delay
}

// Automatically calculate the analytic result when the page loads (using default values)
window.onload = function() {
    // A small delay to ensure all DOM elements are loaded
    setTimeout(() => {
        try {
            const N = parseInt(document.getElementById('maxState').value);
            const n0 = parseInt(document.getElementById('startState').value);
            const p = parseFloat(document.getElementById('probP').value);
            const C = parseFloat(document.getElementById('costC').value);

            const E_analytic = calculateAnalyticExpectedCost(n0, N, p, C);
            const analyticResultElement = document.getElementById('analyticResult');
            analyticResultElement.textContent = `$${E_analytic.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        } catch (e) {
            console.error("Error during initial analytic calculation:", e);
            document.getElementById('analyticResult').textContent = 'Error calculating analytic result.';
        }
    }, 100);
};