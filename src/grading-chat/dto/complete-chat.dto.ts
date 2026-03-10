import { IsNotEmpty, IsString } from "class-validator";


export class CompleteChatDTO {
    @IsString()
    @IsNotEmpty()
    clinicalNote: string;
}