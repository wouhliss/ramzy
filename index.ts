import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.text());

const port = 3000;

const prisma = new PrismaClient();

app.get("/getRequests", async (req: Request, res: Response) => {
    const requests = await prisma.request.findMany({
        include: {
            headers: true
        }
    });

    res.send(requests);
});

app.get("*", async (req: Request, res: Response) => {

    const request = await prisma.request.create({
        data: {
            url: req.url,
            method: req.method,
            hostname: req.hostname
        }
    });

    for (let [key, value] of Object.entries(req.headers)) {
        if (!value)
            continue;
        if (Array.isArray(value))
            value = value.join(",");

        const header = await prisma.header.create({
            data: {
                key: key,
                value: value
            }
        });

        const updateRequest = await prisma.request.update({
            where: {
                id: request.id
            },
            data: {
                headers: {
                    connect: {
                        id: header.id
                    }
                }
            }
        });
    }

    res.send("ok");
});

app.post("*", async (req: Request, res: Response) => {
    const request = await prisma.request.create({
        data: {
            url: req.url,
            method: req.method,
            hostname: req.hostname,
            body: JSON.stringify(req.body)
        }
    });

    for (let [key, value] of Object.entries(req.headers)) {
        if (!value)
            continue;
        if (Array.isArray(value))
            value = value.join(",");

        const header = await prisma.header.create({
            data: {
                key: key,
                value: value
            }
        });

        const updateRequest = await prisma.request.update({
            where: {
                id: request.id
            },
            data: {
                headers: {
                    connect: {
                        id: header.id
                    }
                }
            }
        });
    }

    res.send("ok");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});