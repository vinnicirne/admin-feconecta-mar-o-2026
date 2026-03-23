import re

with open(r'c:\Users\THINKPAD\Desktop\01\components\app\profile\profile-client.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find occurrences of 'username' that are not preceded by a dot and not followed by a colon (so not a property name or access)
matches = re.finditer(r'(?<!\.)\busername\b(?!:)', content)

for match in matches:
    start = match.start()
    line_no = content[:start].count('\n') + 1
    print(f"Found at line {line_no}: {content[start-10:start+10]}")
