import { HTMLAttributes } from "react"
import { ITask } from "../App"

export interface ITaskCard extends HTMLAttributes<HTMLDivElement> {
    task: ITask,
}