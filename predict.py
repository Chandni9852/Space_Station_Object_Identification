'''from collections import defaultdict
import pandas as pd

from ultralytics import YOLO
from pathlib import Path
import cv2
import os
import yaml
import argparse


def calculate_risk(detected_objects):
    risk = 0
    if "Oxygen Tank" in detected_objects: risk += 4
    if "Fire Extinguisher" not in detected_objects: risk += 5
    if len(detected_objects) >= 4: risk += 1
    return min(risk, 10)

def infer_zone(image_name):
    name = image_name.lower()
    if "a" in name: return "Zone A"
    elif "b" in name: return "Zone B"
    elif "c" in name: return "Zone C"
    elif "d" in name: return "Zone D"
    return "Unknown"


# Function to predict and save images
def predict_and_save(model, image_path, output_path, output_path_txt):
    # Perform prediction
    results = model.predict(image_path,conf=0.5)

    result = results[0]
    # Draw boxes on the image
    img = result.plot()  # Plots the predictions directly on the image

    # Save the result
    cv2.imwrite(str(output_path), img)
    # Save the bounding box data
    with open(output_path_txt, 'w') as f:
        for box in result.boxes:
            # Extract the class id and bounding box coordinates
            cls_id = int(box.cls)
            x_center, y_center, width, height = box.xywh[0].tolist()
            
            # Write bbox information in the format [class_id, x_center, y_center, width, height]
            f.write(f"{cls_id} {x_center} {y_center} {width} {height}\n")

def live_camera_detection(model):
    print("🎥 Starting live camera detection... Press 'q' to quit.")
    cap = cv2.VideoCapture(0)  # use 0 for webcam
    if not cap.isOpened():
        print("❌ Error: Could not open camera.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Failed to capture frame from camera.")
            break

        # Run YOLO inference on the frame
        results = model.predict(source=frame, conf=0.5, verbose=False)
        annotated_frame = results[0].plot()

        # Display the annotated frame
        cv2.imshow("YOLOv8 Live Detection", annotated_frame)

        # Press 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("🟢 Camera detection stopped.")

if __name__ == '__main__': 
    parser = argparse.ArgumentParser()
    parser.add_argument('--live', action='store_true', help='Run live camera detection')
    args = parser.parse_args()
    this_dir = Path(__file__).parent
    os.chdir(this_dir)

    
    # check that the images directory exists
    if not images_dir.exists():
        print(f"Images directory {images_dir} does not exist")
        exit()

    if not images_dir.is_dir():
        print(f"Images directory {images_dir} is not a directory")
        exit()
    
    if not any(images_dir.iterdir()):
        print(f"Images directory {images_dir} is empty")
        exit()

    # Load the YOLO model
    detect_path = this_dir / "runs" / "detect"
    train_folders = [f for f in os.listdir(detect_path) if os.path.isdir(detect_path / f) and f.startswith("train")]
    if len(train_folders) == 0:
        raise ValueError("No training folders found")
    idx = 0
    if len(train_folders) > 1:
        choice = -1
        choices = list(range(len(train_folders)))
        while choice not in choices:
            print("Select the training folder:")
            for i, folder in enumerate(train_folders):
                print(f"{i}: {folder}")
            choice = input()
            if not choice.isdigit():
                choice = -1
            else:
                choice = int(choice)
        idx = choice

    model_path = detect_path / train_folders[idx] / "weights" / "best.pt"
    model = YOLO(model_path)

    if args.live:
        # 🔴 Run real-time live detection
        live_camera_detection(model)

    else:
        # 🟢 Run image-based prediction (your original flow)
        with open(this_dir / 'yolo_params.yaml', 'r') as file:
            data = yaml.safe_load(file)
            if 'test' in data and data['test'] is not None:
                images_dir = Path(data['test']) / 'images'
            else:
                print("No test field found in yolo_params.yaml, please add the test field.")
                exit()

        if not images_dir.exists() or not any(images_dir.iterdir()):
            print(f"❌ No images found in {images_dir}")
            exit()

    # Directory with images
    output_dir = this_dir / "predictions" # Replace with the directory where you want to save predictions
    output_dir.mkdir(parents=True, exist_ok=True)

    # Create images and labels subdirectories
    images_output_dir = output_dir / 'images'
    labels_output_dir = output_dir / 'labels'
    images_output_dir.mkdir(parents=True, exist_ok=True)
    labels_output_dir.mkdir(parents=True, exist_ok=True)

    summary_data = []
    zone_inventory = defaultdict(list)
    # Iterate through the images in the directory
    for img_path in images_dir.glob('*'):
        if img_path.suffix not in ['.png', '.jpg']:
            continue
        output_path_img = images_output_dir / img_path.name  # Save image in 'images' folder
        output_path_txt = labels_output_dir / img_path.with_suffix('.txt').name  # Save label in 'labels' folder
        predict_and_save(model, img_path, output_path_img, output_path_txt)
        # Read the label file and count detected objects
        detected_objects = []
        with open(output_path_txt, 'r') as f:
            for line in f:
                cls_id = int(line.strip().split()[0])
                detected_objects.append(model.names[cls_id])

        zone = infer_zone(img_path.name)
        risk_score = calculate_risk(detected_objects)

        # Store data per image
        summary_data.append({
        "Image": img_path.name,
        "Zone": zone,
        "Detected Objects": ", ".join(detected_objects),
        "Risk Score": risk_score
        })

        # Store per-zone equipment list
        zone_inventory[zone] += detected_objects

    # Save summary as CSV
    df = pd.DataFrame(summary_data)
    csv_path = output_dir / "fire_risk_summary.csv"
    df.to_csv(csv_path, index=False)
    print(f"🔥 Fire Risk Summary saved to {csv_path}")


    # 🔁 Equipment Relocation Suggestions
    print("\n🔁 Equipment Relocation Suggestions:")
    for zone, objects in zone_inventory.items():
        has_extinguisher = "Fire Extinguisher" in objects
        zone_risk = df[df["Zone"] == zone]["Risk Score"].max()
    
        if zone_risk >= 7 and not has_extinguisher:
            donor_found = False
            for donor_zone, donor_objects in zone_inventory.items():
                if donor_zone != zone and donor_objects.count("Fire Extinguisher") > 1:
                    print(f"➡️ Move Fire Extinguisher from {donor_zone} ➝ {zone}")
                    donor_found = True
                    break
            if not donor_found:
                print(f"⚠️ No spare extinguisher available to move to {zone}")

    


    print(f"Predicted images saved in {images_output_dir}")
    print(f"Bounding box labels saved in {labels_output_dir}")
    data = this_dir / 'yolo_params.yaml'
    print(f"Model parameters saved in {data}")
    metrics = model.val(data=data, split="test")'''


