type QlobSignals = "." | "/" | ":" | "*"


export class Qlobber {

  private qlob: QlobSignals
  private subscribe_events: string[] = []

  constructor(qlob: QlobSignals = "/") {
    this.qlob = qlob
  }

  setSubscribeEvent = (data: string) => {
    if (!this.subscribe_events.includes(data)) {
      this.subscribe_events.push(data)
    }
  }

  removeSubscribeEvent = (data: string) => {
    const event_index = this.subscribe_events.indexOf(data)

    if (event_index !== -1) {
      this.subscribe_events.splice(event_index, 1)
    }
  }

  getSubscribeEvent = () => {
    return this.subscribe_events
  }

}