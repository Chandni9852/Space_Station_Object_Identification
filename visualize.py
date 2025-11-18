import os
import cv2
import pandas as pd
from pathlib import Path


class YoloVisualizer:
    MODE_TRAIN = 0
    MODE_VAL = 1
    MODE_PRED = 2
    def __init__(self, dataset_folder):
        self.dataset_folder = Path(dataset_folder)
        self.predictions_folder = self.dataset_folder/"predictions"
        self.summary_csv = self.predictions_folder/ "fire_ridk_summary.csv"

        classes_file = os.path.join(dataset_folder, "classes.txt")
        with open(classes_file, "r") as f:
            self.classes = f.read().splitlines()
        self.classes = {i: c for i, c in enumerate(self.classes)}
        self.set_mode(YoloVisualizer.MODE_PRED)
    
    def set_mode(self, mode=MODE_TRAIN):
        self.mode = mode
        if mode == self.MODE_TRAIN:
            self.images_folder = self.dataset_folder/"train"/"images"
            self.labels_folder = self.dataset_folder/"train"/"labels"
        elif mode == self.MODE_VAL:
            self.images_folder = self.dataset_folder/"val"/"images"
            self.labels_folder = self.dataset_folder/"val"/"labels"
        elif mode == self.MODE_PRED:
            self.images_folder = self.predictions_folder/"images"
            self.labels_folder = self.predictions_folder/"labels"
        '''self.num_images = len(os.listdir(self.images_folder))
        num_labels = len(os.listdir(self.labels_folder))
        self.label_names = sorted(os.listdir(self.labels_folder))
        self.image_names = sorted(os.listdir(self.images_folder))
        assert self.num_images == num_labels
        assert self.num_images > 0
        self.frame_index = 0'''
        self.image_names = sorted([f for f in os.listdir(self.images_folder) if f.endswith(('.jpg', '.png'))])
        self.label_names = sorted(os.listdir(self.labels_folder))
        self.num_images = len(self.image_names)
        assert self.num_images == len(self.label_names)
        assert self.num_images > 0
        self.frame_index = 0

        if self.mode == self.MODE_PRED and self.summary_csv.exists():
            self.summary_df = pd.read_csv(self.summary_csv)
        else:
            self.summary_df = None


    def next_frame(self):
        self.frame_index = (self.frame_index+1)% self.num_images
        '''if self.frame_index >= self.num_images:
            self.frame_index = 0
        elif self.frame_index < 0:
            self.frame_index = self.num_images - 1'''

    def previous_frame(self):
        self.frame_index = (self.frame_index - 1)% self.num_images
        '''if self.frame_index >= self.num_images:
            self.frame_index = 0
        elif self.frame_index < 0:
            self.frame_index = self.num_images - 1'''
    
    def seek_frame(self, idx):
        #image_file = os.path.join(self.images_folder, self.image_names[idx])
        #label_file = os.path.join(self.labels_folder, self.label_names[idx])
        #with open(label_file, "r") as f:
            #lines = f.read().splitlines()
        #image = cv2.imread(image_file)
        #for line in lines:
            #class_index, x, y, w, h = map(float, line.split())
            #cx = int(x * image.shape[1])
            #cy = int(y * image.shape[0])
            #w = int(w * image.shape[1])
            #h = int(h * image.shape[0])
            #x = cx - w // 2
            #y = cy - h // 2
            #cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            #cv2.putText(image, self.classes[int(class_index)], (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        #return image
        image_file = self.images_folder / self.image_names[idx]
        label_file = self.labels_folder / self.label_names[idx]
        with open(label_file, "r") as f:
            lines = f.read().splitlines()
        image = cv2.imread(str(image_file))
        for line in lines:
            class_index, x, y, w, h = map(float, line.split())
            cx = int(x * image.shape[1])
            cy = int(y * image.shape[0])
            w = int(w * image.shape[1])
            h = int(h * image.shape[0])
            x = cx - w // 2
            y = cy - h // 2
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(image, self.classes[int(class_index)], (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        if self.mode == self.MODE_PRED and self.summary_df is not None:
            image_name = self.image_names[idx]
            row = self.summary_df[self.summary_df['Image'] == image_name]
            if not row.empty:
                zone = row.iloc[0]['Zone']
                risk = row.iloc[0]['Risk Score']
                detected = row.iloc[0]['Detected Objects']
                overlay = f"{zone} | Risk Score: {risk} | Objects: {detected}"
                cv2.putText(image, overlay, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

        return image

    def run(self):
        while True:
            frame = self.seek_frame(self.frame_index)
            frame = cv2.resize(frame, (800, 600))
            cv2.imshow(f"Yolo Visualizer", frame)
            key = cv2.waitKey(0)
            if key == ord('q') or key == 27:
                break
            elif key == ord('d'):
                self.next_frame()
            elif key == ord('a'):
                self.previous_frame()
            elif key == ord('t'):
                self.set_mode(YoloVisualizer.MODE_TRAIN)
            elif key == ord('v'):
                self.set_mode(YoloVisualizer.MODE_VAL)
            elif key == ord('p'):
                self.set_mode(YoloVisualizer.MODE_PRED)
        cv2.destroyAllWindows()


if __name__ == "__main__":
    vis = YoloVisualizer(os.path.dirname(__file__))
    vis.run()
