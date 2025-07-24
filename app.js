// Get references to input fields and container
const initialCapitalInput = document.getElementById("initial-capital");
const tradeAmountInput = document.getElementById("trade-amount");
const profitInput = document.getElementById("trade-profit");
const lossInput = document.getElementById("trade-loss");
const resultInput = document.getElementById("total-loss-profit");
const finalCapitalInput = document.getElementById("final-capital");
const totalWinInput = document.getElementById("total-win");
const totalLossInput = document.getElementById("total-Loss");
const totalTradesInput = document.getElementById("total-trades");
const brokerReturnInput = document.getElementById("broker-return");
const stepNumberInput = document.getElementById("step-number");
const sheetBox = document.querySelector(".sheet-box");
const fullResetButton = document.getElementById("full-reset-button");
const resetListButton = document.getElementById("reset-list-button");

// Initialize global variables
let totalWin = 0;
let totalLoss = 0;
let profit = 0;
let loss = 0;
let baseTradeAmount = 0;
let capital = 0;
let consecutiveWins = 0;

// Utility function to update values dynamically with animation
function updateValueWithAnimation(inputElement, value) {
  inputElement.style.transition = "opacity 0.3s ease";
  inputElement.style.opacity = "0";
  setTimeout(() => {
    inputElement.value = value.toFixed(2);
    inputElement.style.opacity = "1";
  }, 300);
}

// Update all results dynamically
function updateResults() {
  const result = profit + loss; // Calculate net result
  const finalCapital = capital + result; // Final capital calculation
  const totalTrades = totalWin + totalLoss; // Total trades

  updateValueWithAnimation(profitInput, profit);
  updateValueWithAnimation(lossInput, loss);
  updateValueWithAnimation(resultInput, result);
  updateValueWithAnimation(finalCapitalInput, finalCapital);
  updateValueWithAnimation(totalWinInput, totalWin);
  updateValueWithAnimation(totalLossInput, totalLoss);
  updateValueWithAnimation(totalTradesInput, totalTrades);
}

// Add a new row to the trade table
function addTradeRow(tradeNumber, tradeAmount) {
  const row = document.createElement("div");
  row.classList.add("sheet-row");

  // Trade number column
  const tradeNumberCol = document.createElement("div");
  tradeNumberCol.classList.add("sheet-column", "column-1");
  tradeNumberCol.innerHTML = `<p>${tradeNumber}</p>`;

  // Result column with dropdown
  const resultCol = document.createElement("div");
  resultCol.classList.add("sheet-column", "column-2");
  resultCol.innerHTML = `
    <select>
      <option value="default">???</option>
      <option value="win">Win</option>
      <option value="loss">Loss</option>
    </select>
  `;
  const resultSelect = resultCol.querySelector("select");

  // Trade amount column
  const tradeAmountCol = document.createElement("div");
  tradeAmountCol.classList.add("sheet-column", "column-3");
  tradeAmountCol.innerHTML = `<p>${tradeAmount.toFixed(2)}</p>`;

  // Return column
  const returnCol = document.createElement("div");
  returnCol.classList.add("sheet-column", "column-4");
  const returnAmount = document.createElement("p");
  returnAmount.textContent = "0.00";
  returnCol.appendChild(returnAmount);

  // Append all columns to the row
  row.appendChild(tradeNumberCol);
  row.appendChild(resultCol);
  row.appendChild(tradeAmountCol);
  row.appendChild(returnCol);
  sheetBox.appendChild(row);

  // Handle result selection
  resultSelect.addEventListener("change", () => {
    const resultType = resultSelect.value;
    const brokerReturnPercentage =
      parseFloat(brokerReturnInput.value) / 100 || 0;
    const numberOfSteps = parseInt(stepNumberInput.value) || Infinity;

    if (resultType === "win") {
      consecutiveWins++;
      row.classList.add("win-row"); // Add win-row class
      const returnValue = tradeAmount * brokerReturnPercentage;
      returnAmount.textContent = returnValue.toFixed(2);

      profit += returnValue; // Add to profit
      totalWin++; // Increment win count
      capital += tradeAmount + returnValue;

      // Calculate next trade amount for win
      let nextTradeAmount = tradeAmount + returnValue;
      if (consecutiveWins >= numberOfSteps) {
        nextTradeAmount = baseTradeAmount;
        consecutiveWins = 0; // Reset consecutive wins
      }
      addTradeRow(tradeNumber + 1, nextTradeAmount);
    } else if (resultType === "loss") {
      consecutiveWins = 0;
      row.classList.add("loss-row"); // Add loss-row class
      returnAmount.textContent = `-${tradeAmount.toFixed(2)}`;

      loss -= tradeAmount; // Subtract from loss
      totalLoss++; // Increment loss count
      capital -= tradeAmount;

      // Reset trade amount for loss
      addTradeRow(tradeNumber + 1, baseTradeAmount);
    }

    updateResults(); // Update the result fields
  });
}

// Initialize the trade sheet
function initializeSheet() {
  // Reset variables
  totalWin = 0;
  totalLoss = 0;
  profit = 0;
  loss = 0;
  consecutiveWins = 0;
  capital = parseFloat(initialCapitalInput.value) || 0;
  baseTradeAmount = parseFloat(tradeAmountInput.value) || 0;

  // Error handling for invalid inputs
  if (isNaN(capital) || isNaN(baseTradeAmount)) {
    alert("Please enter valid numbers for Initial Capital and Trade Amount.");
    return;
  }

  // Clear previous rows
  sheetBox.innerHTML = `
    <div class="sheet-row sheet-row-header">
      <div class="sheet-column column-1 header"><p>N</p></div>
      <div class="sheet-column column-2 header"><p>Result</p></div>
      <div class="sheet-column column-3 header"><p>Trade Amount</p></div>
      <div class="sheet-column column-4 header"><p>Return</p></div>
    </div>
  `;

  // Add the first trade row
  if (baseTradeAmount > 0) {
    addTradeRow(1, baseTradeAmount);
  }

  // Reset displayed values
  updateResults();
}

// Full reset function
function fullReset() {
  if (confirm("Are you sure you want to perform a full reset? All data will be lost.")) {
    initialCapitalInput.value = "";
    tradeAmountInput.value = "";
    brokerReturnInput.value = "%";
    stepNumberInput.value = "";
    resetList();
  }
}

// Reset list function
function resetList() {
  if (confirm("Are you sure you want to reset the trade list?")) {
    initializeSheet();
  }
}

// Event listeners
initialCapitalInput.addEventListener("change", initializeSheet);
tradeAmountInput.addEventListener("change", initializeSheet);
fullResetButton.addEventListener("click", fullReset);
resetListButton.addEventListener("click", resetList);

// Add tooltips for better UX
document
  .getElementById("step-number")
  .setAttribute(
    "title",
    "The number of trades in a compounding cycle."
  );
document
  .getElementById("broker-return")
  .setAttribute(
    "title",
    "The percentage of profit you get from your broker for a winning trade."
  );
