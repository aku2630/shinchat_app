import * as React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useLocation } from "react-router-dom";
import styles from "./Room.module.css";

export default function Room() {
  const location = useLocation();
  const state = location?.state || {};
  const { chatId, userId, username, voice } = state;
  const zpRef = React.useRef(null);

  const roomID = chatId || "12345";
  const userID = userId || "defaultUserID"; // Replace with a valid user ID
  const userName = username || "defaultUserName"; // Replace with a valid user name
  const appID = 1838521991;
  const serverSecret = "130d59a57648165460e5c226c188eaaf"; 

  const [callStarted, setCallStarted] = React.useState(false);

  const startCall = async (element) => {
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    zpRef.current = ZegoUIKitPrebuilt.create(kitToken);
    const zp = zpRef.current;

    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      turnOnCameraWhenJoining: voice ? false : true,
      showMyCameraToggleButton: voice ? false : true,
      showAudioVideoSettingsButton: voice ? false : true,
      showScreenSharingButton: voice ? false : true,
    });

    setCallStarted(true); // Set the flag to indicate that the call has started
  };

  React.useEffect(() => {
    return () => {
      if (zpRef.current && callStarted) {
        zpRef.current.destroy();
      }
    };
  }, [callStarted]);

  return (
    <div
      className={styles.roombg}
      ref={startCall}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
}
