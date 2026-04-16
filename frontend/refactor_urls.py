import glob
import re

base_dir = r"c:\Users\Monica\Documents\credit card scoring\credit card scoring\frontend\src\components"
files = glob.glob(f"{base_dir}\\*.jsx")

results = []

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content

    # If it uses fetch or axios with import.meta.env.VITE_API_URL || 'http://localhost:8000'
    # We replace that declaration with: const API = import.meta.env.VITE_API_URL;
    # Then we replace API_URL with API everywhere.
    
    # First, handle Register and Login where it was inline fetch
    content = re.sub(r"`\${import\.meta\.env\.VITE_API_URL \|\| 'http://localhost:8000'}/([^`]+)`", r"`${API}/\1`", content)
    
    # Handle the ones where it was const API_URL = ...
    content = re.sub(r"const API_URL = `\${import\.meta\.env\.VITE_API_URL \|\| 'http://localhost:8000'}`;", "", content)
    
    # We need to insert `const API = import.meta.env.VITE_API_URL;` at the top level
    
    # Rename API_URL to API if used anywhere else
    content = content.replace("API_URL", "API")
    
    # Ensure `const API = ...` exists before component
    if "const API = import.meta.env.VITE_API_URL;" not in content:
        # insert after imports
        imports_end = 0
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('import '):
                imports_end = i
        lines.insert(imports_end + 1, "\nconst API = import.meta.env.VITE_API_URL;\n")
        content = "\n".join(lines)
    
    # Remove any extra blank lines caused by replacing API_URL
    content = re.sub(r'\n\n\n+', '\n\n', content)

    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        name = file.split("\\")[-1]
        results.append(f"### {name}\n```jsx\n{content}\n```")

print("\n\n".join(results))
