import os
import sys

# Compute directory paths to resolve the existing Flask app in iKwath_ML/evaporation_monitor
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(CURRENT_DIR)
MONITOR_DIR = os.path.join(REPO_ROOT, "iKwath_ML", "evaporation_monitor")
ML_DIR = os.path.join(REPO_ROOT, "iKwath_ML")

for path in (MONITOR_DIR, ML_DIR, REPO_ROOT):
    if path not in sys.path:
        sys.path.insert(0, path)

# Import the existing Flask app instance directly from evaporation_monitor/app.py
from app import app
