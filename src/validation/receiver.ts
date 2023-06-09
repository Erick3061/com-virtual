import { Type } from "class-transformer";
import { IsBoolean, IsIP, IsIn, IsInt, IsOptional, IsString, IsUrl, Min, ValidateNested } from "class-validator";

export class ReceiverData {

    @ValidateNested()
    @Type(() => COM)
    public com!: COM;

    @IsString()
    public ack!: string;

    @IsInt()
    public attempt!: number;

    @IsString()
    public delimiter!: string;

    @IsString()
    public heartbeat!: string;

    @IsInt()
    public intervalAck!: number;

    @IsInt()
    @Min(1)
    public intervalHeart!: number;

}

class COM {
    @IsInt()
    public baudRate!: number;

    @IsString()
    public path!: string;

    @IsIn([5, 6, 7, 8])
    @IsOptional()
    public databits?: 5 | 6 | 7 | 8;

    @IsInt()
    @IsOptional()
    public highWaterMark?: number;

    @IsIn(["none", "even", "odd", "mark", "space"])
    @IsOptional()
    public parity?: "none" | "even" | "odd" | "mark" | "space";

    @IsBoolean()
    @IsOptional()
    public rtscts?: boolean;

    @IsIn(["handshake", "enable", "toggle"])
    @IsOptional()
    public rtsMode?: "handshake" | "enable" | "toggle";

    @IsIn([1, 2, 1.5])
    @IsOptional()
    public stopBits?: 1 | 2 | 1.5;


}

export class SenderData {

    @IsOptional()
    @IsUrl()
    public ip!: string;

    @IsInt()
    public port!: number;

}