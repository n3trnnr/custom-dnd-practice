import { useEffect, useState } from 'react'
import styles from './App.module.css'
import { useAppDispatch, useAppSelector } from './hooks/StoreHooks'
import { getTasks, taskActions } from './store/taskSlice'
import TaskCard from './components/TaskCard'

export interface ITask {
  id: number,
  title: string,
  priority: string,
  board: number
}

export interface IBoard {
  id: number,
  order: number,
  title: string,
  tasksList: ITask[]
}

function App() {
  const dispatch = useAppDispatch()
  const boards = useAppSelector((state) => state.task.boards)
  // console.log('boards', boards);

  const [currentTask, setCurrentTask] = useState<ITask | null>(null)
  const [currentBoard, setCurrentBoard] = useState<IBoard | null>(null)
  const [endTask, setEndTask] = useState<ITask | null>(null)
  // console.log('currentTask', currentTask);
  // console.log('currentBoard', currentBoard);
  // console.log('endTask useState', endTask);


  useEffect(() => {
    dispatch(getTasks())
  }, [])

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, board: IBoard, task: ITask) => {
    setCurrentTask(task)
    setCurrentBoard(board)

    // const element = event.target as HTMLElement
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    const element = event.target as HTMLElement
    element.style.boxShadow = 'none'
  }

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    const element = event.target as HTMLElement
    element.style.boxShadow = 'none'
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()//Для корректной работы необходимо вызвать preventDefault()
    // console.log('event over', event.target);

    const element = event.target as HTMLElement
    if (element.className.includes('task-wrapper')) {
      element.style.boxShadow = '0 2px 3px gray'
    }
    if (element.tagName === 'SPAN' && element.parentElement) {
      element.parentElement.style.boxShadow = '0 2px 3px gray'
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, endBoard: IBoard, endTask?: ITask) => {
    const element = event.target as HTMLElement
    if (element.tagName === 'SPAN' && element.parentElement) {
      element.parentElement.style.boxShadow = 'none'
    }

    element.style.boxShadow = 'none'

    if (currentBoard && currentTask) {
      dispatch(taskActions.addTaskToBoard({ endBoard, endTask, currentBoard, currentTask }))
    }
  }

  // const sortBoards = (a: IBoard, b: IBoard) => {
  //   if (a.order > b.order) {
  //     return 1
  //   } else {
  //     return -1
  //   }
  // }

  return (
    <main className={styles['app-wrapper']}>
      {boards && boards.map((board) => (//При сортировки необъодимо деструктуризировать boards в новый массив!
        <div
          key={board.id}
          className={styles['board-container']}
          onDragOver={handleDragOver}//Срабатывает в момент нахождения захваченной карточки над другой карточкой, появляется + указывающий на возможность переноса захваченной карточки.
          onDrop={(event) => handleDrop(event, board)}//Получение данных при отпускании курсора, работает вместе в dragOver
        >
          <div>{board.title}</div>
          <div className={styles['board-wrapper']}>
            {board.tasksList.length && board.tasksList.map((task) => (
              <TaskCard
                key={task.id}
                task={task}

                draggable

                onDragStart={(event) => handleDragStart(event, board, task)}//Получение текущей доски и задачи

                onDragLeave={handleDragLeave}//Стилизация при выходе за пределы изначальной карточки
                onDragEnd={handleDragEnd}//Стилизация при выходе за пределы изначальной карточки
                onDragOver={handleDragOver}//Срабатывает в момент нахождения захваченной карточки над другой карточкой, появляется + указывающий на возможность переноса захваченной карточки.
                onDrop={(event) => handleDrop(event, board, task)}
              />
            ))}
          </div>
        </div>
      ))
      }
    </main >
  )
}

export default App
