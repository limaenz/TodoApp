import { read } from "fs";
import { HttpNotFoundError } from "@server/infra/errors";
import { createClient } from "@supabase/supabase-js";
import { Todo, TodoSchema } from "@server/schema/todo";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface TodoRepositoryGetParams {
    page?: number;
    limit?: number;
}

interface TodoRepositoryGetOutput {
    todos: Todo[];
    total: number;
    pages: number;
}

async function get({
    page,
    limit,
}: TodoRepositoryGetParams = {}): Promise<TodoRepositoryGetOutput> {
    const currentPage = page || 1;
    const currentLimit = limit || 10;
    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = currentPage * currentLimit - 1;

    const { data, error, count } = await supabase
        .from("todos")
        .select("*", {
            count: "exact",
        })
        .range(startIndex, endIndex);

    if (error) throw new Error("Failed to fetch date");

    const parsedData = TodoSchema.array().safeParse(data);

    if (!parsedData.success) {
        throw new Error("Failed to parse TODO from database");
    }

    const todos = parsedData.data;
    const total = count || todos.length;
    const totalPages = Math.ceil(total / currentLimit);

    return {
        todos,
        total,
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
