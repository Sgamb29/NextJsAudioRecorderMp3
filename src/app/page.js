'use client'
import styles from "./page.module.css";
import ClipCard from "./components/clipcard";
import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

class clipInfo {
  constructor(clipName, downloadLink, audio) {
    this.clipName = clipName;
    this.downloadLink = downloadLink;
    this.audio = audio;
  }
}

function getDateTimeString() {
    const dt = new Date();
    const dateTimeStr = `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}-${dt.getHours()}-${dt.getMinutes()}-${dt.getSeconds()}`;
    return dateTimeStr;
}


let clipCardInfoArray = [];


// clipCardInfoArray.push(new clipInfo("testey", "testy", "yoMama"));

export default function Home() {
  const [clipInfoArr, setClipInfoArr] = useState(clipCardInfoArray);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const ffmpegRef = useRef(null);
  const [recBtnColor, setRecBtnColor] = useState("");
  const [pauseBtnColor, setPauseBtnColor] = useState("");
  const [recBtnDisabled, setRecBtnDisabled] = useState(true);
  const [wakeLockHolder, setWakeLock] = useState(null);
  const [wakeSupported, setWakeSupported] = useState(false);
  const [wakeButtonText, setWakeButtonText] = useState("Keep Screen Awake");

  useEffect(() => {

    const initFFmpeg = async () => {
      const ff = new FFmpeg({ log: true });
      await ff.load();
      ffmpegRef.current = ff;
      console.log("ffmpeg is ready");
      setRecBtnDisabled(false);

    }
    initFFmpeg();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
          .getUserMedia(
              {
                  audio:
                  { 
                      channels: 2, 
                      autoGainControl: false, 
                      echoCancellation: false, 
                      noiseSuppression: false 
                  }
              }
          )
          .then((stream) => {
              const recorder = new MediaRecorder(stream);
              let chunks = [];
    
              recorder.ondataavailable = (e) => {
              chunks.push(e.data);
              };
    
                recorder.onstop = async (e) => {
                  console.log("recorder stopped");
                
                  let clipName = prompt("Enter a name for your sound clip, leave blank to use time of recording.");
                  if (clipName === "") {
                      clipName = getDateTimeString();
                  }
                  const blob = new Blob(chunks, {type: "audio/mp3; codecs=mp3"});
                  chunks = [];
                  

                  // Process Audio
                  const currentFfmpeg = ffmpegRef.current;
                  const inputFileName = "input.mp3";
                  const outputFileName = "output.mp3";

                  await currentFfmpeg.writeFile(inputFileName, await fetchFile(blob));
                  await currentFfmpeg.exec(["-i", inputFileName, outputFileName]);
                  const data = await currentFfmpeg.readFile(outputFileName);
                  const updatedBlob = new Blob([data.buffer], { type: "audio/mp3"});
                  const audioURL = window.URL.createObjectURL(updatedBlob);

                  setClipInfoArr((prev) => [...prev, new clipInfo(clipName, audioURL, audioURL),]);
                };

                setMediaRecorder(recorder);
          })
          .catch((err) => {
              console.log(`The follwing error occurred: ${err}`);
          });
    } else {
      console.log("Get user media not supported.");
    }
    
  }, []);





function startRecord() {
  if (mediaRecorder.state === "recording") {
    return;
  }
  mediaRecorder.start();
  console.log(mediaRecorder.state);
  console.log("recorder started");
  setRecBtnColor(styles.recBtnRed);

}

function pauseRecording() {
  if (mediaRecorder.state === "recording") {
    mediaRecorder.pause();
    setPauseBtnColor(styles.pauseBtnYellow);
    
} else if (mediaRecorder.state === "paused") {
    mediaRecorder.resume();
    setPauseBtnColor("");
} }

function stopRecording() {
  if (mediaRecorder.state === "recording" | mediaRecorder.state === "paused") {
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    console.log("recorder stopped");
    setRecBtnColor("");
  }
}

async function getWakeLock() {
  if (wakeLockHolder === null ) {
    if ("wakeLock" in navigator) {
      setWakeSupported(true);
      try {
        const wake = await navigator.wakeLock.request("screen");
        setWakeLock(wake);
        setWakeButtonText("Wake Lock is Active!");

      } catch (err) {
        setWakeButtonText("Error Setting Wake Lock, check battery settings.");
        console.log(`${err.name}, ${err.message}`);
      }
    } else {
      setWakeSupported(false);
      setWakeButtonText("Wake Lock Not Supported");
    }
} else {
  wakeLockHolder.release().then(() => {
    setWakeLock(null);
    setWakeButtonText("Keep Screen Awake")
  })
}
}


  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1><u>Audio Recorder Mp3</u></h1>
        <p><em>Warning: All unsaved audio clips will be lost on leaving or refreshing the page.</em></p>
        <button className={`${styles.controlButton} ${styles.optsBtn}`} onClick={getWakeLock}>{wakeButtonText}</button>
        <button className={`${styles.controlButton} ${recBtnColor}`} onClick={startRecord} disabled={recBtnDisabled}>Record</button>
        <button className={`${styles.controlButton} ${pauseBtnColor}`} onClick={pauseRecording}>Pause</button>
        <button className={styles.controlButton} onClick={stopRecording}>Stop</button>
        <div className="AudioCardContainer">
          { clipInfoArr.map(
            ( el, index) => (
              <ClipCard 
              clipName={el.clipName} 
              downloadLink={el.downloadLink}
              audio={el.audio}
              key={index}

              />
            )   
          )}
        </div>
      </main>
     
    </div>
  );
}
