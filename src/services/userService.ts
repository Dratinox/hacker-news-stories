import HttpStatusCodes from "http-status-codes";
import { DI } from "../server";
import { User } from "../entities/User";
import { ErrorHandler } from "../middleware/error";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Payload from "../types/Payload";

export default class UserService {
    constructor() {
        this.initTestingUser();
    }

    private async initTestingUser(): Promise<void> {
        const { em } = DI;
        const username = process.env.TEST_USERNAME;

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(process.env.TEST_PASSWORD, salt);

        const userExists = await em.findOne(User, { username });
        if (userExists) {
            return;
        }

        const testUser = em.getRepository(User).create({ username, password });
        await em.persistAndFlush(testUser);
    }

    public async register(username: string, password: string): Promise<string> {
        const { em } = DI;

        const user = await em.findOne(User, { username });
        if (user) {
            throw new ErrorHandler(HttpStatusCodes.BAD_REQUEST, "User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdUser = em.getRepository(User).create({ username, password: hashedPassword });
        await em.persistAndFlush(createdUser);

        const payload: Payload = {
            userId: createdUser.id,
        };

        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    }

    public async findOne(id: number): Promise<User> {
        const { em } = DI;

        const user = await em.findOne(User, { id });
        return user;
    }

    public async login(username: string, password: string): Promise<string> {
        const { em } = DI;

        const user = await em.getRepository(User).findOne({ username });
        if (!user) {
            throw new ErrorHandler(HttpStatusCodes.NOT_FOUND, "User doesn't exist");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ErrorHandler(HttpStatusCodes.UNAUTHORIZED, "Wrong password");
        }

        const payload: Payload = {
            userId: user.id,
        };

        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    }
}
