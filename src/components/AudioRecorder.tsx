import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, RotateCcw, Volume2, Sparkles, AlertCircle, Languages } from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioBase64: string, mimeType: string) => void;
  isLoading: boolean;
}

const WAVEFORM_BARS = 32;

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, isLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(WAVEFORM_BARS).fill(2));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const step = Math.floor(dataArray.length / WAVEFORM_BARS);
    const bars: number[] = [];
    for (let i = 0; i < WAVEFORM_BARS; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j];
      }
      bars.push(Math.max(2, (sum / step / 255) * 40));
    }
    setWaveformData(bars);
    animationRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    setAudioUrl(null);
    setRecordedBlob(null);
    chunksRef.current = [];
    setRecordSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

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
        stream.getTracks().forEach((track) => track.stop());
        audioCtx.close();
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      animationRef.current = requestAnimationFrame(updateWaveform);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setMicError('No se pudo acceder al micrófono. Permite los permisos o usa las tarjetas táctiles.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      analyserRef.current = null;
      setWaveformData(new Array(WAVEFORM_BARS).fill(2));
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setRecordedBlob(null);
    setRecordSeconds(0);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const handleSendAudio = () => {
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
    <div className="bg-white rounded-2xl p-5 border-2 border-[#E3DAC9] shadow-sm text-center space-y-4" role="region" aria-label="Grabador de voz para sintomas">
      <div>
        <h3 className="font-extrabold text-lg text-[#2B2625] flex items-center justify-center gap-2">
          <Volume2 className="w-5 h-5 text-[#B84A28]" />
          <span>Rimayta qillqay (Grabar Voz)</span>
        </h3>
        <p className="text-xs text-[#5C5450] mt-1">
          Habla en Quechua o Español sobre tu dolor o molestia.
        </p>
      </div>

      {/* Language hint */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-[#5C5450]">
        <span className="flex items-center gap-1 bg-[#FAF6EF] px-2.5 py-1 rounded-lg border border-[#E3DAC9]">
          <Languages className="w-3.5 h-3.5 text-[#1E6B65]" />
          Quechua
        </span>
        <span className="text-[#E3DAC9] font-bold">o</span>
        <span className="flex items-center gap-1 bg-[#FAF6EF] px-2.5 py-1 rounded-lg border border-[#E3DAC9]">
          <Languages className="w-3.5 h-3.5 text-[#B84A28]" />
          Español
        </span>
      </div>

      {micError && (
        <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs text-left border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{micError}</span>
        </div>
      )}

      {/* Recording States */}
      <div className="flex flex-col items-center justify-center">
        {!isRecording && !audioUrl && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={startRecording}
              disabled={isLoading}
              className="w-28 h-28 rounded-full bg-[#B84A28] hover:bg-[#8F3419] text-white flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 border-4 border-[#F6E9E4] cursor-pointer hover:shadow-xl disabled:opacity-50"
              aria-label="Iniciar grabacion de voz"
            >
              <Mic className="w-10 h-10" />
              <span className="text-[11px] font-bold mt-1">GRABAR</span>
            </button>
            <p className="text-[10px] text-[#5C5450]">Toca para comenzar</p>
          </div>
        )}

        {isRecording && (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Live waveform visualization */}
            <div className="flex items-center justify-center gap-[2px] h-16 w-full max-w-xs" aria-hidden="true">
              {waveformData.map((height, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-red-500 transition-all duration-75"
                  style={{ height: `${height}px`, opacity: 0.5 + (height / 40) * 0.5 }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              <span className="text-2xl font-mono font-black text-red-600 tabular-nums">
                {formatTime(recordSeconds)}
              </span>
            </div>

            <button
              type="button"
              onClick={stopRecording}
              className="px-8 py-3 bg-[#2B2625] text-white rounded-2xl text-sm font-bold shadow-md hover:bg-black transition-all cursor-pointer flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Sayachiy (Parar)</span>
            </button>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="w-full space-y-3">
            <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#E3DAC9]">
              <audio src={audioUrl} controls className="h-10 w-full" />
              <p className="text-[10px] text-[#5C5450] mt-1.5 font-medium">
                Duración: {formatTime(recordSeconds)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={resetRecording}
                disabled={isLoading}
                className="py-3 px-4 rounded-xl border-2 border-[#E3DAC9] text-[#5C5450] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Otra vez</span>
              </button>

              <button
                type="button"
                onClick={handleSendAudio}
                disabled={isLoading}
                className="py-3 px-4 rounded-xl bg-[#1E6B65] hover:bg-[#134844] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analizar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#FAF6EF] rounded-xl p-3 border border-[#E3DAC9] text-left space-y-1">
        <span className="text-[10px] font-bold text-[#5C5450] uppercase">Frases de ejemplo:</span>
        <p className="text-xs text-[#1E6B65] font-semibold italic">
          "Uma nanaywanmi kashani, iskay punchawña sinchita nanawan"
        </p>
        <p className="text-[11px] text-[#5C5450]">
          (Me duele la cabeza, llevo dos días con dolor fuerte)
        </p>
      </div>
    </div>
  );
};