from collections import defaultdict
import pandas as pd
from ultralytics import YOLO
from pathlib import Path
import cv2
import os
import yaml

def calculate_risk(detected_objects):
    risk = 0
    if "Oxygen Tank" in detected_objects: risk += 4
    if "Fire Extinguisher" not in detected_objects: risk += 5
    if len(detected_objects) >= 4: risk += 1
    return min(risk, 10)

def infer_zone(frame_count):
    # Dummy zone name based on frame number, can customize as needed
    zones = ["Zone A", "Zone B", "Zone C", "Zone D"]
    return zones[frame_count % len(zones)]

if __name__ == '__main__':
    this_dir = Path(__file__).parent
    os.chdir(this_dir)

    detect_path = this_dir / "runs" / "detect"
    train_folders = [f for f in os.listdir(detect_path) if os.path.isdir(detect_path / f) and f.startswith("train")]
    if not train_folders:
        raise ValueError("No training folders found inside runs/detect/")

    model_path = detect_path / train_folders[-1] / "weights" / "best.pt"
    model = YOLO(model_path)

    output_dir = this_dir / "live_predictions"
    output_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(0)  # Use your default webcam
    if not cap.isOpened():
        print("❌ Unable to access webcam.")
        exit()

    frame_count = 0
    summary_data = []
    zone_inventory = defaultdict(list)

    print("🎥 Press 'q' to quit live detection.")
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Run YOLO inference
        results = model.predict(source=frame, conf=0.5, verbose=False)
        result = results[0]
        annotated_frame = result.plot()

        # Extract detected object names
        detected_objects = [model.names[int(box.cls)] for box in result.boxes]
        risk = calculate_risk(detected_objects)
        zone = infer_zone(frame_count)

        # Display risk on frame
        cv2.putText(annotated_frame, f"Zone: {zone}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,0), 2)
        cv2.putText(annotated_frame, f"Risk: {risk}/10", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255) if risk>=7 else (0,255,0), 2)

        # Show the annotated frame
        cv2.imshow("YOLO Live Detection", annotated_frame)

        # Save periodically
        if frame_count % 20 == 0:
            img_path = output_dir / f"frame_{frame_count}.jpg"
            cv2.imwrite(str(img_path), annotated_frame)
            summary_data.append({
                "Frame": frame_count,
                "Zone": zone,
                "Detected Objects": ", ".join(detected_objects),
                "Risk Score": risk
            })
            zone_inventory[zone] += detected_objects

        frame_count += 1

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    # Save CSV
    df = pd.DataFrame(summary_data)
    csv_path = output_dir / "live_fire_risk_summary.csv"
    df.to_csv(csv_path, index=False)
    print(f"🔥 Fire Risk Summary saved to {csv_path}")

    # Suggest extinguisher relocation
    print("\n🔁 Equipment Relocation Suggestions:")
    for zone, objects in zone_inventory.items():
        has_extinguisher = "Fire Extinguisher" in objects
        zone_risk = df[df["Zone"] == zone]["Risk Score"].max()
        if zone_risk >= 7 and not has_extinguisher:
            donor_found = False
            for donor_zone, donor_objects in zone_inventory.items():
                if donor_zone != zone and donor_objects.count("Fire Extinguisher") > 1:
                    print(f"➡️ Move Fire Extinguisher from {donor_zone} ➝ {zone}")
                    donor_found = True
                    break
            if not donor_found:
                print(f"⚠️ No spare extinguisher available to move to {zone}")

    print(f"🖼️ Saved frames in {output_dir}")
