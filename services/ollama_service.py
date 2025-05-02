# services/ollama_service.py
import subprocess
import logging

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self, model_name="deepseek-coder"):
        self.model_name = model_name

    def _call_ollama(self, prompt):
        try:
            result = subprocess.run(
                ["ollama", "run", self.model_name, prompt],
                capture_output=True,
                text=True,
                check=True
            )
            return {"response": result.stdout.strip()}
        except subprocess.CalledProcessError as e:
            error_message = e.stderr.strip() if e.stderr else "Unknown error occurred during Ollama execution"
            logger.error(f"Ollama model error: {error_message}")
            return {"error": error_message}

    def explain_code(self, code, language):
        prompt = f"""You are a coding expert. Please explain the following {language} code in detail:
```{language}
{code}
```"""
        return self._call_ollama(prompt)

    def optimize_code(self, code, language):
        prompt = f"""You are an expert programmer. Optimize the following {language} code and explain improvements:
```{language}
{code}
```"""
        return self._call_ollama(prompt)

    def debug_code(self, code, language):
        prompt = f"""You are a senior developer. Debug the following {language} code:
```{language}
{code}
```"""
        return self._call_ollama(prompt)

    def generate_documentation(self, code, language):
        prompt = f"""Generate complete documentation (functions, classes, purpose, etc.) for the following {language} code:
```{language}
{code}
```"""
        return self._call_ollama(prompt)

    def security_review(self, code, language):
        prompt = f"""You are a security analyst. Perform a security review of the following {language} code:
```{language}
{code}
```"""
        return self._call_ollama(prompt)
