import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, MarkEntry, AttendanceEntry, RemarkEntry } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// Helper error handler
enum OperationType {
  CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write'
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error("Firestore Error:", error);
  throw error;
}

export const api = {
  logout: async () => {
    try {
      await signOut(auth);
    } catch(e) {
      console.error(e);
    }
  },
  authTeacher: async (code: string) => {
    return new Promise<{success: boolean; message?: string}>((resolve) => {
      setTimeout(() => {
        if (code === 'Renju') {
          resolve({ success: true });
        } else {
          resolve({ success: false, message: 'Invalid authorization code' });
        }
      }, 500);
    });
  },
  authStudent: async (name: string, standard: string) => {
    try {
      const qs = await getDocs(query(collection(db, 'students'), where('name', '==', name), where('standard', '==', standard)));
      if (qs.empty) {
        return { success: false, message: "Student not found" };
      }
      return { success: true, student: qs.docs[0].data() as Student };
    } catch (e) {
      return { success: false };
    }
  },
  getStudents: async () => {
    try {
      const qs = await getDocs(collection(db, 'students'));
      return qs.docs.map(d => d.data() as Student);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'students');
      return [];
    }
  },
  addStudent: async (name: string, standard: string) => {
    try {
      const newRef = doc(collection(db, 'students'));
      const newStudent: Student = {
        id: newRef.id,
        name,
        standard
      };
      await setDoc(newRef, newStudent);
      return newStudent;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'students');
      throw e;
    }
  },
  deleteStudent: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `students/${id}`);
      throw e;
    }
  },
  getRemarks: async (studentId?: string) => {
    try {
      let q = query(collection(db, 'remarks'));
      if (studentId) {
        q = query(collection(db, 'remarks'), where('studentId', '==', studentId));
      }
      const qs = await getDocs(q);
      return qs.docs.map(d => d.data() as RemarkEntry);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'remarks');
      return [];
    }
  },
  addRemark: async (studentId: string, teacher: string, text: string) => {
    try {
      const newRef = doc(collection(db, 'remarks'));
      const newRemark: RemarkEntry = {
        id: newRef.id,
        studentId,
        teacher,
        text,
        date: new Date().toISOString()
      };
      await setDoc(newRef, newRemark);
      return newRemark;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'remarks');
      throw e;
    }
  },
  deleteRemark: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'remarks', id));
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `remarks/${id}`);
      throw e;
    }
  },
  getMarks: async (studentId?: string) => {
    try {
      let q = query(collection(db, 'marks'));
      if (studentId) {
        q = query(collection(db, 'marks'), where('studentId', '==', studentId));
      }
      const qs = await getDocs(q);
      return qs.docs.map(d => d.data() as MarkEntry);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'marks');
      return [];
    }
  },
  addMark: async (entry: Omit<MarkEntry, 'id'>) => {
    try {
      const newRef = doc(collection(db, 'marks'));
      const newMark: MarkEntry = {
        ...entry,
        id: newRef.id
      };
      await setDoc(newRef, newMark);
      return newMark;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'marks');
      throw e;
    }
  },
  deleteMark: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'marks', id));
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `marks/${id}`);
      throw e;
    }
  },
  getAttendance: async (studentId?: string, month?: string) => {
    try {
      let q = query(collection(db, 'attendance'));
      if (studentId) {
        q = query(collection(db, 'attendance'), where('studentId', '==', studentId));
      }
      const qs = await getDocs(q);
      let records = qs.docs.map(d => d.data() as AttendanceEntry);
      if (month) {
        records = records.filter(r => r.date.startsWith(month));
      }
      return records;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'attendance');
      return [];
    }
  },
  saveAttendance: async (date: string, records: Record<string, 'present'|'absent'>) => {
    try {
      for (const [studentId, status] of Object.entries(records)) {
        const entry: AttendanceEntry = {
          id: `${date}_${studentId}`,
          date,
          studentId,
          status
        };
        await setDoc(doc(db, 'attendance', entry.id), entry);
      }
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'attendance');
      throw e;
    }
  }
};
