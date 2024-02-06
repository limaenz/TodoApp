import { HttpNotFoundError } from "@server/infra/errors";
import { Todo, TodoSchema } from "@server/schema/todo";
import { supabase } from "@server/infra/db/supabase";

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

    const { data, error, count } = await supabase()
        .from("todos")
        .select("*", {
            count: "exact",
        })
        .order("date", { ascending: false })
        .range(startIndex, endIndex);

    if (error) throw new Error("Failed to fetch date");

    const parsedData = TodoSchema.array().parse(data);

    const todos = parsedData;
    const total = count || todos.length;
    const totalPages = Math.ceil(total / currentLimit);

    return {
        todos,
        total,
        pages: totalPages,
    };
}

async function createdByContent(content: string): Promise<Todo> {
    const { data, error } = await supabase()
        .from("todos")
        .insert({ content: content })
        .select()
        .single();

    if (error) throw new Error("Failed to create content");

    const parsedData = TodoSchema.parse(data);

    return parsedData;
}

async function getTodoById(id: string): Promise<Todo> {
    const { data, error } = await supabase()
        .from("todos")
        .select()
        .eq("id", id)
        .single();

    if (error) throw new Error("Failed to get todo by id");

    const parsedData = TodoSchema.parse(data);

    return parsedData;
}

async function toggleDone(id: string): Promise<Todo> {
    const todo = await getTodoById(id);

    const { data, error } = await supabase()
        .from("todos")
        .update({
            done: !todo.done,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error("Failed to get todo by id");

    const parsedData = TodoSchema.parse(data);

    return parsedData;
}

async function deleteById(id: string) {
    const { error } = await supabase().from("todos").delete().match({
        id,
    });

    if (error) throw new HttpNotFoundError(`Todo with id "${id}" not found`);
}

export const todoRepository = {
    get,
    createdByContent,
    toggleDone,
    deleteById,
};
