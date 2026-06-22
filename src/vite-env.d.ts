/// <reference types="vite/client" />

// Browser vendor extensions used across this project
interface Window {
  webkitSpeechRecognition: typeof SpeechRecognition;
  webkitAudioContext: typeof AudioContext;
  SpeechRecognition: typeof SpeechRecognition;
}
