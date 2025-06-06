import { WebSocketServer, WebSocket } from "ws";
import type { Logger } from "../logging.js";
import { MusicServer } from "./music-server.js";
import { ServerClient } from "./server-client.js";

export class HTTPServer {
  private websocketServer: WebSocketServer | null = null;

  constructor(
    private musicServer: MusicServer,
    public port: number,
    private logger: Logger = console,
  ) {}

  // Start the WebSocket server
  start() {
    this.websocketServer = new WebSocketServer({ port: this.port });
    this.logger.log(`WebSocket server started on port ${this.port}`);

    this.websocketServer.on("connection", this.handleConnection.bind(this));
    this.websocketServer.on("error", (error) => {
      this.logger.error("WebSocket server error:", error);
    });
  }

  handleConnection(ws: WebSocket, request: any) {
    const playerClient = new ServerClient(ws, this.logger);
    this.musicServer.addClient(playerClient);
  }

  // Stop the WebSocket server
  stop() {
    this.musicServer.stop();

    if (this.websocketServer) {
      this.websocketServer.close(() => {
        this.logger.log("WebSocket server closed");
      });
      this.websocketServer = null;
    }
  }
}
