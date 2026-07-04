import subprocess

def run_cmd(args):
    res = subprocess.run(args, capture_output=True, text=True, cwd=r"c:\Users\pc\Documents\daro-mtaani")
    return f"COMMAND: {' '.join(args)}\nSTDOUT:\n{res.stdout}\nSTDERR:\n{res.stderr}\nEXIT CODE: {res.returncode}\n\n"

out = ""
out += run_cmd(["git", "config", "user.email", "eomondiwema254@gmail.com"])
out += run_cmd(["git", "config", "user.name", "wemaE"])
out += run_cmd(["git", "add", "-A"])
out += run_cmd(["git", "status"])
out += run_cmd(["git", "commit", "-m", "feat: 4-screen onboarding with name capture, simplified landing page, fix text visibility"])
out += run_cmd(["git", "push", "origin", "main"])

with open(r"c:\Users\pc\Documents\daro-mtaani\git_run_results.txt", "w", encoding="utf-8") as f:
    f.write(out)
