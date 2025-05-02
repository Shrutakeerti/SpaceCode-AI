let codeEditor;

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the CodeMirror editor
  initializeCodeEditor();

  // Setup language change event
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.addEventListener("change", function () {
      updateEditorMode(this.value);
    });
  }
});

/**
 * Initialize the CodeMirror code editor with default settings
 */
function initializeCodeEditor() {
  const editorElement = document.getElementById("code-editor");

  if (!editorElement) {
    console.error("Code editor element not found");
    return;
  }

  // Initialize CodeMirror
  codeEditor = CodeMirror(editorElement, {
    mode: "python",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 4,
    smartIndent: true,
    tabSize: 4,
    indentWithTabs: false,
    matchBrackets: true,
    autoCloseBrackets: true,
    lineWrapping: true,
    extraKeys: {
      Tab: function (cm) {
        if (cm.somethingSelected()) {
          cm.indentSelection("add");
        } else {
          cm.replaceSelection("    ", "end");
        }
      },
    },
  });

  // Set initial content with a helpful example
  const initialCode = `# Welcome to SpaceCode AI Assistant!
# Try this Python example or write your own code:

def fibonacci(n):
    """Generate the Fibonacci sequence up to n terms."""
    sequence = [0, 1]
    
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return sequence
    
    for i in range(2, n):
        next_number = sequence[i-1] + sequence[i-2]
        sequence.append(next_number)
    
    return sequence

# Test the function
result = fibonacci(10)
print(result)
`;

  codeEditor.setValue(initialCode);

  // Adjust editor size based on window resize
  window.addEventListener("resize", function () {
    codeEditor.refresh();
  });
}

/**
 * Update the editor mode based on the selected language
 * @param {string} language - The selected programming language
 */
function updateEditorMode(language) {
  // Map language selection to CodeMirror modes
  const modeMap = {
    python: "python",
    javascript: "javascript",
    html: "htmlmixed",
    css: "css",
    java: "clike",
    csharp: "clike",
    php: "php",
    ruby: "ruby",
    go: "go",
    swift: "swift",
  };

  // Get the appropriate mode
  const mode = modeMap[language] || "plaintext";

  // Set the editor mode
  codeEditor.setOption("mode", mode);

  // Provide example code based on language
  const examples = {
    python: `def greet(name):
    """Return a personalized greeting."""
    return f"Hello, {name}! Welcome to the coding universe."

# Example usage
result = greet("Space Explorer")
print(result)
`,
    javascript: `// A simple function to calculate factorial
function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

// Example usage
const result = factorial(5);
console.log(\`Factorial of 5 is \${result}\`);
`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Space Explorer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: white;
            background-color: #0a0e17;
        }
    </style>
</head>
<body>
    <h1>Welcome to the Space Explorer</h1>
    <p>Start your coding journey among the stars!</p>
</body>
</html>
`,
    css: `/* Space-themed styles */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background-color: #12182b;
    color: #e6e7f5;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.nebula-btn {
    background: linear-gradient(45deg, #7e57ff, #03cffc);
    color: white;
    border: none;
    padding: 0.5rem 1.25rem;
    border-radius: 6px;
    transition: all 0.3s ease;
}
`,
  };

  // If user hasn't entered any code yet, provide an example for the selected language
  if (
    !codeEditor.getValue().trim() ||
    codeEditor.getValue().includes("# Welcome to SpaceCode AI Assistant!")
  ) {
    if (examples[language]) {
      codeEditor.setValue(examples[language]);
    }
  }
}
