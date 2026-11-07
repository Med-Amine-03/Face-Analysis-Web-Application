# Face Analysis Web App

Next.js frontend for the [Face Analysis API](https://github.com/Med-Amine-03/faceApi): take a photo with the webcam or upload one, and get the predicted **gender**, **age** and **emotion**.

Live demo: [face-analysis-web-application.vercel.app](https://face-analysis-web-application.vercel.app/)

## How it works

```
Webcam capture / image upload (Next.js)
            │
            ▼
POST /predict_all  →  FastAPI on Azure App Service (Docker)
            │            3 CNNs trained from scratch (TensorFlow / Keras)
            ▼
Gender · age · emotion displayed in the interface
```

Model results (validation): gender 88% accuracy, age MAE 6.7 years, emotion 60% accuracy on 7 classes. Training notebooks and details are in the [API repository](https://github.com/Med-Amine-03/faceApi).

## Tech stack

Next.js · React · TypeScript · Tailwind CSS · shadcn/ui · Vercel (frontend) · FastAPI · Docker · Azure (backend)

## Run it

```bash
git clone https://github.com/Med-Amine-03/Face-Analysis-Web-Application.git
cd Face-Analysis-Web-Application
npm install
npm run dev   # http://localhost:3000
```
