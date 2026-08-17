//go:build js && wasm

package main

import (
	"encoding/json"
	"strconv"
	"syscall/js"

	"engineering-lens/systemdesign/internal/engine"
)

var (
	containerID  string
	topic        engine.Topic
	spec         engine.Spec
	state        = engine.RenderState{Mode: "visual", Failure: 0, PlaybackSpeed: 1}
	renderFunc   js.Func
	actionFunc   js.Func
	timerFunc    js.Func
	timerID      js.Value
	timerSet     bool
	timerFuncSet bool
)

func main() {
	renderFunc = js.FuncOf(renderTopic)
	actionFunc = js.FuncOf(handleAction)
	js.Global().Set("engineeringLensRenderSystemDesign", renderFunc)
	js.Global().Set("engineeringLensSystemDesignAction", actionFunc)
	js.Global().Set("engineeringLensSystemDesignReady", true)
	select {}
}

func renderTopic(this js.Value, args []js.Value) any {
	if len(args) < 2 {
		return false
	}
	containerID = args[0].String()
	var next engine.Topic
	if err := json.Unmarshal([]byte(args[1].String()), &next); err != nil {
		return false
	}
	stopPlayback()
	topic = next
	spec = engine.BuildSpec(topic)
	state = engine.RenderState{Mode: "visual", Failure: 0, PlaybackSpeed: 1}
	render()
	return true
}

func handleAction(this js.Value, args []js.Value) any {
	if len(args) == 0 {
		return nil
	}
	action := args[0].String()
	payload := ""
	if len(args) > 1 {
		payload = args[1].String()
	}

	switch action {
	case "mode":
		stopPlayback()
		state.Mode = payload
		if state.Mode == "playback" && state.Step >= len(spec.Steps) {
			state.Step = 0
		}
	case "next":
		stopPlayback()
		if state.Step < len(spec.Steps)-1 {
			state.Step++
		}
	case "prev":
		stopPlayback()
		if state.Step > 0 {
			state.Step--
		}
	case "step":
		stopPlayback()
		if value, err := strconv.Atoi(payload); err == nil && value >= 0 && value < len(spec.Steps) {
			state.Step = value
		}
	case "failure":
		if value, err := strconv.Atoi(payload); err == nil && value >= 0 && value < len(spec.Failures) {
			state.Failure = value
		}
	case "select":
		state.Selected = payload
	case "speed":
		if value, err := strconv.Atoi(payload); err == nil && value >= 1 && value <= 3 {
			state.PlaybackSpeed = value
			if state.Playing {
				startPlayback()
			}
		}
	case "play":
		if state.Playing {
			stopPlayback()
		} else {
			if state.Step >= len(spec.Steps)-1 {
				state.Step = 0
			}
			startPlayback()
		}
	}

	render()
	return nil
}

func render() {
	if containerID == "" {
		return
	}
	doc := js.Global().Get("document")
	container := doc.Call("getElementById", containerID)
	if container.IsNull() || container.IsUndefined() {
		return
	}
	container.Set("innerHTML", engine.RenderHTML(topic, spec, state))
}

func startPlayback() {
	stopPlayback()
	if len(spec.Steps) == 0 {
		return
	}
	state.Playing = true
	interval := 1600
	switch state.PlaybackSpeed {
	case 2:
		interval = 1050
	case 3:
		interval = 750
	}
	timerFunc = js.FuncOf(func(this js.Value, args []js.Value) any {
		if state.Step >= len(spec.Steps)-1 {
			stopPlayback()
			render()
			return nil
		}
		state.Step++
		render()
		return nil
	})
	timerFuncSet = true
	timerID = js.Global().Call("setInterval", timerFunc, interval)
	timerSet = true
}

func stopPlayback() {
	if timerSet {
		js.Global().Call("clearInterval", timerID)
		timerSet = false
		timerID = js.Value{}
	}
	if timerFuncSet {
		timerFunc.Release()
		timerFuncSet = false
		timerFunc = js.Func{}
	}
	state.Playing = false
}
