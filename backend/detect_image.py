from ultralytics import YOLO
from pathlib import Path
import cv2
import json
import sys
import os

def calculate_risk(detected_objects):
    risk = 0
    recommendations = []

    # Extract object names
    names = [obj["name"] for obj in detected_objects]

    # Fire Extinguisher
    if "FireExtinguisher" not in names:
        risk += 5
        recommendations.append(
            "Fire extinguisher not detected. Verify emergency equipment."
        )
    else:
        recommendations.append(
            "Fire extinguisher detected."
        )

    # Oxygen Tank
    if "OxygenTank" in names:
        risk += 4
        recommendations.append(
            "Oxygen tank detected. Inspect storage conditions."
        )

    # Toolbox
    if "ToolBox" in names:
        recommendations.append(
            "Toolbox available for maintenance."
        )

    # Nothing detected
    if len(names) == 0:
        recommendations.append(
            "No trained equipment detected."
        )

    return min(risk, 10), recommendations

def infer_zone(image_name):
    name = image_name.lower()
    if "a" in name:
        return "Zone A"
    elif "b" in name:
        return "Zone B"
    elif "c" in name:
        return "Zone C"
    elif "d" in name:
        return "Zone D"
    return "Unknown"


this_dir = Path(__file__).parent

detect_path = this_dir / "runs" / "detect"
train_folders = [
    f for f in os.listdir(detect_path)
    if os.path.isdir(detect_path / f) and f.startswith("train")
]

model_path = detect_path / train_folders[0] / "weights" / "best.pt"

model = YOLO(model_path)

if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("Usage: python detect_image.py <image_path>")
        sys.exit()

    image_path = Path(sys.argv[1])

    if not image_path.exists():
        print("Image not found.")
        sys.exit()
    
    results = model.predict(
        source=str(image_path),
        conf=0.3,
        verbose=False
    )

    result = results[0]
    output_dir = this_dir / "predictions_web"
    output_dir.mkdir(exist_ok=True)

    annotated = result.plot()

    output_image = output_dir / image_path.name

    cv2.imwrite(str(output_image), annotated)

    detected_objects = []

    for box in result.boxes:
        detected_objects.append({
        	"name": model.names[int(box.cls)],
        	"confidence": round(float(box.conf), 3)
    	})

    risk, recommendations = calculate_risk(detected_objects)

    zone = infer_zone(image_path.name)

    response = {
    	"success": True,
    	"annotatedImage": "/predictions/" + image_path.name,
    	"objects": detected_objects,
    	"risk": risk,
    	"zone": zone,
    	"recommendations": recommendations
    }

    print(json.dumps(response))
