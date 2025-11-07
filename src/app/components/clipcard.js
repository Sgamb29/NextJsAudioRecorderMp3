'use client'
import { useEffect, useState } from "react";
import styles from "./clipcard.module.css";


export default function ClipCard(props) {
    const [aTime, setATime] = useState(0);
    const [buttonText, setButtonText] = useState("Play");
    const [aElement, setAElement] = useState(null);

    useEffect(() => {
        setAElement(new Audio(props.audio));
    }, []);
    
    function audioControl() {

        if (aElement.currentTime === aElement.duration) {
            resetAudioElement();
            return;
        }
       
        if (!aElement.paused) {
            aElement.pause();
            setATime(aElement.currentTime);
            setButtonText(`Resume`);
        } else {
            if (aTime !== 0) {
                aElement.currentTime = aTime;
            }
            aElement.play();
            setButtonText(`Pause`);
    }
    }

    function resetAudioElement() {
        aElement.currentTime = 0;
        aElement.pause();
        setButtonText("Play");
        setATime(0);
    }

    return (
        <div className={styles.card}>
            <p>{props.clipName}.mp3</p>
            {/* <audio className={styles.audioEl} src={props.audio} controls></audio> */}
            <button className={styles.audioLink} onClick={audioControl}>{buttonText} {props.clipName}.mp3</button>
            <button className={styles.audioLink} onClick={resetAudioElement}>Back</button>
            <a className={`${styles.audioLink} ${styles.downloadBtn}`} download={props.clipName} href={props.downloadLink}><em>Download: {props.clipName}.mp3</em></a>
        </div>
    )
}