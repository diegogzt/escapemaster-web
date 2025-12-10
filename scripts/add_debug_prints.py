import os

file_path = '../flowy-api/app/services/auth_service.py'

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'def reset_password(self, email: str, code: str, new_password: str):' in line:
        # We already added the lower().strip() line in previous run, so it might be there.
        # But let's just add the print after the next line (which should be the lower() line or docstring)
        pass
    
    if 'email = email.lower().strip()' in line and 'def reset_password' in "".join(lines[lines.index(line)-5:lines.index(line)]):
         new_lines.append(f'        print(f"DEBUG: reset_password email=\'{{email}}\'")\n')

# Actually, let's just rewrite the file cleanly to be sure.
# I will read the file, find the method, and inject the print.

content = "".join(lines)
if 'DEBUG: reset_password' not in content:
    # Find the line with email = email.lower().strip() inside reset_password
    # It's hard to find context with simple replace.
    # Let's just append the print after the normalization line.
    new_lines = []
    for line in lines:
        new_lines.append(line)
        if 'email = email.lower().strip()' in line:
             new_lines.append(f'        print(f"DEBUG: reset_password email=\'{{email}}\'")\n')
             new_lines.append(f'        user_check = self.db.query(User).filter(User.email == email).first()\n')
             new_lines.append(f'        print(f"DEBUG: User check result: {{user_check}}")\n')

    with open(file_path, 'w') as f:
        f.writelines(new_lines)
    print("Added debug prints to auth_service.py")
else:
    print("Debug prints already exist")
