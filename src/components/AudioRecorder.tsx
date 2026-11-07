import React, { useState, useRef } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2, Sparkles } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioBase64: string, mimeType: string) => void;
  isLoading: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, isLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    setMicError(null);
    setAudioUrl(null);
    setRecordedBlob(null);
    chunksRef.current = [];
    setRecordSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setMicError('No se pudo acceder al micrófono. Por favor permite los permisos o usa las tarjetas táctiles.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setRecordedBlob(null);
    setRecordSeconds(0);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSendAudio = async () => {
    if (!recordedBlob) return;

    const reader = new FileReader();
    reader.readAsDataURL(recordedBlob);
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      onAudioReady(base64Data, recordedBlob.type);
    };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border-2 border-[#E3DAC9] shadow-sm text-center">
      <div className="mb-4">
        <h3 className="font-extrabold text-lg text-[#2B2625] flex items-center justify-center gap-2">
          <Volume2 className="w-5 h-5 text-[#B84A28]" />
          <span>Rimayta qillqay (Grabar Voz)</span>
        </h3>
        <p className="text-xs text-[#5C5450] mt-1">
          Habla en Quechua o Español sobre tu dolor o molestia.
        </p>
      </div>

      {micError && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-xl text-xs text-left border border-red-200">
          {micError}
        </div>
      )}

      {/* Recording Animation / Button Area */}
      <div className="my-4 flex flex-col items-center justify-center">
        {!isRecording && !audioUrl && (
          <button
            type="button"
            onClick={startRecording}
            disabled={isLoading}
            className="w-24 h-24 rounded-full bg-[#B84A28] hover:bg-[#8F3419] text-white flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 border-4 border-[#F6E9E4] cursor-pointer"
          >
            <Mic className="w-10 h-10 animate-pulse" />
            <span className="text-[11px] font-bold mt-1">GRABAR</span>
          </button>
        )}

        {isRecording && (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-xl animate-pulse border-4 border-red-200">
                <Square className="w-8 h-8 fill-current" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
              </span>
            </div>
            <div className="text-xl font-mono font-bold text-red-600">
              {formatTime(recordSeconds)}
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="px-6 py-2.5 bg-[#2B2625] text-white rounded-xl text-sm font-bold shadow-md hover:bg-black transition-all cursor-pointer"
            >
              Parar Grabación (Sayachiy)
            </button>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="w-full space-y-3">
            <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#E3DAC9] flex items-center justify-between">
              <audio src={audioUrl} controls className="h-10 w-full" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetRecording}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-[#E3DAC9] text-[#5C5450] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Volver a grabar</span>
              </button>

              <button
                type="button"
                onClick={handleSendAudio}
                disabled={isLoading}
                className="flex-2 py-3 px-4 rounded-xl bg-[#1E6B65] hover:bg-[#134844] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analizando con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analizar Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-[#5C5450]">
        Frase de ejemplo: <em>"Uma nanaywanmi kashani, iskay punchawña sinchita nanawan"</em>
      </div>
    </div>
  );
};
