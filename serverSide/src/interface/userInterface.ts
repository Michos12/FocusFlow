import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
    id: number;
    email: string;
    password: string;
    token_version: number;
    created_at: Date;
}
