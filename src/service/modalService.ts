import { BehaviorSubject } from 'rxjs'

const modalSubject = new BehaviorSubject(null)

export const modalService = {
  modal$: modalSubject.asObservable(),
  showModal: (content: any) => modalSubject.next(content),
  closeModal: () => modalSubject.next(null),
}
