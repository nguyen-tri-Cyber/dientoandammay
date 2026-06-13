import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, setDoc, Timestamp 
} from "firebase/firestore";

// --- CÁC KIỂU DỮ LIỆU ---
export interface ChatRoom {
  id: string;
  customerId: string;       // FIX: Thêm customerId để Firestore Rules kiểm tra
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: number;
  senderRole: "ADMIN" | "USER"; 
  senderName?: string;
  createdAt: Timestamp;
}

// --- 1. GỬI TIN NHẮN ---
export const sendMessage = async (
  roomId: string,
  text: string,
  sender: { id: number; role: string; name: string; email: string }
) => {
  if (!roomId || !text.trim()) return;

  const normalizedRole = sender.role?.toString().toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

  try {
    await addDoc(collection(db, "chats", roomId, "messages"), {
      text,
      senderId: sender.id,
      senderRole: normalizedRole,
      senderName: sender.name,
      createdAt: serverTimestamp(),
    });

    const roomData: Record<string, unknown> = {
      lastMessage: text,
      updatedAt: serverTimestamp(),
      roomId: roomId,
      // FIX: Lưu customerId vào document để Firestore Rules kiểm tra quyền đọc
      customerId: roomId,
    };

    if (normalizedRole === "USER") {
      roomData.customerName = sender.name;
      roomData.customerEmail = sender.email;
    }

    await setDoc(doc(db, "chats", roomId), roomData, { merge: true });

  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    throw error;
  }
};

// --- 2. LẮNG NGHE DANH SÁCH PHÒNG (Cho Admin/Staff) ---
export const subscribeToChatRooms = (callback: (rooms: ChatRoom[]) => void) => {
  const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data({ serverTimestamps: 'estimate' })
    } as ChatRoom));
    callback(rooms);
  }, (error) => {
    console.error("❌ Lỗi Firestore subscribeToChatRooms:", error);
  });
};

// --- 3. LẮNG NGHE TIN NHẮN TRONG PHÒNG ---
export const subscribeToMessages = (
  roomId: string,
  callback: (msgs: ChatMessage[]) => void
) => {
  if (!roomId) return () => {};

  const q = query(
    collection(db, "chats", roomId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data({ serverTimestamps: 'estimate' })
    } as ChatMessage));
    callback(messages);
  }, (error) => {
    console.error("❌ Lỗi Firestore subscribeToMessages:", error);
  });
};