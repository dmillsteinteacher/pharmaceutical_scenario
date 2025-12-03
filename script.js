// Global variable to hold the Chart.js instance
let costChart = null;

// Helper function to calculate the quartile value (Q1, Median, Q3)
function quartile(arr, q) {
    // Note: The array is assumed to be sorted before calling this function in calculateStats
    const sorted = arr; 
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (base < 0 || base >= sorted.length - 1) {
        return sorted[base];
    }

    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}

/**
 * Calculates the full set of empirical statistics.
 * @param {Array<number>} costs Array of all simulation costs.
 * @returns {Object} Empirical statistics.
 */
function calculateStats(costs) {
    if (costs.length === 0) {
        return { mean: 0, stdDev: 0, min: 0, q1: 0, median: 0, q3: 0, max: 0 };
    }

    // Sort is required for quartiles, and for simple min/max 
    // We use .slice() to create a copy so the original allCosts array is not mutated
    const sortedCosts = costs.slice().sort((a, b) => a - b);
    
    // Mean
    const mean = sortedCosts.reduce((a, b) => a + b, 0) / sortedCosts.length;

    // Standard Deviation
    const squaredDifferences = sortedCosts.map(cost => Math.pow(cost - mean, 2));
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / sortedCosts.length;
    const stdDev = Math.sqrt(variance);

    // Quartiles
    const min = sortedCosts[0];
    const max = sortedCosts[sortedCosts.length - 1];
    const q1 = quartile(sortedCosts, 0.25);
    const median = quartile(sortedCosts, 0.5);
    const q3 = quartile(sortedCosts, 0.75);

    return { mean, stdDev, min, q1, median, q3, max };
}

/**
 * Closed-Form Analytic Solution for Expected Duration E(n)
 */
function calculateAnalyticExpectedCost(n, N, p, C) {
    const q = 1 - p;
    if (Math.abs(p - 0.5) < 0.00001) {
        const expectedSteps = n * (N - n);
        return C * expectedSteps;
    }
    const ratio = q / p;
    const factor = 1 / (p - q);
    const numerator = N * (Math.pow(ratio, n) - 1);
    const denominator = Math.pow(ratio, N) - 1;
    const expectedSteps = factor * ( (numerator / denominator) - n );
    return C * expectedSteps;
}


/**
 * Runs a single random walk simulation trial.
 */
function runSingleTrial(n0, N, p, C) {
    let currentState = n0;
    let totalCost = 0;
    while (currentState > 0 && currentState < N) {
        totalCost += C;
        if (Math.random() < p) {
            currentState += 1;
        } else {
            currentState -= 1;
        }
    }
    return totalCost;
}

/**
 * Processes the raw cost data into bins for the histogram.
 */
function generateHistogramData(costs, numBins) {
    if (costs.length === 0) return { labels: [], data: [] };

    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    
    const range = maxCost - minCost;
    const binWidth = range > 0 ? range / numBins : 1;
    const bins = new Array(numBins).fill(0);
    const labels = [];

    costs.forEach(cost => {
        let binIndex = Math.floor((cost - minCost) / binWidth);
        if (binIndex >= numBins) {
            binIndex = numBins - 1; 
        }
        bins[binIndex]++;
    });
    
    for (let i = 0; i < numBins; i++) {
        const lowerBound = minCost + i * binWidth;
        const upperBound = lowerBound + binWidth;
        labels.push(`$${Math.round(lowerBound)} - $${Math.round(upperBound)}`);
    }

    return { labels: labels, data: bins };
}


/**
 * Draws the histogram using Chart.js.
 */
