# ============================================================
# iKWATH - SMART KWATHA PREPARATION BACKEND
# ============================================================

from flask import Flask, request, jsonify, send_from_directory
import os
import sys
import socket


# ============================================================
# PROJECT PATH
# ============================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)

sys.path.insert(0, CURRENT_DIR)
sys.path.insert(0, BASE_DIR)


# ============================================================
# IMPORT WATER PREDICTION ENGINE
# ============================================================

from water_prediction import (
    FORMULATIONS,
    detect_formulation,
    calculate_preparation
)


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)

MONITOR_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


# ============================================================
# PUBLIC LANDING PAGE
# ============================================================

@app.route("/")
@app.route("/landing")
@app.route("/landing_new")
def landing_page():

    return send_from_directory(
        MONITOR_DIR,
        "landing_new.html"
    )


# ============================================================
# OPERATOR LOGIN / GATEWAY
# ============================================================

@app.route("/login")
@app.route("/login/")
def login_page():

    return send_from_directory(
        MONITOR_DIR,
        "login.html"
    )


# ============================================================
# QR SCAN ENTRY / POD SCANNER
# ============================================================

@app.route("/scan")
@app.route("/scan/")
@app.route("/pod-scanner")
@app.route("/pod-scanner/")
def scan_page():

    return send_from_directory(
        MONITOR_DIR,
        "scan.html"
    )


# ============================================================
# EXISTING DASHBOARD
# ============================================================

@app.route("/dashboard")
@app.route("/dashboard/")
def dashboard_page():

    return send_from_directory(
        MONITOR_DIR,
        "dashboard.html"
    )


# ============================================================
# DEDICATED BATCH HISTORY
# ============================================================

@app.route("/batch-history")
@app.route("/batch-history/")
def batch_history_page():

    return send_from_directory(
        MONITOR_DIR,
        "batch_history.html"
    )


# ============================================================
# STATIC FILES
# ============================================================

@app.route("/<path:filename>")
def static_files(filename):

    return send_from_directory(
        MONITOR_DIR,
        filename
    )


# ============================================================
# GET ALL INGREDIENTS
# ============================================================

@app.route("/ingredients", methods=["GET"])
def ingredients():

    ingredients = set()

    for formulation in FORMULATIONS.values():

        for ingredient in formulation["ingredients"]:

            ingredients.add(ingredient)

    return jsonify({

        "success": True,

        "ingredients":
            sorted(list(ingredients))

    })


# ============================================================
# FORMULATION DETECTION
# ============================================================

@app.route(
    "/detect-formulation",
    methods=["POST"]
)
def detect():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error":
                    "No ingredient data received."

            }), 400


        selected_ingredients = data.get(
            "ingredients",
            []
        )


        if not selected_ingredients:

            return jsonify({

                "success": False,

                "error":
                    "Please enter ingredients."

            }), 400


        # --------------------------------------------
        # CLEAN INGREDIENTS
        # --------------------------------------------

        cleaned = []

        for ingredient in selected_ingredients:

            ingredient = (
                ingredient
                .strip()
                .lower()
            )

            if ingredient:

                cleaned.append(ingredient)


        # --------------------------------------------
        # DETECT FORMULATION
        # --------------------------------------------

        formulation = detect_formulation(
            cleaned
        )


        if not formulation:

            return jsonify({

                "success": False,

                "error":
                    "No matching formulation found."

            }), 404


        # --------------------------------------------
        # RETURN FORMULATION
        # --------------------------------------------

        formulation_data = FORMULATIONS[
            formulation
        ]


        return jsonify({

            "success": True,

            "formulation":
                formulation,

            "ingredients":
                formulation_data[
                    "ingredients"
                ]

        })


    except Exception as error:

        print(
            "Detection Error:",
            error
        )

        return jsonify({

            "success": False,

            "error":
                str(error)

        }), 500


# ============================================================
# WATER PREDICTION
# ============================================================

@app.route(
    "/calculate",
    methods=["POST"]
)
def calculate():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "error":
                    "No preparation data received."

            }), 400


        formulation = data.get(
            "formulation"
        )

        powder = data.get(
            "powder"
        )


        if not formulation:

            return jsonify({

                "success": False,

                "error":
                    "Formulation is required."

            }), 400


        if powder is None:

            return jsonify({

                "success": False,

                "error":
                    "Powder quantity is required."

            }), 400


        powder = float(
            powder
        )


        # --------------------------------------------
        # CALCULATE WATER + TARGET VOLUME
        # --------------------------------------------

        result = calculate_preparation(
            formulation,
            powder
        )


        return jsonify({

            "success": True,

            "data":
                result

        })


    except ValueError as error:

        return jsonify({

            "success": False,

            "error":
                str(error)

        }), 400


    except Exception as error:

        print(
            "Calculation Error:",
            error
        )

        return jsonify({

            "success": False,

            "error":
                str(error)

        }), 500


# ============================================================
# SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 55)
    print("       iKWATH SMART KWATHA PREPARATION")
    print("=" * 55)
    print()

    print(
        "Water Prediction Backend : CONNECTED"
    )

    print(
        "Formulation Detection    : CONNECTED"
    )

    print(
        "Temperature Control      : READY"
    )

    print(
        "Evaporation Monitor      : READY"
    )

    print(
        "Target Volume Detection  : READY"
    )

    try:
        import socket
        _s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        _s.connect(("8.8.8.8", 80))
        local_ipv4 = _s.getsockname()[0]
        _s.close()
    except Exception:
        local_ipv4 = "127.0.0.1"

    print("Server Access URLs (IPv4):")
    print(f"  • Local:   http://localhost:5000")
    print(f"  • Network: http://{local_ipv4}:5000")
    print()
    print("Press CTRL + C to stop server.")
    print()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )