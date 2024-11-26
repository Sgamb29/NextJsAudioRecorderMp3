'use client'
import styles from "./clipcard.module.css";


export default function ClipCard(props) {
    return (
        <div className={styles.card}>
            <p>{props.clipName}</p>
            <audio className={styles.audioEl} src={props.audio} controls></audio>
            <a className={styles.audioLink} download={props.clipName} href={props.downloadLink}>Download: {props.clipName}</a>
        </div>
    )
}