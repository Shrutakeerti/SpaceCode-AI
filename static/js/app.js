document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const responseContainer = document.getElementById("response-container");
  const loadingIndicator = document.getElementById("loading-indicator");
  const copyResponseBtn = document.getElementById("copy-response");
  const clearCodeBtn = document.getElementById("clear-code");
  const analysisButtons = document.querySelectorAll(".analysis-btn");
  const historyContainer = document.getElementById("history-container");

  // Initialize and load previous history
  loadHistory();

  // Add event listeners to analysis buttons
  analysisButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const requestType = this.getAttribute("data-type");
      const code = codeEditor.getValue();
      const language = document.getElementById("language-select").value;
      const aiModel = document.querySelector(
        'input[name="aiModel"]:checked'
      ).value;

      if (!code.trim()) {
        showError("Please enter some code to analyze.");
        return;
      }

      analyzeCode(code, language, aiModel, requestType);
    });
  });

  // Clear code button event
  clearCodeBtn.addEventListener("click", function () {
    codeEditor.setValue("");
    codeEditor.focus();
  });

  // Copy response button event
  copyResponseBtn.addEventListener("click", function () {
    // Get text content from response container (excluding welcome message if present)
    const responseText = responseContainer.querySelector(".welcome-message")
      ? "No content to copy yet!"
      : responseContainer.textContent;

    if (responseText === "No content to copy yet!") {
      showNotification("No content to copy!", "warning");
      return;
    }

    // Copy to clipboard
    navigator.clipboard
      .writeText(responseText)
      .then(() => {
        showNotification("Response copied to clipboard!", "success");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        showNotification("Failed to copy to clipboard.", "error");
      });
  });

  /**
   * Analyze code using the API
   * @param {string} code - The code to analyze
   * @param {string} language - The programming language
   * @param {string} aiModel - The AI model to use (openai or anthropic)
   * @param {string} requestType - The type of analysis (explain, optimize, debug, etc.)
   */
  function analyzeCode(code, language, aiModel, requestType) {
    // Show loading state
    showLoading(true);
    clearResponse();

    // Prepare request data
    const requestData = {
      code: code,
      language: language,
      ai_model: aiModel,
      request_type: requestType,
    };

    // Send API request
    fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        showLoading(false);

        if (data.error) {
          showError(data.error);
          return;
        }

        displayResponse(data.response);
        loadHistory(); // Refresh history after new response
      })
      .catch((error) => {
        showLoading(false);
        showError("An error occurred: " + error.message);
        console.error("Error analyzing code:", error);
      });
  }

  /**
   * Display the AI response in the response container
   * @param {string} response - The AI response text
   */
  function displayResponse(response) {
    // Format the response to properly handle code blocks and markdown-like formatting
    const formattedResponse = formatResponse(response);
    responseContainer.innerHTML = formattedResponse;

    // Highlight any code blocks in the response
    highlightCodeBlocks();
  }

  /**
   * Format the AI response with enhanced styling
   * @param {string} text - The raw response text
   * @returns {string} - The formatted HTML
   */
  function formatResponse(text) {
    if (!text) return "<p>No response received.</p>";

    // Replace code blocks with properly formatted and styled code
    let formatted = text
      // Replace markdown code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, function (match, language, code) {
        const lang = language || "plaintext";
        return `<pre class="code-block" data-language="${lang}"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
      })
      // Replace inline code
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // Convert line breaks to paragraphs
      .replace(/\n\n/g, "</p><p>")
      // Handle bullet points
      .replace(/\n- (.*)/g, "<br>• $1")
      // Handle numbered lists
      .replace(/\n(\d+)\. (.*)/g, "<br>$1. $2")
      // Handle headings (##, ###)
      .replace(/\n## (.*)/g, "</p><h3>$1</h3><p>")
      .replace(/\n### (.*)/g, "</p><h4>$1</h4><p>");

    // Wrap the formatted content in paragraphs if it's not already wrapped
    if (!formatted.startsWith("<")) {
      formatted = "<p>" + formatted + "</p>";
    }

    return formatted;
  }

  /**
   * Apply syntax highlighting to code blocks in the response
   */
  function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll(".code-block code");
    codeBlocks.forEach((block) => {
      const language = block.parentElement.getAttribute("data-language");
      block.classList.add(`language-${language}`);
      // You could use a library like Prism.js or Highlight.js here
      // For now, we'll just add some basic styling with our CSS
    });
  }

  /**
   * Load and display query history
   */
  function loadHistory() {
    fetch("/api/history")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error loading history:", data.error);
          return;
        }

        // Display history items
        displayHistory(data);
      })
      .catch((error) => {
        console.error("Error loading history:", error);
      });
  }

  /**
   * Display query history in the history container
   * @param {Array} historyItems - The history items to display
   */
  function displayHistory(historyItems) {
    if (!historyItems || historyItems.length === 0) {
      historyContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="mb-0"><i class="fas fa-satellite me-2"></i>Your coding journey history will appear here</p>
                </div>
            `;
      return;
    }

    let historyHtml = "";

    historyItems.forEach((item) => {
      const date = new Date(item.created_at);
      const formattedDate = date.toLocaleString();
      const codePreview =
        item.code.split("\n")[0].substring(0, 40) +
        (item.code.length > 40 ? "..." : "");

      historyHtml += `
                <div class="history-item" data-id="${item.id}">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="history-type ${item.request_type}">${
        item.request_type
      }</span>
                        <span class="history-time">${formattedDate}</span>
                    </div>
                    <div class="history-code">${escapeHtml(codePreview)}</div>
                </div>
            `;
    });

    historyContainer.innerHTML = historyHtml;

    // Add click event to history items
    document.querySelectorAll(".history-item").forEach((item) => {
      item.addEventListener("click", function () {
        const historyId = this.getAttribute("data-id");
        const historyItem = historyItems.find((h) => h.id == historyId);

        if (historyItem) {
          // Set the code editor with the historic code
          codeEditor.setValue(historyItem.code);

          // Set the language selector
          const languageSelect = document.getElementById("language-select");
          if (
            languageSelect.querySelector(
              `option[value="${historyItem.language}"]`
            )
          ) {
            languageSelect.value = historyItem.language;
            updateEditorMode(historyItem.language);
          }

          // Set the AI model
          const modelRadio = document.querySelector(
            `input[name="aiModel"][value="${historyItem.ai_model}"]`
          );
          if (modelRadio) {
            modelRadio.checked = true;
          }

          // Display the response
          clearResponse();
          displayResponse(historyItem.response);
        }
      });
    });
  }

  /**
   * Show error message in the response container
   * @param {string} message - The error message to display
   */
  function showError(message) {
    responseContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle text-danger me-2"></i>
                <p>${message}</p>
            </div>
        `;
  }

  /**
   * Toggle loading indicator
   * @param {boolean} isLoading - Whether to show or hide the loading indicator
   */
  function showLoading(isLoading) {
    if (isLoading) {
      loadingIndicator.classList.remove("d-none");
      responseContainer.classList.add("d-none");
    } else {
      loadingIndicator.classList.add("d-none");
      responseContainer.classList.remove("d-none");
    }
  }

  /**
   * Clear the response container
   */
  function clearResponse() {
    responseContainer.innerHTML = "";
  }

  /**
   * Show a notification toast
   * @param {string} message - The notification message
   * @param {string} type - The type of notification (success, warning, error)
   */
  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `cosmic-notification ${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getIconForType(type)} me-2"></i>
                <span>${message}</span>
            </div>
        `;

    // Add to body
    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Get appropriate icon for notification type
   * @param {string} type - The notification type
   * @returns {string} - The icon class
   */
  function getIconForType(type) {
    switch (type) {
      case "success":
        return "fa-check-circle";
      case "warning":
        return "fa-exclamation-triangle";
      case "error":
        return "fa-times-circle";
      default:
        return "fa-info-circle";
    }
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} unsafe - The unsafe string
   * @returns {string} - The escaped string
   */
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Add cosmic notification styles dynamically
  const style = document.createElement("style");
  style.textContent = `
        .cosmic-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: rgba(18, 24, 43, 0.95);
            border-left: 4px solid #03cffc;
            border-radius: 4px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            color: #fff;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 1000;
            backdrop-filter: blur(10px);
        }
        
        .cosmic-notification.show {
            transform: translateX(0);
        }
        
        .cosmic-notification.success {
            border-left-color: var(--success-color);
        }
        
        .cosmic-notification.warning {
            border-left-color: var(--warning-color);
        }
        
        .cosmic-notification.error {
            border-left-color: var(--danger-color);
        }
    `;
  document.head.appendChild(style);
});
