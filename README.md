# Face Analysis Web Application

This project consists of a **FastAPI-based backend** and a **Next.js-based frontend** to perform face analysis, including **emotion detection**, **age estimation**, and **gender classification**.

---

## 🚀 Features

- Predict emotion, age, and gender from images
- RESTful API built with FastAPI
- Machine learning models trained for:
  - Emotion detection
  - Age estimation
  - Gender classification
- Dockerized for easy deployment
- Backend deployed to **Azure App Service** with Docker
- Frontend built with **Next.js** and deployed to **Vercel**

---
## ⚙️ Backend (API)

The backend is built with **FastAPI**. It serves endpoints to analyze images and return predictions for emotion, age, and gender.

### ✅ Steps

1. **Model Training**

   Models were trained beforehand for:
   - Emotion classification
   - Age estimation
   - Gender classification

2. **FastAPI Implementation**

   - Endpoints for predictions
   - Loads trained models
   - Returns JSON results

3. **Containerization with Docker**

   - A Dockerfile is used to package the FastAPI app.
   - Example build and run:

     ```bash
     docker build -t face-analysis-api .
     docker run -p 8000:8000 face-analysis-api
     ```

4. **Deployment on Azure**

   - Docker image is pushed to Docker Hub
   - Azure App Service (Web App for Containers) is configured to pull the image
   - Azure handles hosting and scaling

---

## 🌐 Frontend (Interface)

The interface is built with **Next.js**. It lets users upload images and see predictions.

- Built with React (Next.js)
- Calls the FastAPI backend via REST
- Deployed on **Vercel** for easy hosting

---