import whisper
from pydub import AudioSegment
import ollama
from deep_translator import GoogleTranslator
import os

# Ensure Ollama is running locally
ollama_client = ollama.Client()

def process_audio(input_audio_path, llama_model="llama3.1"):
    """
    Processes an audio file and returns the transcription, detected language,
    translated text (if applicable), and Llama's response.
    
    Args:
        input_audio_path (str): Path to the input audio file.
        llama_model (str): Name of the Llama model for generating responses.
        
    Returns:
        dict: Contains the transcription, detected language, translated text,
              and Llama's response.
    """
    try:
        # Step 1: Convert input audio to WAV format
        converted_audio_path = "temp_audio.wav"
        audio = AudioSegment.from_file(input_audio_path)
        audio.export(converted_audio_path, format="wav")

        # Step 2: Transcribe the WAV audio file using Whisper
        model = whisper.load_model("medium")
        transcription_result = model.transcribe(converted_audio_path)
        transcription = transcription_result["text"]
        detected_language = transcription_result["language"]

        # Step 3: Translate to English if the detected language is not English
        if detected_language != "en":
            translated_text = GoogleTranslator(source=detected_language, target="en").translate(transcription)
        else:
            translated_text = transcription

        # Step 4: Pass the translated text to Llama (via Ollama)
        response = ollama_client.chat(
            model=llama_model,
            messages=[{"role": "user", "content": translated_text}]
        )
        llama_response = response["message"]["content"] if "message" in response and "content" in response["message"] else "No response from Llama."

        # Clean up temporary audio file
        if os.path.exists(converted_audio_path):
            os.remove(converted_audio_path)

        return {
            "transcription": transcription,
            "detected_language": detected_language,
            "translated_text": translated_text,
            "llama_response": llama_response,
        }

    except Exception as e:
        return {"error": str(e)}

# Example usage
if __name__ == "__main__":
    input_audio_path = r"D:\quat\chat\Nao_medical_backend\test_aud.mp3"
    result = process_audio(input_audio_path)
    if "error" in result:
        print(f"Error processing audio: {result['error']}")
    else:
        print(f"Transcription: {result['transcription']}")
        print(f"Detected Language: {result['detected_language']}")
        print(f"Translated Text: {result['translated_text']}")
        print(f"Llama's Response:\n{result['llama_response']}")
