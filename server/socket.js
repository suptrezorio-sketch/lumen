import { Server } from "socket.io";

// Student state storage
const studentStates = new Map();

function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    }
  });

  // Map to store userId -> socket connection
  const userSockets = new Map();

  // Middleware to authenticate user via userId in handshake auth
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    const isAdmin = socket.handshake.auth.isAdmin === 'true';
    
    if (userId || isAdmin) {
      socket.userId = userId;
      socket.isAdmin = isAdmin;
      next();
    } else {
      next(new Error("Invalid credentials"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, isAdmin } = socket;

    if (isAdmin) {
      // Admin joins admins room
      socket.join('admins');
      console.log("Admin connected:", socket.id);
      
      // Send current student states to new admin
      const students = Array.from(studentStates.entries()).map(([id, state]) => ({
        userId: id,
        ...state,
      }));
      socket.emit('STUDENT_LIST', students);
    } else {
      // Regular user/student
      console.log("User connected:", socket.id, "with userId:", userId);
      userSockets.set(userId, socket);
      
      // Initialize student state
      if (!studentStates.has(userId)) {
        studentStates.set(userId, {
          online: true,
          currentRoute: '/home',
          balance: 0,
          callState: null,
          lastAction: null,
          lastSeen: new Date().toISOString(),
        });
      } else {
        studentStates.get(userId).online = true;
        studentStates.get(userId).lastSeen = new Date().toISOString();
      }
      
      // Notify admins of new student
      io.to('admins').emit('STUDENT_UPDATE', {
        userId,
        ...studentStates.get(userId),
      });
      
      // Student joins their own room for targeted commands
      socket.join(`student:${userId}`);
    }

    // Handle disconnection
    socket.on("disconnect", () => {
      if (isAdmin) {
        console.log("Admin disconnected:", socket.id);
      } else {
        console.log("User disconnected:", socket.id, "with userId:", userId);
        if (studentStates.has(userId)) {
          studentStates.get(userId).online = false;
          studentStates.get(userId).lastSeen = new Date().toISOString();
        }
        userSockets.delete(userId);
        
        // Notify admins
        io.to('admins').emit('STUDENT_OFFLINE', { userId });
      }
    });

    // Student sends route update
    socket.on("STUDENT_ROUTE", (data) => {
      if (studentStates.has(userId)) {
        studentStates.get(userId).currentRoute = data.route;
        studentStates.get(userId).lastSeen = new Date().toISOString();
        io.to('admins').emit('STUDENT_UPDATE', {
          userId,
          ...studentStates.get(userId),
        });
      }
    });

    // Student sends balance update
    socket.on("STUDENT_BALANCE", (data) => {
      if (studentStates.has(userId)) {
        studentStates.get(userId).balance = data.balance;
        studentStates.get(userId).lastSeen = new Date().toISOString();
        io.to('admins').emit('STUDENT_UPDATE', {
          userId,
          ...studentStates.get(userId),
        });
      }
    });

    // Student sends action (page view, click, etc.)
    socket.on("STUDENT_ACTION", (data) => {
      console.log("STUDENT_ACTION:", data);
      if (studentStates.has(userId)) {
        studentStates.get(userId).lastAction = {
          ...data,
          timestamp: new Date().toISOString(),
        };
        io.to('admins').emit('STUDENT_ACTION', {
          userId,
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Student sends call state update
    socket.on("STUDENT_CALL_STATE", (data) => {
      if (studentStates.has(userId)) {
        studentStates.get(userId).callState = data.state;
        io.to('admins').emit('STUDENT_UPDATE', {
          userId,
          ...studentStates.get(userId),
        });
      }
    });

    // Listen for admin commands (from teacher/admin)
    socket.on("adminCommand", ({ targetUserId, command, data }) => {
      console.log("Received adminCommand:", { targetUserId, command, data });
      if (targetUserId === "all") {
        io.emit(command, data);
      } else if (userSockets.has(targetUserId)) {
        const targetSocket = userSockets.get(targetUserId);
        targetSocket.emit(command, data);
      } else {
        console.warn(`User ${targetUserId} not found for command ${command}`);
      }
    });

    // Direct command to specific student (alternative to adminCommand)
    socket.on("sendToStudent", ({ targetUserId, event, data }) => {
      if (userSockets.has(targetUserId)) {
        const targetSocket = userSockets.get(targetUserId);
        targetSocket.emit(event, data);
        console.log(`Sent ${event} to ${targetUserId}`);
      } else {
        console.warn(`User ${targetUserId} not found`);
      }
    });

    // Handle DTMF input from client
    socket.on("DTMF_INPUT", (data) => {
      console.log("DTMF_INPUT:", data);
      io.to('admins').emit("adminDTMF", { ...data, userId });
    });

    // Handle verification code submission
    socket.on("VERIFY_CODE", (data) => {
      console.log("VERIFY_CODE:", data);
      const expectedCode = "1234";
      if (data.code === expectedCode) {
        socket.emit("CALL_VERIFICATION_SUCCESS", { callId: data.callId });
      } else {
        socket.emit("CALL_VERIFICATION_FAILED", { callId: data.callId });
      }
      io.to('admins').emit("adminVerifyCode", { ...data, userId, success: data.code === expectedCode });
    });

    // Handle call ended by user
    socket.on("CALL_ENDED", (data) => {
      console.log("CALL_ENDED:", data);
      io.to('admins').emit("adminCallEnded", { ...data, userId });
    });

    // Handle modal events
    socket.on("MODAL_CONFIRM", (data) => {
      io.to('admins').emit("adminModalConfirm", { ...data, userId });
    });
    socket.on("MODAL_CANCEL", (data) => {
      io.to('admins').emit("adminModalCancel", { ...data, userId });
    });
    socket.on("MODAL_CLOSED", (data) => {
      io.to('admins').emit("adminModalClosed", { ...data, userId });
    });
  });

  return io;
}

export { initializeSocket };