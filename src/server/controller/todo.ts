import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";

async function get(req: NextApiRequest, res: NextApiResponse) {
    const query = req.query;
    const page = Number(query.page);
    const limit = Number(query.limit);

    if (query.page && isNaN(page)) {
        res.status(400).json({
            error: {
                message: "be must a number",
            },
        });
    }

    if (query.limit && isNaN(limit)) {
        res.status(400).json({
            error: {
                message: "be must a number",
            },
        });
    }

    const output = todoRepository.get({ page, limit });

    res.status(200).json({
        total: output.total,
        pages: output.pages,
        todos: output.todos,
    });
}

const TodoCreateBodySchema = schema.object({
    content: schema.string(),
});

async function create(req: NextApiRequest, res: NextApiResponse) {
    // Fail fast validations
    const body = TodoCreateBodySchema.safeParse(req.body);

    // Type Narrowing
    if (!body.success) {
        res.status(400).json({
            error: {
                message: "You need to provide a content to create a TODO",
                description: body.error.issues,
            },
        });
        return;
    }

    const createdTodo = await todoRepository.createdByContent(req.body.content);

    res.status(201).json({
        todo: createdTodo,
    });
}

async function toggleDone(req: NextApiRequest, res: NextApiResponse) {
    const todoId = req.query.id;
    if (!todoId || typeof todoId !== "string") {
        res.status(400).json({
            error: {
                message: "You must to provide a string ID",
            },
        });
        return;
    }

    try {
        const updateTodo = await todoRepository.toggleDone(todoId);

        res.status(200).json({
            todo: updateTodo,
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(404).json({
                error: {
                    message: err.message,
                },
            });
        }
    }
}

export const todoController = {
    get,
    create,
    toggleDone,
};
