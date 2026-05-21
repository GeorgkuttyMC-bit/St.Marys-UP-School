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
  saveMark: async (studentId: string, examName: string, subject: string, mark: number, maxMark: number) => {
    try {
      const q = query(
        collection(db, 'marks'),
        where('studentId', '==', studentId)
      );
      const qs = await getDocs(q);

      const existingMark = qs.docs.find(d => {
        const data = d.data();
        return data.examName === examName && data.subject === subject;
      });

      if (!existingMark) {
        const newRef = doc(collection(db, 'marks'));
        const newMark: MarkEntry = {
          id: newRef.id,
          studentId,
          examName: examName as any,
          subject: subject as any,
          mark,
          maxMark
        };
        await setDoc(newRef, newMark);
        return newMark;
      } else {
        const docRef = doc(db, 'marks', existingMark.id);
        await setDoc(docRef, { mark, maxMark }, { merge: true });
        return { ...existingMark.data(), mark, maxMark } as MarkEntry;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'marks');
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
  getAttendance: async (options?: { studentId?: string; month?: string }) => {
    try {
      let q = query(collection(db, 'attendance'));
      if (options?.studentId) {
        q = query(collection(db, 'attendance'), where('studentId', '==', options.studentId));
      }
      const qs = await getDocs(q);
      let records = qs.docs.map(d => d.data() as AttendanceEntry);
      if (options?.month) {
        records = records.filter(r => r.date.startsWith(options.month));
      }
      return records;
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'attendance');
      return [];
    }
  },
  saveAttendance: async (studentId: string, date: string, status: 'present' | 'absent') => {
    try {
      const id = `${date}_${studentId}`;
      const entry: AttendanceEntry = {
        id,
        date,
        studentId,
        status
      };
      await setDoc(doc(db, 'attendance', id), entry);
      return { success: true };
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'attendance');
      throw e;
    }
  }
};
