# Overview

## A Computer Vision-based intelligent safety system designed for space station environments 🚀

This project uses YOLOv8 to:

Detect critical safety equipment
Analyze zone-based fire risk
Provide actionable recommendations (like relocating fire extinguishers)


## 🎯 Key Features
### ✨ Object Detection

Fire Extinguishers
Oxygen Tanks
Toolboxes

### 📊 Risk Analysis

Zone-wise fire risk scoring
Intelligent hazard detection

### 🧠 Smart Suggestions

Recommends optimal relocation of safety equipment

### 🖼️ Visualization

Bounding boxes
Object labels
Risk score overlays
🖼️ Demo (Add Your Outputs Here)

📌 Tip: Add screenshots from your outputs folder here for best impact

## 🛠️ Tech Stack
Technology	Usage

Python 3.10	Core Language

YOLOv8 (Ultralytics)	Object Detection

OpenCV	Visualization

PyTorch	Deep Learning Backend

Pandas	Data Handling


## 📁 Project Structure

HackByte_Dataset/

│
├── ENV_SETUP/

│   ├── create_env.bat

│   ├── install_packages.bat

│   └── setup_env.bat
│

├── images/                # Input images

├── outputs/               # Prediction outputs

├── best.pt                # Trained YOLO model

├── predict.py             # Main script ⭐

├── utils/                 # Helper modules

└── README.md


## ⚙️ Environment Setup

🔹 Step 1: Open Anaconda Prompt

🔹 Step 2: Run Setup (only first time)

cd ENV_SETUP

setup_env.bat

▶️ Run the Project

1️⃣ Activate Environment
conda activate EDU

2️⃣ Navigate to Project
cd path_to_project

3️⃣ Run Detection
python predict.py


### 🧪 Test YOLO Installation
yolo

If CLI opens → everything is working ✅

📊 Output

📸 Annotated Images with:

Bounding Boxes

Labels

Risk Score

🖥️ Console Output:

Detected objects

Zone-based risk analysis

## 🧠 How It Works
flowchart LR

A[Input Image] --> B[YOLOv8 Detection]

B --> C[Object Classification]

C --> D[Zone Mapping]

D --> E[Risk Calculation]

E --> F[Suggestion Engine]

F --> G[Final Output Visualization]

## 🚀 Future Enhancements

🎥 Real-time video monitoring

🌐 Web dashboard (React + Flask)

📡 IoT sensor integration

🤖 Advanced ML-based risk prediction



👤 Author


Vanya Khurana
