import os
import glob
import re

base_dir = r"c:\Users\Monica\Documents\credit card scoring\credit card scoring\frontend\src\components"

files = glob.glob(os.path.join(base_dir, "*.jsx"))

pattern1 = re.compile(r"'http://localhost:8000([^']*)'")
pattern2 = re.compile(r'"http://localhost:8000([^"]*)"')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_content = pattern1.sub(r"`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}\1`", content)
    new_content = pattern2.sub(r"`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}\1`", new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Modified: {filepath}")

print("Done")
