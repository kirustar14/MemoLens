import face_recognition
import os

# Load known images and encode them
known_face_encodings = []
known_face_names = []

dataset_dir = 'dataset'

for filename in os.listdir(dataset_dir):
    if filename.endswith(".jpg") or filename.endswith(".png"):
        image_path = os.path.join(dataset_dir, filename)
        image = face_recognition.load_image_file(image_path)
        encoding = face_recognition.face_encodings(image)

        if encoding:  # Sometimes faces aren't detected
            known_face_encodings.append(encoding[0])
            known_face_names.append(os.path.splitext(filename)[0])

# Load the image to test
test_image = face_recognition.load_image_file("test_image2.jpg")
test_encoding = face_recognition.face_encodings(test_image)[0]

# Compare with known faces
matches = face_recognition.compare_faces(known_face_encodings, test_encoding)

if True in matches:
    match_index = matches.index(True)
    name = known_face_names[match_index]
    print(f"Found: {name}")
else:
    print("Unknown person")
