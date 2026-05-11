class SocketService {
  socket: any;

  constructor() {
    this.socket = null;
  }

  initializeSocket = async () => {
    this.socket = null;
    console.log('Socket.io client is disabled in Expo managed workflow.');
  };

  emit(event: string, data: any = {}) {
    console.log('Socket emit skipped:', event, data);
  }

  on(event: string, cb: any) {
    console.log('Socket listener skipped:', event);
    return cb;
  }

  to(room: string, event: string, data: any = {}) {
    console.log('Socket room emit skipped:', room, event, data);
  }

  removeListener(listenerName: string) {
    console.log('Socket listener remove skipped:', listenerName);
  }
}

const SocketServices = new SocketService();
export default SocketServices;
