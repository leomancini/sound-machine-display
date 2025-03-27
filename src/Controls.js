import React from "react";
import styled from "styled-components";

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  gap: 1rem;
`;

const Button = styled.button`
  width: 100px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  background-color: rgba(255, 255, 255, 0.5);
  color: rgba(0, 0, 0, 1);
  border-radius: 3rem;
  font-weight: bold;
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
  &:active {
    transform: scale(0.9);
  }
`;

const Controls = ({ isPlaying, togglePlayPause, reset }) => {
  return (
    <ControlsContainer>
      <Button onClick={reset}>Reset</Button>
      <Button onClick={togglePlayPause}>{isPlaying ? "Pause" : "Play"}</Button>
    </ControlsContainer>
  );
};

export default Controls;
