import { describe, it, expect, beforeEach } from "vitest"
import {
  useEmergencyStore,
  REQUIRED_FREEZE_PHRASE,
  MIN_JUSTIFICATION_LENGTH,
} from "../../src/store/useEmergencyStore"

describe("Emergency Freeze Store Logic", () => {
  beforeEach(() => {
    useEmergencyStore.setState({
      isPlatformFrozen: false,
      freezeStatus: null,
      verificationInput: "",
      justificationInput: "",
    })
  })

  it("handles verification phrase input and validation constants", () => {
    expect(REQUIRED_FREEZE_PHRASE).toBe("CONFIRM EMERGENCY PLATFORM FREEZE")
    expect(MIN_JUSTIFICATION_LENGTH).toBe(30)

    const store = useEmergencyStore.getState()
    store.setVerificationInput("CONFIRM EMERGENCY PLATFORM FREEZE")
    expect(useEmergencyStore.getState().verificationInput).toBe("CONFIRM EMERGENCY PLATFORM FREEZE")
  })

  it("tracks statutory justification text", () => {
    const reason = "Suspicious anomalous high-frequency withdrawal spike detected on Swiss node."
    const store = useEmergencyStore.getState()
    store.setJustificationInput(reason)

    expect(useEmergencyStore.getState().justificationInput).toBe(reason)
    expect(useEmergencyStore.getState().justificationInput.length).toBeGreaterThanOrEqual(
      MIN_JUSTIFICATION_LENGTH
    )
  })

  it("sets platform freeze status and frozen flag", () => {
    const store = useEmergencyStore.getState()
    expect(store.isPlatformFrozen).toBe(false)

    store.setFreezeStatus({
      isFrozen: true,
      frozenAt: "2026-09-28T14:00:00Z",
      frozenBy: "ADM-9912",
      officerName: "Eleanor Vance",
      reason: "Emergency kill-switch executed per FINMA Art. 88.",
    })

    const state = useEmergencyStore.getState()
    expect(state.isPlatformFrozen).toBe(true)
    expect(state.freezeStatus?.officerName).toBe("Eleanor Vance")
  })

  it("resets verification and justification inputs on form reset", () => {
    const store = useEmergencyStore.getState()
    store.setVerificationInput("CONFIRM")
    store.setJustificationInput("Reason text")

    store.resetForm()

    const state = useEmergencyStore.getState()
    expect(state.verificationInput).toBe("")
    expect(state.justificationInput).toBe("")
  })
})
