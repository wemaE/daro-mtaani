import subprocess

def run_cmd(args):
    try:
        res = subprocess.run(args, capture_output=True, text=True, cwd=r"c:\Users\pc\Documents\daro-mtaani")
        return f"STDOUT:\n{res.stdout}\nSTDERR:\n{res.stderr}"
    except Exception as e:
        return f"ERROR: {str(e)}"

status = run_cmd(["git", "status"])
log = run_cmd(["git", "log", "--oneline", "-5"])
branch = run_cmd(["git", "branch", "-a"])

with open(r"c:\Users\pc\Documents\daro-mtaani\python_git_out.txt", "w", encoding="utf-8") as f:
    f.write(f"=== GIT STATUS ===\n{status}\n\n=== GIT LOG ===\n{log}\n\n=== GIT BRANCH ===\n{branch}\n")
