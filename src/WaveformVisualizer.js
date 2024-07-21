/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Canvas = styled.canvas`
  border: 1px solid #000;
`;

const WaveformVisualizer = ({
  audioFile,
  refreshRate,
  smoothness,
  lineWidth,
  lineHeightFactor,
  lineColor,
  isPlaying,
  width,
  height,
  handleAudioEnded,
  updateTimeLeft,
}) => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const initializeAudioContext = () => {
    if (!audioContext) {
      const newAudioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const newAnalyser = newAudioContext.createAnalyser();
      setAudioContext(newAudioContext);
      setAnalyser(newAnalyser);

      const audioElement = audioRef.current;
      const audioSource =
        newAudioContext.createMediaElementSource(audioElement);
      audioSource.connect(newAnalyser);
      newAnalyser.connect(newAudioContext.destination);
      newAnalyser.fftSize = 2048;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");

    // Draw horizontal line in the middle of the canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = lineWidth;
    canvasCtx.strokeStyle = lineColor;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, canvas.height / 2);
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }, [lineWidth, lineColor, width, height]);

  useEffect(() => {
    if (analyser) {
      // Draw waveform on canvas
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext("2d");
      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);

      // Initialize variables for interpolation
      let lastDrawTime = 0;
      let previousDataArray = new Float32Array(bufferLength);

      // Easing function for interpolation
      const easeInOutQuad = (t) =>
        t < 0.25 ? 1 * t * t : -1 + (4 - 2 * t) * t;

      const draw = (timestamp) => {
        if (!canvasRef.current) return;

        if (timestamp - lastDrawTime >= refreshRate) {
          lastDrawTime = timestamp;
          previousDataArray = dataArray.slice();
          analyser.getFloatTimeDomainData(dataArray);
        }

        const interpolationFactor = easeInOutQuad(
          (timestamp - lastDrawTime) / refreshRate
        );

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = lineWidth;
        canvasCtx.strokeStyle = lineColor;
        canvasCtx.beginPath();

        const smoothnessLimited = Math.max(1, smoothness);
        const sliceWidth = (canvas.width * smoothnessLimited) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const interpolatedValue =
            previousDataArray[i] +
            (dataArray[i] - previousDataArray[i]) * interpolationFactor;
          const v = interpolatedValue * lineHeightFactor;
          const y = canvas.height / 2 + v;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();

        requestAnimationFrame(draw);
      };

      requestAnimationFrame(draw);

      audioRef.current.audioContext = audioContext;

      return () => {
        if (audioContext) audioContext.close();
      };
    }
  }, [audioContext, analyser, refreshRate, smoothness]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      audioElement.addEventListener("ended", handleAudioEnded);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("ended", handleAudioEnded);
      }
    };
  }, [audioFile, handleAudioEnded]);

  useEffect(() => {
    if (audioFile) {
      if (audioRef.current) {
        setIsLoaded(false);
        audioRef.current.load();
      }

      const audioElement = audioRef.current;

      const handleCanPlay = () => {
        setIsLoaded(true);
      };

      audioElement.addEventListener("canplay", handleCanPlay);

      return () => {
        audioElement.removeEventListener("canplay", handleCanPlay);
      };
    } else {
      // Reset audio element when audio file is removed
      audioRef.current.src = "";
      audioRef.current.load();
    }
  }, [audioFile]);

  useEffect(() => {
    if (isPlaying && isLoaded) {
      if (!initialized) {
        initializeAudioContext();
        setInitialized(true);
      }
      if (audioContext) {
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }
        // Play audio if it is loaded
        if (audioRef.current.readyState >= 3) {
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
        }
      }
    } else {
      if (audioContext) {
        audioRef.current.pause();
      }
    }
  }, [audioContext, isPlaying, initialized, isLoaded]);

  useEffect(() => {
    const audioElement = audioRef.current;
    const handleTimeUpdate = () => {
      updateTimeLeft(audioElement.currentTime, audioElement.duration);
    };

    if (audioElement) {
      audioElement.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [audioFile, isPlaying, updateTimeLeft]);

  return (
    <Container>
      <audio ref={audioRef} src={audioFile} crossOrigin="anonymous" />
      <Canvas ref={canvasRef} width={width} height={height} />
    </Container>
  );
};

export default WaveformVisualizer;
