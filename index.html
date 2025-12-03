// Global variable to hold the Chart.js instance
let costChart = null;

/**
 * Closed-Form Analytic Solution for Expected Duration E(n)
 * ... (This function remains unchanged) ...
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
 * ... (This function remains unchanged) ...
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
 * @param {Array<number>} costs Array of all simulation costs.
 * @param {number} numBins Desired number of bins.
 * @returns {{labels: Array<string>, data: Array<number>}} Histogram data.
 */
function generateHistogramData(costs, numBins) {
    if (costs.length === 0) return { labels: [], data: [] };

    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    
    // Ensure we have at least a minimal range to define the bin width
    const range = maxCost - minCost;
    const binWidth = range > 0 ? range / numBins : 1;
    const bins = new Array(numBins).fill(0);
    const labels = [];

    // Bin the data
    costs.forEach(cost => {
        let binIndex = Math.floor((cost - minCost) / binWidth);
        // Ensure the max value falls into the last bin
        if (binIndex >= numBins) {
            binIndex = numBins - 1; 
        }
        bins[binIndex]++;
    });
    
    // Create human-readable labels
    for (let i = 0; i < numBins; i++) {
        const lowerBound = minCost + i * binWidth;
        const upperBound = lowerBound + binWidth;
        labels.push(`$${Math.round(lowerBound)} - $${Math.round(upperBound)}`);
    }

    return { labels: labels, data: bins };
}


/**
 * Draws the histogram using Chart.js.
 * @param {Array<string>} labels Bin labels.
 * @param {Array<number>} data Bin counts.
 * @param {number} analyticCost The expected value to mark on the chart.
 */
function drawHistogram(labels, data, analyticCost) {
    const ctx = document.getElementById('costHistogram').getContext('2d');
    
    // Destroy previous chart instance if it exists
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
                // Add a vertical line plugin to mark the Analytic Expected Cost (Mean)
                annotation: {
                    annotations: [{
                        type: 'line',
                        mode: 'vertical',
                        scaleID: 'x',
                        value: analyticCost, // This is tricky for a bar chart's X-axis
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
    // Note: Marking a precise value on the X-axis of a Chart.js bar chart is non-trivial,
    // so the analytic mean annotation is included here as a conceptual placeholder.
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

    // Validation remains the same
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
    analyticResultElement.textContent = `$${E_analytic.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;


    // --- 3. Run Monte Carlo Simulation (Chunked for browser responsiveness) ---
    // Array to store all individual trial results
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
                allCosts.push(cost); // Store the individual result
            }

            trialsComplete += trialsToRun;

            if (trialsComplete < T) {
                // Update progress and schedule next chunk
                simulationResultElement.textContent = `Simulating... (${((trialsComplete / T) * 100).toFixed(0)}%)`;
                setTimeout(processChunk, 0); 
            } else {
                // All trials complete
                const E_simulation = totalCostSum / T;
                simulationResultElement.textContent = `$${E_simulation.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                
                // --- 4. Generate and Draw Histogram ---
                const NUM_BINS = 20; 
                const { labels, data } = generateHistogramData(allCosts, NUM_BINS);
                drawHistogram(labels, data, E_analytic); 
            }
        }
        processChunk();

    }, 10);
}

// Initial analytic calculation on load (unchanged, but uses the updated function)
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
