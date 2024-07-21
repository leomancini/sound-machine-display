import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import WaveformVisualizer from "./WaveformVisualizer";
import Controls from "./Controls";

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  width: 200px;
  padding: 10px;
  margin: 20px;
  font-size: 16px;
  opacity: 0;
  position: absolute;
  top: 0;
`;

const WaveformVisualizerContainer = styled.div`
  margin-top: 4rem;
`;

const InfoDisplay = styled.div`
  margin-top: 3rem;
  text-align: center;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  h1 {
    font-size: 3rem;
    margin: 0;
  }

  h2 {
    font-size: 2rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    height: 3rem;
  }
`;

const App = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const inputRef = useRef(null);
  const [manifestFile, setManifestFile] = useState(null);
  const [manifestData, setManifestData] = useState(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (manifestFile) {
      fetch(manifestFile)
        .then((response) => response.json())
        .then((data) => {
          setManifestData(data);
        })
        .catch((error) => {
          console.error("Error fetching manifest file:", error);
        });
    }
  }, [manifestFile]);

  const handleValueChange = (value) => {
    setTimeLeft(null);
    setIsPlaying(false);
    const newAudioFile = `${process.env.PUBLIC_URL}/audio/${value}/audio.m4a`;
    setAudioFile(newAudioFile);
    const newManifestFile = `${process.env.PUBLIC_URL}/audio/${value}/manifest.json`;
    setManifestFile(newManifestFile);
    setIsPlaying(true);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setInputValue(value);
      if (value.length === 10) {
        handleValueChange(value);
      }
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("Text");
    if (/^\d{10}$/.test(pastedData)) {
      e.preventDefault();
      setInputValue(pastedData);
      handleValueChange(pastedData);
    }
  };

  const togglePlayPause = () => {
    if (audioFile) {
      setIsPlaying((prevState) => !prevState);
    }
  };

  const reset = () => {
    setTimeLeft(null);
    setIsPlaying(false);
    setAudioFile(null);
    setManifestFile(null);
    setManifestData(null);
    setInputValue("");
  };

  const onAudioEnded = () => {
    reset();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const updateTimeLeft = (currentTime, duration) => {
    if (duration) {
      setTimeLeft(duration - currentTime);
    }
  };

  return (
    <Container>
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="Enter 10-digit number"
        onBlur={() => inputRef.current.focus()}
      />
      <WaveformVisualizerContainer>
        <WaveformVisualizer
          audioFile={audioFile}
          refreshRate={100}
          smoothness={2}
          lineWidth={2}
          lineHeightFactor={500}
          lineColor="#00FF00"
          isPlaying={isPlaying}
          width={1920}
          height={480}
          updateTimeLeft={updateTimeLeft}
          handleAudioEnded={onAudioEnded}
        />
      </WaveformVisualizerContainer>
      {timeLeft !== null && timeLeft > 0 && manifestData && (
        <InfoDisplay>
          {manifestData.title && <h1>{manifestData.title}</h1>}
          <h2>{timeLeft !== null && timeLeft > 0 && formatTime(timeLeft)}</h2>
          <Controls
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            reset={reset}
          />
        </InfoDisplay>
      )}
    </Container>
  );
};

export default App;
