import { read } from "fs";
import { HttpNotFoundError } from "@server/infra/errors";

interface TodoRepositoryGetParams {
    page?: number;
    limit?: number;
}

interface TodoRepositoryGetOutput {
    todos: Todo[];
    total: number;
    pages: number;
}

function get({
    page,
    limit,
}: TodoRepositoryGetParams = {}): TodoRepositoryGetOutput {
    const currentPage = page || 1;
    const currentLimit = limit || 10;

    const todos: Todo[] = [
        { id: "1", content: "Primeira TODO", date: new Date(), done: false },
        { id: "2", content: "Segunda TODO", date: new Date(), done: false },
        { id: "3", content: "Terceira TODO", date: new Date(), done: false },
        { id: "4", content: "Quarto Teste", date: new Date(), done: false },
        { id: "5", content: "Quinto Teste", date: new Date(), done: false },
        { id: "6", content: "Sexto teste", date: new Date(), done: false },
    ];

    const ALL_TODOS = todos;
    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = currentPage * currentLimit;
    const paginatedTodos = ALL_TODOS.slice(startIndex, endIndex);
    const totalPages = Math.ceil(ALL_TODOS.length / currentLimit);

    return {
        total: ALL_TODOS.length,
        todos: paginatedTodos,
        pages: totalPages,
    };
}

async function createdByContent(content: string): Promise<Todo> {
    const newTodo: Todo[] = {
        id: "92bd9592-a610-45e3-b810-373b816910ac",
        content: content,
        date: new Date(),
        done: false,
    };

    return newTodo;
}

async function toggleDone(id: string): Promise<Todo> {
    const ALL_TODOS = read();

    const todo = ALL_TODOS.find((todo) => todo.id === id);

    if (!todo) throw new Error(`Todo with id "${id}" not found`);

    const updatedTodo = update(id, {
        done: !todo.done,
    });

    return updatedTodo;
}

async function deleteById(id: string) {
    const ALL_TODOS = read();
    const todo = ALL_TODOS.find((todo) => todo.id === id);

    if (!todo) throw new HttpNotFoundError(`Todo with id "${id}" not found`);
    dbDeleteById(id);
}

export const todoRepository = {
    get,
    createdByContent,
    toggleDone,
    deleteById,
};

interface Todo {
    id: string;
    content: string;
    date: Date;
    done: boolean;
}
