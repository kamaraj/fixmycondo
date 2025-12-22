import os
import sys
import subprocess

with open("seed_output.txt", "w", encoding="utf-8") as f:
    try:
        result = subprocess.run([sys.executable, "seed_data.py"], capture_output=True, text=True, encoding="utf-8")
        f.write(result.stdout)
        f.write("\nSTDERR:\n")
        f.write(result.stderr)
    except Exception as e:
        f.write(str(e))
