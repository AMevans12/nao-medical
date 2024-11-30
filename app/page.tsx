"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import AudioPlayer from "react-h5-audio-player";
import Recorder from "recorder-js";
import "react-h5-audio-player/lib/styles.css";
import "./Updates.css"; // Import an external CSS file for additional styles

type Results = {
  detected_language: string;
  llama_response: string;
  transcription: string;
  translated_text: string;
};

const Updates = () => {
  const [recorder, setRecorder] = useState<Recorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Results | null>(null);

  const apiEnpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

  console.log(apiEnpoint)

  const recordingButtonRef = useRef<HTMLButtonElement>(null)

  // useEffect(() => {
  //   initializeRecorder()
  // }, [])

  // Initialize Recorder on Demand
  const initializeRecorder = async () => {
    if (!recorder) {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorderInstance = new Recorder(audioContext);
        recorderInstance.init(stream);
        setRecorder(recorderInstance);
        setError(null);
      } catch (err) {
        setError(
          "Failed to access microphone. Please allow microphone access."
        );
        console.error(err);
      }
    }
  };

  // Start Recording
  const startRecording = async () => {
    await initializeRecorder(); // Ensure the recorder is initialized
    if (recorder) {
      recorder.start();
      setIsRecording(true);
      setError(null);
    } else {
      console.log("errpr")
      // setError("Recorder initialization failed. Please refresh the page.");
      setTimeout(()=>{
        const refTartget = recordingButtonRef.current
        refTartget?.click()

      },0.000000001)
    }
  };

  // Stop Recording
  const stopRecording = async () => {
    if (recorder) {
      try {
        const { blob } = await recorder.stop();
        // Convert the blob to a File object
        const audioFile = new File([blob], "recording.mp3", { type: "audio/mp3" });
        setAudioFile(audioFile);
        const audioBlobURL = URL.createObjectURL(blob);
        setAudioURL(audioBlobURL); // Set for playback
      } catch (err) {
        setError("Failed to stop recording.");
        console.error(err);
      }
    }
    setIsRecording(false);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioURL(URL.createObjectURL(file)); // Create a URL for playback
      setError(null); // Clear any previous errors
    }
  };

  // Process Audio and send to API
  async function processAudio() {
    try {
      console.log(apiEnpoint)
      const formData = new FormData();
      if (!audioFile) return;
      formData.append("file", audioFile);
      setIsLoading(true);
      const response = await fetch(`${apiEnpoint}/process-audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const result = await response.json() as Results;
      setResults(result);
      console.log("Server response:", result);
    } catch (error) {
      console.error("Error processing audio:", error);
      console.error(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  const languageDictionary: Record<string, string> = {
    af: "Afrikaans",
    am: "Amharic",
    ar: "Arabic",
    as: "Assamese",
    az: "Azerbaijani",
    be: "Belarusian",
    bg: "Bulgarian",
    bn: "Bengali",
    br: "Breton",
    bs: "Bosnian",
    ca: "Catalan",
    cs: "Czech",
    cy: "Welsh",
    da: "Danish",
    de: "German",
    dz: "Dzongkha",
    el: "Greek",
    en: "English",
    eo: "Esperanto",
    es: "Spanish",
    et: "Estonian",
    eu: "Basque",
    fa: "Persian",
    fi: "Finnish",
    fo: "Faroese",
    fr: "French",
    ga: "Irish",
    gl: "Galician",
    gu: "Gujarati",
    he: "Hebrew",
    hi: "Hindi",
    hr: "Croatian",
    ht: "Haitian Creole",
    hu: "Hungarian",
    hy: "Armenian",
    id: "Indonesian",
    is: "Icelandic",
    it: "Italian",
    ja: "Japanese",
    jv: "Javanese",
    ka: "Georgian",
    kk: "Kazakh",
    km: "Khmer",
    kn: "Kannada",
    ko: "Korean",
    ku: "Kurdish",
    ky: "Kyrgyz",
    la: "Latin",
    lb: "Luxembourgish",
    lo: "Lao",
    lt: "Lithuanian",
    lv: "Latvian",
    mg: "Malagasy",
    mk: "Macedonian",
    ml: "Malayalam",
    mn: "Mongolian",
    mr: "Marathi",
    ms: "Malay",
    mt: "Maltese",
    nb: "Norwegian Bokmål",
    ne: "Nepali",
    nl: "Dutch",
    nn: "Norwegian Nynorsk",
    or: "Odia",
    pa: "Punjabi",
    pl: "Polish",
    ps: "Pashto",
    pt: "Portuguese",
    qu: "Quechua",
    ro: "Romanian",
    ru: "Russian",
    rw: "Kinyarwanda",
    se: "Northern Sami",
    si: "Sinhala",
    sk: "Slovak",
    sl: "Slovenian",
    sq: "Albanian",
    sr: "Serbian",
    st: "Sesotho",
    su: "Sundanese",
    sv: "Swedish",
    sw: "Swahili",
    ta: "Tamil",
    te: "Telugu",
    th: "Thai",
    tl: "Tagalog",
    tr: "Turkish",
    ug: "Uyghur",
    uk: "Ukrainian",
    ur: "Urdu",
    vi: "Vietnamese",
    vo: "Volapük",
    wa: "Walloon",
    xh: "Xhosa",
    zh: "Chinese",
    zu: "Zulu"
  };


  // Function to get the full name of a language given its code
  const getLanguageName = (code: string) => {
    return languageDictionary[code] || code;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br py-10 from-green-100 to-teal-300 flex items-center justify-center">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg md:w-1/3 w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">Updates Recorder</h1>
        <p className="text-center text-gray-600 mb-6">Record your updates or upload an audio file for playback.</p>

        {/* Recording Section */}
        <motion.div className="flex flex-col items-center space-y-4 mb-6" whileHover={{ scale: 1.05 }}>
          <div className="flex space-x-4">
            <button
            ref={recordingButtonRef}
              type="button"
              onClick={startRecording}
              disabled={isRecording}
              className={`px-4 py-2 rounded-lg text-white font-bold ${isRecording ? "bg-gray-400" : "bg-blue-500"} shadow-md`}
            >
              Start Recording
            </button>
            <button
              type="button"
              onClick={stopRecording}
              disabled={!isRecording}
              className={`px-4 py-2 rounded-lg text-white font-bold ${!isRecording ? "bg-gray-400" : "bg-red-500"} shadow-md`}
            >
              Stop Recording
            </button>
          </div>
        </motion.div>

        {/* File Upload Section */}
        <motion.div className="flex items-center space-x-4 mb-6" whileHover={{ scale: 1.05 }}>
          <label
            htmlFor="audioFile"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold shadow-md cursor-pointer"
          >
            Upload File
          </label>
          <input
            type="file"
            id="audioFile"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <p className="text-gray-700">{audioFile ? audioFile.name : "No file chosen"}</p>
        </motion.div>

        {/* Process Audio Button */}
        <motion.div className="mt-4" whileHover={{ scale: 1.05 }}>
          <button
            type="button"
            onClick={processAudio}
            className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold shadow-md"
          >
            Process Audio
          </button>
        </motion.div>

        {/* Loading Animation */}
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Error Message */}
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        {/* Audio Playback Section */}
        {audioURL && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Playback:</h2>
            <AudioPlayer
              src={audioURL}
              onPlay={() => console.log("Playing audio...")}
              customAdditionalControls={[]}
              showJumpControls={false}
            />
          </motion.div>
        )}

        {/* Results Display */}
        {/* Results Display */}
        {results && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Results:</h2>
            <ul className="space-y-3 text-gray-800">
              <li className="border-l-4 pl-3 border-blue-500 bg-gray-100 p-2 rounded shadow">
                <strong>Detected Language:</strong> {getLanguageName(results.detected_language)}
              </li>
              <li className="border-l-4 pl-3 border-green-500 bg-gray-100 p-2 rounded shadow">
                <strong>Llama Response:</strong> {results.llama_response}
              </li>
              <li className="border-l-4 pl-3 border-yellow-500 bg-gray-100 p-2 rounded shadow">
                <strong>Transcription:</strong> {results.transcription}
              </li>
              <li className="border-l-4 pl-3 border-yellow-500 bg-gray-100 p-2 rounded shadow">
                <strong>Translated Text:</strong> {results.translated_text}
              </li>
            </ul>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default Updates;
