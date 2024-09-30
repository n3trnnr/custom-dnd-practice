import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IBoard, ITask } from "../App";

const PREFIX = 'http://localhost:3000/tasks'

export const getTasks = createAsyncThunk<ITask[], void>(
    'tasks/getTasks',
    async (_) => {
        const res = await fetch(`${PREFIX}`)
        const data = await res.json()
        return data as ITask[]
    }
)
export const patchTasks = createAsyncThunk<ITask[], { board: number, id: number }>(
    'tasks/patchTasks',
    async ({ board, id }) => {

        const res = await fetch(`${PREFIX}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                board: board
            })
        })
        const data = await res.json()
        return data as ITask[]
    }
)

export interface taskSlice {
    boards: {
        id: number,
        order: number,
        title: string,
        tasksList: ITask[]
    }[]
}

const initialState: taskSlice = {
    boards: [
        {
            id: 1,
            order: 1,
            title: 'to do',
            tasksList: []
        },
        {
            id: 2,
            order: 2,
            title: 'in progress',
            tasksList: []
        },
        {
            id: 3,
            order: 3,
            title: 'done',
            tasksList: []
        },
    ]
}

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addTaskToBoard: (state, action: PayloadAction<{ endBoard: IBoard, endTask?: ITask, currentBoard: IBoard, currentTask: ITask }>) => {
            // console.log('action', action.payload);

            //  # Задача - Перемещение карточек между досками и в рамках одной доски.
            //  # Данные - текущая задача, конечная задача, текущщая доска, конечная доска.

            //  1. Проверка, из какой доски была взяла карточка и в какую перемещается.
            //      1.1. Если карточка перемещается в рамках одной доски:
            //          - Получение ее индекса в массиве
            //          - Получение индекса карточки над которой находится курсор
            //      1.2. Если карточка перемещается в другую доску
            // +  2. Удаление карточки из предыдущей доски.  
            //  3. Добавление карточки в новую доску, предварительно проверив есть ли она уже в этой доске во избежании дублей.

            const boards = [...state.boards];

            // state.boards = boards.map((board) => {

            //     //Удаление карточки из доски
            //     if (board.id === action.payload.currentBoard.id) {
            //         if (action.payload.currentBoard.id === action.payload.endBoard.id) {
            //             return changeElementPosition(board, action.payload)
            //         } else {
            //             const filteredBoard = board.tasksList.filter((i) => {
            //                 return i.id !== action.payload.currentTask.id
            //             })

            //             return { ...board, tasksList: filteredBoard }
            //         }

            //     }

            //     //Добавление карточки в другую доску
            //     if (board.id === action.payload.endBoard.id) {
            //         if (board.tasksList.length === 0) {
            //             board.tasksList.push(action.payload.currentTask)
            //         }

            //         if (board.tasksList.every((task) => task.id !== action.payload.currentTask.id)) {
            //             //Зафиксироваться на этом этапе, добавление задачи под конкретную таску в другой доске.
            //             const res = changeElementPosition(board, action.payload)
            //             // console.log('res', res);

            //             board.tasksList = [...res.tasksList]
            //         }

            //         return board
            //     }
            //     return board
            // })

            //Мой переосмысленный вариант dnd
            state.boards = boards.map((board) => {
                if (board.id === action.payload.endBoard.id && action.payload.currentBoard.id === action.payload.endBoard.id) {
                    if (action.payload.endTask && action.payload.endTask.id !== action.payload.currentTask.id) {
                        // const currentTaskindex = board.tasksList.findIndex((task) => task.id === action.payload.currentTask.id);
                        // const endTaskindex = board.tasksList.findIndex((task) => task.id === action.payload.endTask!.id);

                        const endTask = action.payload.endTask;
                        const taskList = board.tasksList.map((task) => {
                            if (task.id === endTask.id) {
                                return action.payload.currentTask
                            }

                            if (task.id === action.payload.currentTask.id) {
                                return endTask
                            }
                            return task
                        })
                        return { ...board, tasksList: taskList }
                    }
                    return board
                }
                if (board.id === action.payload.currentBoard.id && action.payload.currentBoard.id !== action.payload.endBoard.id) {
                    const filteredBoard = board.tasksList.filter((task) => {
                        return task.id !== action.payload.currentTask.id
                    })
                    return { ...board, tasksList: filteredBoard }
                }

                if (board.id === action.payload.endBoard.id) {
                    if (action.payload.endTask) {
                        const endTask = action.payload.endTask
                        const endTaskindex = board.tasksList.findIndex((task) => task.id === endTask.id)
                        board.tasksList.splice(endTaskindex + 1, 0, action.payload.currentTask)

                        const shiftedElements = { ...board, tasksList: board.tasksList }
                        return shiftedElements
                    }
                    if (board.tasksList.every((task) => task.id !== action.payload.currentTask.id)) {
                        return { ...board, tasksList: [...board.tasksList, action.payload.currentTask] }
                    }
                }

                return board
            })
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTasks.fulfilled, (state, action) => {
                state.boards.forEach((board) => {
                    action.payload.forEach((task) => {
                        if (board.id === task.board && board.tasksList.every(item => item.id !== task.id)) {
                            board.tasksList.push(task)
                        }
                    })
                })
            })
            .addCase(patchTasks.fulfilled, (state, action) => {
                console.log('action patch', action.payload);
            })
    }
})

export const taskActions = taskSlice.actions
export default taskSlice.reducer

function changeElementPosition(board: IBoard, action: { endBoard: IBoard, endTask?: ITask, currentBoard: IBoard, currentTask: ITask }) {
    if (action.endTask) {
        const currentIndex = action.currentBoard.tasksList.indexOf(action.currentTask)
        const endIndex = action.endBoard.tasksList.indexOf(action.endTask)

        // #Задача - добавить task под выделенный элемент, сместив другие элементы ниже по индексу, т.е. их индекс должен быть +2

        if (action.currentBoard.id !== action.endBoard.id) {
            console.log('ok');

            board.tasksList.splice(endIndex + 1, 1, action.currentTask)
            return board
        };

        board.tasksList[currentIndex] = action.endTask
        board.tasksList[endIndex] = action.currentTask

        return board
    }

    // board.tasksList.push(action.currentTask)


    return board;
}