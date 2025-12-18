import Docker from "dockerode"
import EventEmitter from "events"

import { chain } from "stream-chain"
import { parser } from "stream-json/jsonl/Parser"

export function getEventStream(docker: Docker): EventEmitter {
  const emitter = new EventEmitter()

  opts = {
    type: "container",
  }

  docker.getEvents(opts, (err, rawStream) => {
    const stream = chain<any[]>([
      rawStream,
      parser()
    ])

    stream.on("data", (data) => {
      const event = data.value
      if (
        event.Type !== "container" ||
        (event.Action !== "start" && event.Action !== "stop")
      ) {
        return
      }

      emitter.emit(`${event.Type}.${event.Action}`, data.value)
    })
  })

  return emitter
}
