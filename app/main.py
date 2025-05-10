import face_recognition
import os

KNOWN_DIR = "/app/data/known_faces"
UNKNOWN_IMAGE_PATH = "/app/data/unknown_faces/IMG_0983.JPG"

def load_known_faces(directory):
    known_encodings = []
    known_names = []

    for filename in os.listdir(directory):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            path = os.path.join(directory, filename)
            image = face_recognition.load_image_file(path)
            encodings = face_recognition.face_encodings(image)

            if encodings:
                known_encodings.append(encodings[0])
                known_names.append(os.path.splitext(filename)[0])
                print(f"[INFO] Loaded encoding for {filename}")
            else:
                print(f"[WARN] No face found in {filename}")

    return known_encodings, known_names

def identify_unknown_face(known_encodings, known_names, unknown_path):
    image = face_recognition.load_image_file(unknown_path)
    unknown_encodings = face_recognition.face_encodings(image)

    if not unknown_encodings:
        print("[ERROR] No face found in unknown image.")
        return

    for unknown_encoding in unknown_encodings:
        results = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=0.45)
        distances = face_recognition.face_distance(known_encodings, unknown_encoding)

        print(f"[DEBUG] Face distances: {distances}")

        if any(results):
            best_match_index = distances.argmin()
            print(f"[RESULT] Match found: {known_names[best_match_index]} (Distance: {distances[best_match_index]:.2f})")
        else:
            print("[RESULT] No match found.")


if __name__ == "__main__":
    known_encodings, known_names = load_known_faces(KNOWN_DIR)
    identify_unknown_face(known_encodings, known_names, UNKNOWN_IMAGE_PATH)
