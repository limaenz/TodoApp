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
    const { data, error } = await supabase
        .from("todos")
        .insert({ content: content })
        .select();

    if (error) throw new Error("Failed to create by content");

    const parsedData = TodoSchema.safeParse(data[0]);

    if (!parsedData.success) {
        throw new Error("Failed to parse TODO from database");
    }

    return parsedData.data;
}

async function toggleDone(id: string): Promise<Todo> {
    const { data, error } = await supabase.from("todos").select("*");

    if (error) throw new Error("Failed to fetch date");

    const parsedData = TodoSchema.array().safeParse(data);

    if (!parsedData.success) {
        throw new Error("Failed to parse TODO from database");
    }

    const todo = parsedData.data.find((todo) => todo.id === id);

    if (!todo) throw new Error(`Todo with id "${id}" not found`);

    const { data: updateTodo, error: updateError } = await supabase
        .from("todos")
        .update({
            done: !todo.done,
        })
        .eq("id", id)
        .select();

    if (updateError) throw new Error("Failed to update date");

    const parsedDataUpdate = TodoSchema.safeParse(updateTodo[0]);

    if (!parsedDataUpdate.success) {
        throw new Error("Failed to parse TODO from database");
    }

    return parsedDataUpdate.data;
}

async function deleteById(id: string) {
    const { data, error } = await supabase.from("todos").select("*");

    if (error) throw new Error("Failed to fetch date");

    const parsedData = TodoSchema.array().safeParse(data);

    if (!parsedData.success) {
        throw new Error("Failed to parse TODO from database");
    }

    const todo = parsedData.data.find((todo) => todo.id === id);

    if (!todo) throw new HttpNotFoundError(`Todo with id "${id}" not found`);

    await supabase.from("todos").delete().eq("id", id);
}

export const todoRepository = {
    get,
    createdByContent,
    toggleDone,
    deleteById,
};
