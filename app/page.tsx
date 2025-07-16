"use client"

import React from "react"
import { useState, useCallback } from "react"
import { Upload, Camera, AlertCircle, X, Sparkles, User, Calendar, Eye, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AnalysisResult {
  gender: {
    gender: string
    probability: number
  }
  emotion: {
    predicted_emotion: string
  }
  age: {
    predicted_age: number
  }
}

export default function FaceAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsAnalyzing(true)
    setError(null)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(
        "https://face-detction-api-hnfvf0h0cpgghjd8.canadacentral-01.azurewebsites.net/predict_all",
        {
          method: "POST",
          body: formData,
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to analyze image: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API Response:", data)

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from API")
      }

      const hasGender = data.gender && typeof data.gender === "object" && data.gender.gender
      const hasEmotion = data.emotion && typeof data.emotion === "object" && data.emotion.predicted_emotion
      const hasAge = data.age && typeof data.age === "object" && typeof data.age.predicted_age === "number"

      if (!hasGender || !hasEmotion || !hasAge) {
        console.error("Missing required fields in API response:", data)
        throw new Error("Incomplete data received from API")
      }

      setResults(data)
    } catch (err) {
      console.error("Analysis error:", err)
      if (err instanceof Error) {
        setError(`Failed to analyze image: ${err.message}`)
      } else {
        setError("Failed to analyze image. Please try again.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleImageUpload(files[0])
      }
    },
    [handleImageUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleImageUpload(files[0])
      }
    },
    [handleImageUpload],
  )

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)

      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: "user",
        },
        audio: false,
      })

      setStream(mediaStream)
      setIsCameraActive(true)

      setTimeout(() => {
        const video = document.getElementById("camera-video") as HTMLVideoElement
        if (video) {
          video.srcObject = mediaStream
          video.onloadedmetadata = () => {
            video.play().catch(console.error)
          }
        }
      }, 100)
    } catch (err) {
      console.error("Camera error:", err)
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setCameraError("Camera access denied. Please allow camera permissions and try again.")
        } else if (err.name === "NotFoundError") {
          setCameraError("No camera found. Please connect a camera and try again.")
        } else if (err.name === "NotReadableError") {
          setCameraError("Camera is being used by another application.")
        } else {
          setCameraError("Unable to access camera. Please check permissions and try again.")
        }
      } else {
        setCameraError("Unable to access camera. Please check permissions and try again.")
      }
      setIsCameraActive(false)
    }
  }, [stream])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
    setCameraError(null)
  }, [stream])

  const capturePhoto = useCallback(() => {
    const video = document.getElementById("camera-video") as HTMLVideoElement
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (video && context && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
      setSelectedImage(dataUrl)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
            handleImageUpload(file)
            stopCamera()
          }
        },
        "image/jpeg",
        0.9,
      )
    } else {
      setCameraError("Unable to capture photo. Please try again.")
    }
  }, [handleImageUpload, stopCamera])

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700 text-sm text-gray-300 mb-8">
            <Brain className="w-4 h-4 mr-2" />
            Features
          </div>
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight">
            Advanced AI tools for your
            <br />
            <span className="text-gray-400">facial analysis</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Unlock powerful insights with our AI-powered suite of tools designed to analyze facial features with
            precision and accuracy
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-light text-white mb-2">Real-time image analysis</h2>
              <p className="text-gray-400 text-sm">
                Upload your image or capture directly from camera for instant AI-powered facial recognition and analysis
              </p>
            </div>

            {isCameraActive ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Camera Active</span>
                  <Button onClick={stopCamera} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <video
                    id="camera-video"
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={capturePhoto}
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200"
                    >
                      <div className="w-10 h-10 bg-white rounded-full border-4 border-gray-300" />
                    </button>
                  </div>
                </div>
                {cameraError && (
                  <Alert className="bg-red-900/20 border-red-800">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <AlertDescription className="text-red-300">{cameraError}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : selectedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-white text-sm">Analyzing...</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => document.getElementById("file-input")?.click()}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                  >
                    Change Image
                  </Button>
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-gray-600 bg-gray-800/50"
                    : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/30"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-white font-medium mb-2">Drop your image here</h3>
                <p className="text-gray-400 text-sm mb-6">or click to browse from your device</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => document.getElementById("file-input")?.click()}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    Browse Files
                  </Button>
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                </div>
              </div>
            )}

            <input id="file-input" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            {error && (
              <Alert className="mt-4 bg-red-900/20 border-red-800">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-light text-white mb-2">AI Analysis Results</h2>
              <p className="text-gray-400 text-sm">
                Get comprehensive insights about emotions, demographics, and facial characteristics in real-time
              </p>
            </div>

            {isAnalyzing ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white font-medium">Processing Image</p>
                  <p className="text-gray-400 text-sm mt-1">Analyzing facial features...</p>
                </div>
              </div>
            ) : results ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">Analysis Complete</span>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-yellow-400" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-light text-white mb-2 capitalize">
                        {results.emotion?.predicted_emotion || "Unknown"}
                      </h3>
                      <p className="text-gray-400 text-sm">Primary Emotion Detected</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <User className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="text-xl font-light text-white mb-1">{results.gender?.gender || "Unknown"}</p>
                        <p className="text-xs text-gray-400">Gender</p>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Calendar className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="text-xl font-light text-white mb-1">{results.age?.predicted_age || "Unknown"}</p>
                        <p className="text-xs text-gray-400">Age</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-white font-medium mb-1">Ready to Analyze</p>
                  <p className="text-gray-400 text-sm">Upload an image to get started</p>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Age Detection Card */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-light text-white mb-2">Age Detection</h3>
                  <p className="text-gray-400 text-sm">
                    Predict age ranges using advanced computer vision algorithms trained on diverse datasets for
                    accurate demographic analysis
                  </p>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-light text-white mb-2">Gender Classification</h3>
                  <p className="text-gray-400 text-sm">
                    Binary gender classification using deep learning models with high precision and recall rates across
                    different ethnicities
                  </p>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-light text-white mb-2">Emotion Recognition</h3>
                  <p className="text-gray-400 text-sm">
                    Multi-class emotion detection identifying happiness, sadness, anger, surprise, fear, and neutral
                    expressions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
