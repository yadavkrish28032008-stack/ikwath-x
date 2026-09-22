# ============================================================
# iKWATH - WATER PREDICTION ENGINE
# ============================================================

FORMULATIONS = {

    "Amrtottara Kwatha Curna": {
        "ingredients": [
            "Sunthi",
            "Guduchi",
            "Haritaki"
        ],
        "water_factor": 8,
        "reduction_divisor": 4
    },

    "Ardhabilva Kwatha Curna": {
        "ingredients": [
            "Punarnava",
            "Sunthi",
            "Brihati",
            "Kantakari",
            "Apamarga",
            "Duralabha"
        ],
        "reference_powder": 15,
        "reference_water": 1500,
        "reduction_divisor": 2
    },

    "Aragvadhadi Kwatha Curna": {
        "ingredients": [
            "Aragvadha",
            "Nimba",
            "Patola",
            "Katuka"
        ],
        "reference_powder": 150,
        "reference_water": 1200,
        "reduction_divisor": 4
    },

    "Chinnodbhavadi Kwatha Curna": {
        "ingredients": [
            "Guduchi",
            "Vasa",
            "Kirataka",
            "Parpata",
            "Sunthi",
            "Musta",
            "Yavasaka"
        ],
        "water_factor": 8,
        "reduction_divisor": 4
    }
}


# ============================================================
# BOTANICAL SYNONYMS
# ============================================================

BOTANICAL_SYNONYMS = {
    "amrta": "guduchi",
    "amrita": "guduchi",
    "abhaya": "haritaki",
    "shunthi": "sunthi",
    "shunti": "sunthi"
}


# ============================================================
# NORMALIZE INGREDIENT NAME
# ============================================================

def normalize_ingredient(name):

    cleaned = (
        name
        .strip()
        .lower()
        .replace("-", "")
        .replace("_", "")
        .replace(" ", "")
    )

    return BOTANICAL_SYNONYMS.get(cleaned, cleaned)


# ============================================================
# GET ALL INGREDIENTS
# ============================================================

def get_all_ingredients():

    ingredients = set()

    for data in FORMULATIONS.values():

        for ingredient in data["ingredients"]:

            ingredients.add(ingredient)

    return sorted(ingredients)


# ============================================================
# DETECT FORMULATION
# ============================================================

def detect_formulation(selected_ingredients):

    if not selected_ingredients:

        return None


    selected = set(
        normalize_ingredient(item)
        for item in selected_ingredients
        if item.strip()
    )


    # --------------------------------------------------------
    # EXACT MATCH
    # --------------------------------------------------------

    for name, data in FORMULATIONS.items():

        formulation_ingredients = set(
            normalize_ingredient(item)
            for item in data["ingredients"]
        )

        if selected == formulation_ingredients:

            return name


    # --------------------------------------------------------
    # PARTIAL MATCH
    # --------------------------------------------------------

    best_formulation = None

    best_score = 0

    best_percentage = 0


    for name, data in FORMULATIONS.items():

        formulation_ingredients = set(
            normalize_ingredient(item)
            for item in data["ingredients"]
        )


        common = (
            selected
            .intersection(
                formulation_ingredients
            )
        )


        score = len(common)


        percentage = (
            score /
            len(formulation_ingredients)
        ) * 100


        if (
            score > best_score
            or
            (
                score == best_score
                and percentage > best_percentage
            )
        ):

            best_score = score

            best_percentage = percentage

            best_formulation = name


    # At least 2 ingredients
    if best_score >= 2:

        return best_formulation


    return None


# ============================================================
# CALCULATE WATER AND TARGET VOLUME
# ============================================================

def calculate_preparation(
    formulation,
    powder
):

    if formulation not in FORMULATIONS:

        raise ValueError(
            "Unknown formulation."
        )


    if powder <= 0:

        raise ValueError(
            "Powder quantity must be greater than 0."
        )


    data = FORMULATIONS[
        formulation
    ]


    # --------------------------------------------------------
    # WATER
    # --------------------------------------------------------

    if "water_factor" in data:

        water = (
            powder *
            data["water_factor"]
        )

    else:

        water = (
            powder *
            data["reference_water"]
            /
            data["reference_powder"]
        )


    # --------------------------------------------------------
    # TARGET VOLUME
    # --------------------------------------------------------

    divisor = (
        data["reduction_divisor"]
    )


    target_volume = (
        water /
        divisor
    )


    return {

        "formulation":
            formulation,

        "ingredients":
            data["ingredients"],

        "powder":
            round(
                powder,
                2
            ),

        "water":
            round(
                water,
                2
            ),

        "reduction":
            f"1/{divisor}",

        "target_volume":
            round(
                target_volume,
                2
            )

    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print()
    print("==========================================")
    print("       iKwath Water Prediction Engine")
    print("==========================================")
    print()

    print("Available Formulations:")

    for formulation in FORMULATIONS:

        print(
            " -",
            formulation
        )

    print()

    print("Available Ingredients:")

    for ingredient in get_all_ingredients():

        print(
            " -",
            ingredient
        )

    print()

    test = detect_formulation(
        [
            "Sunthi",
            "Guduchi",
            "Haritaki"
        ]
    )

    print(
        "Test Detection:",
        test
    )

    print()

    result = calculate_preparation(
        "Amrtottara Kwatha Curna",
        48
    )

    print(
        "Test Calculation:"
    )

    print(
        result
    )

    print()