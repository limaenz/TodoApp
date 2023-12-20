import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";

function get(req: NextApiRequest, res: NextApiResponse) {
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

export const todoController = {
    get,
};