function drawHistogram(labels, data, analyticCost) {
    const ctx = document.getElementById('costHistogram').getContext('2d');
    
    if (costChart) {
        costChart.destroy();
    }
    
    costChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency (Cost Distribution)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: { display: true, text: 'Number of Trials (Frequency)' },
                    beginAtZero: true
                },
                x: {
                    title: { display: true, text: 'Cost Bin' }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (context) => `Cost Range: ${context[0].label}`,
                        label: (context) => `Frequency: ${context.formattedValue}`
                    }
                },
                annotation: {
                    annotations: [{
                        type: 'line',
                        mode: 'vertical',
                        scaleID: 'x',
                        value: analyticCost, 
                        borderColor: 'red',
                        borderWidth: 2,
                        label: {
                            content: `Analytic Mean: $${analyticCost.toFixed(2)}`,
                            enabled: true,
                            position: 'start'
                        }
                    }]
                }
            }
        }
    });
}


/**
 * Displays the calculated empirical statistics in the HTML table.
 * @param {Object} stats The statistics object returned from calculateStats.
 */
function displayEmpiricalStats(stats) {
    // Helper function for currency formatting
    const format = (value) => `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

    document.getElementById('stat_mean').textContent = format(stats.mean);
    document.getElementById('stat_stddev').textContent = format(stats.stdDev);
    document.getElementById('stat_min').textContent = format(stats.min);
    document.getElementById('stat_q1').textContent = format(stats.q1);
    document.getElementById('stat_median').textContent = format(stats.median);
    document.getElementById('stat_q3').textContent = format(stats.q3);
    document.getElementById('stat_max').textContent = format(stats.max);

    // Show the table now that it's populated
    document.getElementById('empiricalStats').style.display = 'block';
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

    // Validation
    if (isNaN(N) || N <= 1 || N > 100) return alert("Max State (N) must be a positive integer.");
    if (isNaN(n0) || n0 < 1 || n0 >= N) return alert(`Start State (n₀) must be between 1 and ${N - 1}.`);
    if (isNaN(p) || p <= 0 || p >= 1) return alert("Prob. Up (p) must be strictly between 0 and 1.");
    if (isNaN(C) || C <= 0) return alert("Cost Per Transition (C) must be positive.");
    if (isNaN(T) || T < 1000 || T > 100000) return alert("Number of Trials (T) must be between 1,000 and 100,000.");


    const analyticResultElement = document.getElementById('analyticResult');
    const simulationResultElement = document.getElementById('simulationResult');

    analyticResultElement.textContent = 'Calculating...';
    simulationResultElement.textContent = 'Simulating...';
    document.getElementById('empiricalStats').style.display = 'none'; // Hide stats during simulation


    // --- 2. Calculate Analytic Result ---
    const E_analytic = calculateAnalyticExpectedCost(n0, N, p, C);
    analyticResultElement.textContent = `$${E_analytic.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;


    // --- 3. Run Monte Carlo Simulation (Chunked for browser responsiveness) ---
    const allCosts = [];

    setTimeout(() => {
        let totalCostSum = 0;
        let trialsComplete = 0;
        const CHUNK_SIZE = 1000;

        function processChunk() {
            const trialsToRun = Math.min(T - trialsComplete, CHUNK_SIZE);

            for (let i = 0; i < trialsToRun; i++) {
                const cost = runSingleTrial(n0, N, p, C);
                totalCostSum += cost;
                allCosts.push(cost); 
            }

            trialsComplete += trialsToRun;

            if (trialsComplete < T) {
                simulationResultElement.textContent = `Simulating... (${((trialsComplete / T) * 100).toFixed(0)}%)`;
                setTimeout(processChunk, 0); 
            } else {
                // All trials complete
                const E_simulation = totalCostSum / T;
                simulationResultElement.textContent = `$${E_simulation.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                
                // --- 4. Calculate and Display Empirical Statistics ---
                const empiricalStats = calculateStats(allCosts);
                displayEmpiricalStats(empiricalStats);

                // --- 5. Generate and Draw Histogram ---
                const NUM_BINS = 20; 
                const { labels, data } = generateHistogramData(allCosts, NUM_BINS);
                drawHistogram(labels, data, E_analytic); 
            }
        }
        processChunk();

    }, 10);
}

// Initial analytic calculation on load
window.onload = function() {
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
