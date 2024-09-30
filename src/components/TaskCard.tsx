import { ITaskCard } from './TaskCard.props';
import styles from './TaskCard.module.css'

const TaskCard = ({ task, ...props }: ITaskCard) => {
    return (
        <div className={styles['task-wrapper']}
            {...props}
        >
            <span className={styles.content}>
                {task.title}
            </span>
            <span className={styles.content}>
                {task.priority}
            </span>
        </div>
    );
}

export default TaskCard;