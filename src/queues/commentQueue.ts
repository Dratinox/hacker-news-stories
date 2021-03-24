import Queue from "bull";
import { DI } from "../server";

export const commentQueue = new Queue("distributeAdvert", process.env.REDIS_URL);

commentQueue.process(async (job) => {
    const { id, kids } = job.data;
    const { hackerNewsService } = DI;

    try {
        const promises = kids.map(async (kid: number) => hackerNewsService.fetchCommentsRecursively(kid, id));
        await Promise.all(promises);
        return Promise.resolve({ sent: true, id });
    } catch (err) {
        return Promise.reject(err);
    }
});
