import re

with open(r'c:\Users\THINKPAD\Desktop\01\app\actions\interaction-actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find occurrences of 'username' that are not preceded by a dot and not followed by a colon
matches = re.finditer(r'(?<!\.)\busername\b(?!:)', content)

for match in matches:
    start = match.start()
    line_no = content[:start].count('\n') + 1
    print(f"Found {match.group()} at line {line_no}: ...{content[max(0, start-30):min(len(content), start+30)]}...")
