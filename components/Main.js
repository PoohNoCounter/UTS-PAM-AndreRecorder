import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { useState, useEffect } from "react";
import { Audio } from "expo-av";

export default function Main() {
  const [recording, setRecording] = useState(false);
  const [recorders, setRecorders] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== "granted") {
        ToastAndroid.show("Recording Failed", ToastAndroid.SHORT);
        ToastAndroid.show(
          "Permission to access microphone denied",
          ToastAndroid.SHORT
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      await recording.startAsync();
    } catch (error) {
      console.log(error);
    }
  };

  const stopRecording = async () => {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();

    let updateRecorders = [...recorders];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    updateRecorders.push({
      sound,
      status: formatTime(status.durationMillis),
      file: recording.getURI(),
    });

    setRecorders(updateRecorders);
  };

  const formatTime = (duration) => {
    let minutes = Math.floor(duration / 60000);
    let seconds = ((duration % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  return (
    <View style={style.container}>
      <View style={[style.box, style.buttonBox]}>
        <TouchableOpacity
          style={[style.button, { borderColor: recording ? "red" : "green" }]}
          onPressOut={recording ? stopRecording : startRecording}
        >
          <Text
            style={[style.buttonText, { color: recording ? "red" : "green" }]}
          >
            {recording ? "Stop" : "Start"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[style.box, style.sectionBox]}>
        {recorders.map((recorder, index) => {
          return (
            <View style={style.section} key={index}>
              <Text style={style.sectionText}>
                Recordings {index + 1} | {recorder.status}
              </Text>
              <TouchableOpacity
                style={style.sectionButton}
                onPress={() => {
                  recorder.sound.playAsync();
                }}
              >
                <Text style={[style.sectionButtonText, { color: "blue" }]}>
                  Play
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#aaa",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "5%",
  },
  box: {
    width: "100%",
    // backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5%",
  },
  buttonBox: {
    justifyContent: "center",
  },
  sectionBox: {
    justifyContent: "flex-end",
  },
  section: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: "5%",
    paddingVertical: "3%",
    marginBottom: "2%",
    backgroundColor: "#bbb",
    borderBottomWidth: 2,
  },
  button: {
    width: "60%",
    height: "30%",
    backgroundColor: "#ddd",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    borderWidth: 5,
  },
  buttonText: {
    fontSize: 20,
  },
});
