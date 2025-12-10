import os

file_path = '../flowy-api/app/services/auth_service.py'

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'def forgot_password(self, email: str):' in line:
        new_lines.append('        email = email.lower().strip()\n')
    if 'def reset_password(self, email: str, code: str, new_password: str):' in line:
        new_lines.append('        email = email.lower().strip()\n')

with open(file_path, 'w') as f:
    f.writelines(new_lines)

print("Updated auth_service.py")
