// Import the necessary modules and Tailwind CSS
import React from 'react';


const TVScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-[30em] h-[30em] relative">
      <div className="flex flex-col items-center justify-center mt-[5em]">
        <div className="w-[5em] h-[5em] rounded-full border-2 border-black bg-[#f27405] mb-[-6em] relative z-[-1]">
          <div className="absolute bg-transparent w-[50px] h-[56px] ml-[1.68em] rounded-full rotate-[140deg] border-[4px] border-transparent shadow-inner shadow-[#a85103]"></div>
          <div className="absolute mt-[-9.4em] ml-[0.4em] rotate-[-25deg] w-[1em] h-[0.5em] rounded-full bg-[#f69e50]"></div>
          <div className="absolute mt-[0.2em] ml-[1.25em] rotate-[-20deg] w-[1.5em] h-[0.8em] rounded-full bg-[#f69e50]"></div>
        </div>
        <div className="relative flex flex-col items-center justify-center w-[17em] h-[9em] mt-[3em] rounded-lg bg-[#d36604] border-2 border-[#1d0e01] shadow-inner shadow-[#e69635]">
          <svg
            xmlSpace="preserve"
            viewBox="0 0 189.929 189.929"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute mt-[0.25em] ml-[-0.25em] w-[12px] h-[12px]"
          >
            <path
              d="M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13 C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z"
              className="fill-current text-black"
            />
          </svg>
          <div className="flex items-center justify-center w-auto h-auto rounded-lg shadow-[3.5px_3.5px_0px_#e69635]">
            <div className="w-[11em] h-[7.75em] flex items-center justify-center rounded-lg">
              <div className="w-[13em] h-[7.85em] border-2 border-[#1d0e01] rounded-lg flex items-center justify-center font-bold text-[#252525] tracking-wide text-center bg-gradient-to-r from-[#000] via-[#fff] to-[#000] animate-b">
                <span className="text-white">NOT FOUND</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-[0.5em] mt-[0.5em]">
            <div className="w-[2px] h-[0.5em] bg-black rounded-t-full"></div>
            <div className="w-[2px] h-[1em] bg-black rounded-t-full flex-grow"></div>
            <div className="w-[2px] h-[0.5em] bg-black rounded-t-full"></div>
          </div>
          <div className="flex flex-col items-center justify-center w-[4.25em] h-[8em] bg-[#e69635] border-2 border-[#1d0e01] p-[0.6em] rounded-lg shadow-[3px_3px_0px_#e69635]">
            <div className="relative w-[1.65em] h-[1.65em] rounded-full bg-[#7f5934] border-2 border-black shadow-inner shadow-[#b49577]">
              <div className="absolute top-[1em] left-[0.5em] rotate-[47deg] w-[0.1em] h-[0.4em] bg-[#000] rounded-sm"></div>
              <div className="absolute top-[0.9em] left-[0.8em] rotate-[47deg] w-[0.1em] h-[0.55em] bg-[#000] rounded-sm"></div>
              <div className="absolute top-[-0.1em] left-[0.65em] rotate-[45deg] w-[0.15em] h-[1.5em] bg-[#000]"></div>
            </div>
            <div className="relative w-[1.65em] h-[1.65em] rounded-full bg-[#7f5934] border-2 border-black shadow-inner shadow-[#b49577] mt-[0.75em]">
              <div className="absolute top-[1.05em] left-[0.8em] rotate-[-45deg] w-[0.15em] h-[0.4em] bg-[#000] rounded-sm"></div>
              <div className="absolute top-[-0.1em] left-[0.65em] rotate-[-45deg] w-[0.15em] h-[1.5em] bg-[#000]"></div>
            </div>
            <div className="flex flex-col items-center space-y-[0.5em] mt-[0.75em]">
              <div className="flex space-x-[0.25em]">
                <div className="w-[0.65em] h-[0.65em] rounded-full bg-[#7f5934] border-2 border-black shadow-inner shadow-[#b49577]"></div>
                <div className="w-[0.65em] h-[0.65em] rounded-full bg-[#7f5934] border-2 border-black shadow-inner shadow-[#b49577]"></div>
                <div className="w-[0.65em] h-[0.65em] rounded-full bg-[#7f5934] border-2 border-black shadow-inner shadow-[#b49577]"></div>
              </div>
              <div className="w-auto h-[2px] bg-[#171717]"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center w-full mt-[0.8em] space-x-[8.7em]">
          <div className="w-[2em] h-[1em] border-2 border-[#171717] bg-[#4d4d4d] mt-[-0.15em] z-[-1]"></div>
          <div className="w-[2em] h-[1em] border-2 border-[#171717] bg-[#4d4d4d] mt-[-0.15em] z-[-1]"></div>
          <div className="w-[17.5em] h-[0.15em] bg-[#171717] mt-[0.8em]"></div>
        </div>
      </div>
      <div className="absolute flex flex-row space-x-[6em] z-[-5] mb-[2em] items-center justify-center opacity-[0.5] text-center font-montserrat">
        <div className="transform scale-y-[24.5] scale-x-[9]">4</div>
        <div className="transform scale-y-[24.5] scale-x-[9]">0</div>
        <div className="transform scale-y-[24.5] scale-x-[9]">4</div>
      </div>
    </div>
  );
};

export default TVScreen;