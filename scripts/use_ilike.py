import os

file_path = '../flowy-api/app/services/auth_service.py'

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Replace exact match with ilike
    if 'user = self.db.query(User).filter(User.email == email).first()' in line:
        new_lines.append(line.replace('User.email == email', 'User.email.ilike(email)'))
    else:
        new_lines.append(line)

with open(file_path, 'w') as f:
    f.writelines(new_lines)

print("Updated auth_service.py to use ilike")
