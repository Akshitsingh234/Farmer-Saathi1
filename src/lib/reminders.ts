
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export const getUpcomingTodos = async (userId: string) => {
  const now = new Date();
  const upcomingTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

  const todosRef = collection(db, `users/${userId}/todos`);
  const q = query(
    todosRef,
    where('dueDate', '==', now.toISOString().split('T')[0]), // Due today
    where('dueTime', '>=', now.toTimeString().split(' ')[0]), // Due from now
    where('dueTime', '<=', upcomingTime.toTimeString().split(' ')[0]) // Due within 15 minutes
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
