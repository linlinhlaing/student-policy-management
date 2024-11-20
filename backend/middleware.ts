import { RequestHandler } from "express";
import { createHmac } from "node:crypto";
import dotenv from 'dotenv';
dotenv.config();


const JWT_SECRET = String(process.env.JWT_SECRET);

export const checkToken: RequestHandler = (req, res, next) => {
    if (!req.headers['authentication']) throw Error('No authentication header');

    const combination = (req.headers['authentication'] as string).split('.');
    const enc_data = combination[0];
    const hash_data = combination[1];
    const hash_data_again = createHmac('sha256', JWT_SECRET).update(enc_data).digest('hex');
    console.log(hash_data_again);
    if (hash_data === hash_data_again) {
        next();
    } else {
        throw Error('Hash do not match');
    }
};