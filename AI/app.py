from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from typing import List
import torch
import torch.nn as nn
import torchvision
from torchvision import datasets
import torchvision.transforms as T
from PIL import Image
import io

device = "cuda" if torch.cuda.is_available() else "cpu"
model = torchvision.models.efficientnet_b4(weights='DEFAULT')

num_classes = 5
model.classifier = nn.Sequential(
    nn.Dropout(p=0.3, inplace=True),
    nn.Linear(model.classifier[1].in_features, num_classes)
    )
model.to(device)
    
state_dict = torch.load('./best_model.pth', map_location=torch.device('cpu'))
model.load_state_dict(state_dict)

model.eval()

def transform_image(image_bytes):
    transform = T.Compose([
        T.Resize((224, 224)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    return transform(image).unsqueeze(0)

app = FastAPI()

@app.get("/")
async def root():
    return 'hello'

@app.post("/predict")
async def predict_face_shape(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image_tensor = transform_image(image_bytes)
        
        with torch.no_grad():
            image_tensor = image_tensor.to(device)
            outputs = model(image_tensor)
            _, predicted = torch.max(outputs, 1)

            face_shapes = ['Heart', 'Oblong', 'Oval', 'Round', 'Square'] 
            predicted_shape = face_shapes[predicted.item()]

        return JSONResponse(content={"face_shape": predicted_shape})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
