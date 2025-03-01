import { BehaviorSubject } from 'rxjs'

const drawerSubject = new BehaviorSubject(null)

export const drawerService = {
  drawer$: drawerSubject.asObservable(),
  showDrawer: (content: any) => drawerSubject.next(content),
  closeDrawer: () => drawerSubject.next(null),
}
