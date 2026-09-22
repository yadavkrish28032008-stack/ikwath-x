import os
import sys
import importlib.util

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
MONITOR_DIR = os.path.join(ROOT_DIR, "iKwath_ML", "evaporation_monitor")
ML_DIR = os.path.join(ROOT_DIR, "iKwath_ML")

for path in (MONITOR_DIR, ML_DIR, ROOT_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

# Dynamically load the existing Flask application from evaporation_monitor/app.py
_app_file = os.path.join(MONITOR_DIR, "app.py")
_spec = importlib.util.spec_from_file_location("evaporation_monitor_app", _app_file)
_mod = importlib.util.module_from_spec(_spec)
sys.modules["evaporation_monitor_app"] = _mod
_spec.loader.exec_module(_mod)

# Expose the existing Flask app object
app = _mod.app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
